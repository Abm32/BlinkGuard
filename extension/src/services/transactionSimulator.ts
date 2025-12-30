/**
 * Transaction simulation service using Solana RPC
 */

import { Connection, VersionedTransaction } from '@solana/web3.js';
import { TransactionSimulation } from '../../../shared/types';

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
    // POST to action URL to get transaction
    const response = await fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Standard Solana Action API request
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse transaction from response
    // Format depends on Action API spec
    if (data.transaction) {
      const txBuffer = Buffer.from(data.transaction, 'base64');
      return VersionedTransaction.deserialize(txBuffer);
    }

    return null;
  } catch (error) {
    console.error('Error fetching transaction:', error);
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

    // Parse balance changes from logs
    const balanceChanges = parseBalanceChanges(simulation.value.logs || []);

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
 * Parses balance changes from simulation logs
 */
function parseBalanceChanges(logs: string[]): TransactionSimulation['balanceChanges'] {
  const changes: TransactionSimulation['balanceChanges'] = [];
  
  // Solana logs contain balance change information
  // Format: "Program log: <account> <preBalance> <postBalance>"
  for (const log of logs) {
    const balanceMatch = log.match(/balance:\s*(\d+)\s*->\s*(\d+)/i);
    if (balanceMatch) {
      const preBalance = parseInt(balanceMatch[1], 10);
      const postBalance = parseInt(balanceMatch[2], 10);
      const change = postBalance - preBalance;
      
      // Try to extract account from log
      const accountMatch = log.match(/account:\s*([A-Za-z0-9]{32,44})/i);
      const account = accountMatch ? accountMatch[1] : 'unknown';
      
      changes.push({
        account,
        preBalance,
        postBalance,
        change
      });
    }
  }

  return changes;
}

