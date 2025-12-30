/**
 * Safety analysis service for API
 */

import { SafetyAnalysis, TransactionSimulation } from '../../../shared/types';
import { analyzeTransactionSafety } from '../../../shared/safetyEngine';

/**
 * Analyzes a transaction for safety
 */
export async function analyzeTransaction(
  transactionData: TransactionSimulation,
  domain?: string
): Promise<SafetyAnalysis> {
  return analyzeTransactionSafety(transactionData, domain || 'unknown');
}

