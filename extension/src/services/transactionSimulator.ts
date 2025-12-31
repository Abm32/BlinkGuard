/**
 * Transaction simulation service using Solana RPC
 */

import { Connection, VersionedTransaction } from '@solana/web3.js';
import { TransactionSimulation } from '../../../shared/types.js';

let connection: Connection | null = null;

/**
 * Gets or creates a Solana RPC connection
 */
function getConnection(): Connection {
  if (!connection) {
    // Get RPC endpoint from storage or use default
    chrome.storage.local.get(['rpcEndpoint'], (result) => {
      const endpoint = result.rpcEndpoint || 'https://api.mainnet-beta.solana.com';
      connection = new Connection(endpoint, 'confirmed');
    });
    // Fallback to default if storage is slow
    if (!connection) {
      connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    }
  }
  return connection;
}

/**
 * Fetches unsigned transaction from Action API
 */
async function fetchTransaction(actionUrl: string): Promise<VersionedTransaction | null> {
  try {
    // Try GET first (some Solana Action APIs support it)
    let response = await fetch(actionUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).catch(() => null);
    
    // If GET fails or returns error, try POST
    if (!response || !response.ok) {
      response = await fetch(actionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          account: null // Some APIs require this field
        })
      });
    }

    if (!response.ok) {
      const statusText = response.statusText || `HTTP ${response.status}`;
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        // Ignore if can't read body
      }
      throw new Error(`Failed to fetch transaction: ${statusText}${errorBody ? ` - ${errorBody.substring(0, 100)}` : ''}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (data.transaction) {
      const txBuffer = Buffer.from(data.transaction, 'base64');
      return VersionedTransaction.deserialize(txBuffer);
    } else if (data.body) {
      // Some APIs return transaction in 'body' field
      const txBuffer = Buffer.from(data.body, 'base64');
      return VersionedTransaction.deserialize(txBuffer);
    } else if (typeof data === 'string') {
      // Some APIs return base64 string directly
      const txBuffer = Buffer.from(data, 'base64');
      return VersionedTransaction.deserialize(txBuffer);
    }

    console.warn('BlinkGuard: Transaction data not found in response format:', Object.keys(data));
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('BlinkGuard: Error fetching transaction from', actionUrl, ':', errorMessage);
    return null;
  }
}

/**
 * Simulates a transaction using Solana RPC
 */
export async function simulateTransaction(actionUrl: string): Promise<TransactionSimulation> {
  try {
    const transaction = await fetchTransaction(actionUrl);
    if (!transaction) {
      return {
        success: false,
        logs: [],
        balanceChanges: [],
        error: 'Failed to fetch transaction'
      };
    }

    const conn = getConnection();
    
    // Simulate transaction
    const simulation = await conn.simulateTransaction(transaction, {
      replaceRecentBlockhash: true,
      sigVerify: false
    });

    if (simulation.value.err) {
      return {
        success: false,
        logs: simulation.value.logs || [],
        balanceChanges: [],
        error: JSON.stringify(simulation.value.err)
      };
    }

    // Extract balance changes from simulation response
    // Solana's simulateTransaction returns preBalances and postBalances arrays
    const balanceChanges = extractBalanceChanges(
      transaction,
      simulation.value.preBalances || [],
      simulation.value.postBalances || []
    );

    return {
      success: true,
      logs: simulation.value.logs || [],
      balanceChanges,
      error: undefined
    };
  } catch (error) {
    console.error('Transaction simulation error:', error);
    return {
      success: false,
      logs: [],
      balanceChanges: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extracts balance changes from simulation response
 * This is the correct way: Solana's simulateTransaction returns preBalances and postBalances arrays
 * that correspond to the accounts in the transaction
 * 
 * The simulation response structure:
 * {
 *   value: {
 *     preBalances: [100000000000, 0, ...],  // Pre-balances in lamports
 *     postBalances: [5000000, 99995000000, ...],  // Post-balances in lamports
 *     accounts: [...],  // Account info (optional)
 *     logs: [...]
 *   }
 * }
 */
function extractBalanceChanges(
  transaction: VersionedTransaction,
  preBalances: number[],
  postBalances: number[]
): TransactionSimulation['balanceChanges'] {
  const changes: TransactionSimulation['balanceChanges'] = [];
  
  // Get account keys from the transaction message
  try {
    const accountKeys = transaction.message.getAccountKeys();
    
    // Match each account with its pre and post balance
    // The preBalances and postBalances arrays are indexed by account position in the transaction
    // This is the "Spot the Difference" approach described in the documentation
    for (let i = 0; i < accountKeys.length && i < preBalances.length && i < postBalances.length; i++) {
      const account = accountKeys.get(i)?.toBase58() || `account_${i}`;
      const preBalance = preBalances[i];
      const postBalance = postBalances[i];
      const change = postBalance - preBalance;
      
      // Only include accounts with actual balance changes (or significant balances)
      // This filters out program accounts and signers with no balance
      // We include accounts with any balance > 0 or any change to catch all transfers
      if (change !== 0 || preBalance > 0 || postBalance > 0) {
        changes.push({
          account,
          preBalance,
          postBalance,
          change
        });
      }
    }
  } catch (error) {
    console.warn('BlinkGuard: Error extracting account keys from transaction:', error);
    // Fallback: create changes from arrays without account keys
    // This still works for drainer detection (we just don't have account addresses)
    for (let i = 0; i < preBalances.length && i < postBalances.length; i++) {
      const preBalance = preBalances[i];
      const postBalance = postBalances[i];
      const change = postBalance - preBalance;
      
      if (change !== 0 || preBalance > 0 || postBalance > 0) {
        changes.push({
          account: `account_${i}`, // Fallback account identifier
          preBalance,
          postBalance,
          change
        });
      }
    }
  }

  return changes;
}

