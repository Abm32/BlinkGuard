/**
 * Shared constants for BlinkGuard
 */
export declare const SOLANA_ACTION_PREFIX = "solana-action:";
export declare const ACTION_QUERY_PARAM = "action";
export declare const DRAINER_THRESHOLD = 0.9;
export declare const HIGH_TRANSFER_THRESHOLD = 0.5;
export declare const CAUTION_THRESHOLD = 0.1;
export declare const DEFAULT_RPC_ENDPOINTS: string[];
export declare const SCORE_WEIGHTS: {
    balanceTransfer: number;
    approvalRisk: number;
    domainTrust: number;
    registryMatch: number;
};
export declare const SAFETY_COLORS: {
    safe: string;
    caution: string;
    high_risk: string;
    unknown: string;
};
//# sourceMappingURL=constants.d.ts.map