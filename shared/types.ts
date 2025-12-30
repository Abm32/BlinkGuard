/**
 * Shared types for BlinkGuard extension and API
 */

export enum SafetyLevel {
  SAFE = 'safe',
  CAUTION = 'caution',
  HIGH_RISK = 'high_risk',
  UNKNOWN = 'unknown'
}

export interface BlinkMetadata {
  url: string;
  domain: string;
  actionUrl: string;
  timestamp: number;
}

export interface TransactionSimulation {
  success: boolean;
  logs: string[];
  balanceChanges: BalanceChange[];
  error?: string;
}

export interface BalanceChange {
  account: string;
  preBalance: number;
  postBalance: number;
  change: number;
}

export interface SafetyAnalysis {
  level: SafetyLevel;
  score: number; // 0-100, higher is safer
  flags: SafetyFlag[];
  reasons: string[];
  transactionSimulation?: TransactionSimulation;
}

export interface SafetyFlag {
  type: 'drainer' | 'approval' | 'unknown_contract' | 'high_transfer' | 'flagged_address' | 'domain_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface MaliciousUrlEntry {
  url: string;
  domain: string;
  reason: string;
  reportedBy: string;
  reportedAt: number;
  verified: boolean;
}

export interface ActionMetadata {
  label: string;
  icon?: string;
  description?: string;
  url: string;
}

