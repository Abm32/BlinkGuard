/**
 * Shared constants for BlinkGuard
 */
export const SOLANA_ACTION_PREFIX = 'solana-action:';
export const ACTION_QUERY_PARAM = 'action';
// Safety thresholds
export const DRAINER_THRESHOLD = 0.9; // 90% of balance
export const HIGH_TRANSFER_THRESHOLD = 0.5; // 50% of balance
export const CAUTION_THRESHOLD = 0.1; // 10% of balance
// RPC endpoints (fallback chain)
export const DEFAULT_RPC_ENDPOINTS = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana'
];
// Safety score weights
export const SCORE_WEIGHTS = {
    balanceTransfer: 0.4,
    approvalRisk: 0.3,
    domainTrust: 0.2,
    registryMatch: 0.1
};
// UI overlay colors
export const SAFETY_COLORS = {
    safe: '#10b981', // green
    caution: '#f59e0b', // yellow
    high_risk: '#ef4444', // red
    unknown: '#6b7280' // gray
};
//# sourceMappingURL=constants.js.map