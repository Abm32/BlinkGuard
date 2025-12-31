/**
 * Safety analysis service for API
 */

import { SafetyAnalysis, TransactionSimulation } from '../../../shared/types.js';
import { analyzeTransactionSafety } from '../../../shared/safetyEngine.js';

/**
 * Analyzes a transaction for safety
 */
export async function analyzeTransaction(
  transactionData: TransactionSimulation,
  domain?: string
): Promise<SafetyAnalysis> {
  return analyzeTransactionSafety(transactionData, domain || 'unknown');
}

