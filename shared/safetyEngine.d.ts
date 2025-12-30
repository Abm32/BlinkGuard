/**
 * Safety analysis engine - determines if a transaction is safe
 * Shared between extension and API
 */
import { SafetyAnalysis, TransactionSimulation } from './types';
/**
 * Analyzes transaction safety based on simulation results
 */
export declare function analyzeTransactionSafety(simulation: TransactionSimulation, domain: string): Promise<SafetyAnalysis>;
//# sourceMappingURL=safetyEngine.d.ts.map