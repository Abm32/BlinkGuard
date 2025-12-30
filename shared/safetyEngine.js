/**
 * Safety analysis engine - determines if a transaction is safe
 * Shared between extension and API
 */
import { SafetyLevel } from './types';
import { DRAINER_THRESHOLD, HIGH_TRANSFER_THRESHOLD, CAUTION_THRESHOLD } from './constants';
/**
 * Analyzes transaction safety based on simulation results
 */
export async function analyzeTransactionSafety(simulation, domain) {
    const flags = [];
    const reasons = [];
    let score = 100;
    // Check 1: Balance transfer analysis
    const balanceAnalysis = analyzeBalanceTransfers(simulation.balanceChanges);
    if (balanceAnalysis.isDrainer) {
        flags.push({
            type: 'drainer',
            severity: 'critical',
            description: `Transaction transfers ${(balanceAnalysis.percentage * 100).toFixed(1)}% of balance`
        });
        reasons.push(`High balance transfer detected: ${balanceAnalysis.percentage * 100}%`);
        score -= 50;
    }
    else if (balanceAnalysis.percentage > HIGH_TRANSFER_THRESHOLD) {
        flags.push({
            type: 'high_transfer',
            severity: 'high',
            description: `Transaction transfers ${(balanceAnalysis.percentage * 100).toFixed(1)}% of balance`
        });
        reasons.push(`Significant balance transfer: ${balanceAnalysis.percentage * 100}%`);
        score -= 30;
    }
    else if (balanceAnalysis.percentage > CAUTION_THRESHOLD) {
        flags.push({
            type: 'high_transfer',
            severity: 'medium',
            description: `Transaction transfers ${(balanceAnalysis.percentage * 100).toFixed(1)}% of balance`
        });
        reasons.push(`Moderate balance transfer: ${balanceAnalysis.percentage * 100}%`);
        score -= 15;
    }
    // Check 2: Approval analysis
    const approvalAnalysis = analyzeApprovals(simulation.logs);
    if (approvalAnalysis.hasSuspiciousApproval) {
        flags.push({
            type: 'approval',
            severity: approvalAnalysis.severity,
            description: approvalAnalysis.description
        });
        reasons.push(approvalAnalysis.description);
        score -= approvalAnalysis.severity === 'critical' ? 40 : 20;
    }
    // Check 3: Unknown contract analysis
    const contractAnalysis = analyzeContracts(simulation.logs, domain);
    if (contractAnalysis.hasUnknownContract) {
        flags.push({
            type: 'unknown_contract',
            severity: 'medium',
            description: 'Transaction interacts with unknown or unverified contract'
        });
        reasons.push('Unknown contract detected');
        score -= 10;
    }
    // Check 4: Domain trust (basic heuristic)
    const domainTrust = analyzeDomainTrust(domain);
    if (!domainTrust.isTrusted) {
        flags.push({
            type: 'domain_risk',
            severity: 'low',
            description: `Domain ${domain} has limited trust signals`
        });
        reasons.push('Domain trust check failed');
        score -= 5;
    }
    // Determine safety level
    let level;
    if (score >= 80) {
        level = SafetyLevel.SAFE;
    }
    else if (score >= 50) {
        level = SafetyLevel.CAUTION;
    }
    else if (score >= 20) {
        level = SafetyLevel.HIGH_RISK;
    }
    else {
        level = SafetyLevel.HIGH_RISK;
    }
    return {
        level,
        score: Math.max(0, Math.min(100, score)),
        flags,
        reasons,
        transactionSimulation: simulation
    };
}
function analyzeBalanceTransfers(balanceChanges) {
    if (balanceChanges.length === 0) {
        return { isDrainer: false, percentage: 0, totalTransferred: 0 };
    }
    // Find the largest balance change (likely the user's account)
    const userAccountChange = balanceChanges.reduce((max, change) => {
        return Math.abs(change.change) > Math.abs(max.change) ? change : max;
    }, balanceChanges[0]);
    const totalTransferred = Math.abs(userAccountChange.change);
    const preBalance = userAccountChange.preBalance;
    const percentage = preBalance > 0 ? totalTransferred / preBalance : 0;
    return {
        isDrainer: percentage >= DRAINER_THRESHOLD,
        percentage,
        totalTransferred
    };
}
function analyzeApprovals(logs) {
    // Check for token approval operations
    const approvalKeywords = ['approve', 'setAuthority', 'authorize'];
    const suspiciousPatterns = [
        /approve.*unlimited/i,
        /approve.*max/i,
        /approve.*0xffff/i
    ];
    for (const log of logs) {
        const lowerLog = log.toLowerCase();
        // Check for approval keywords
        if (approvalKeywords.some(keyword => lowerLog.includes(keyword))) {
            // Check for suspicious patterns
            if (suspiciousPatterns.some(pattern => pattern.test(log))) {
                return {
                    hasSuspiciousApproval: true,
                    severity: 'critical',
                    description: 'Unlimited or suspicious token approval detected'
                };
            }
            return {
                hasSuspiciousApproval: true,
                severity: 'medium',
                description: 'Token approval operation detected'
            };
        }
    }
    return {
        hasSuspiciousApproval: false,
        severity: 'low',
        description: ''
    };
}
function analyzeContracts(logs, domain) {
    // Extract program IDs from logs
    const programIds = new Set();
    const programPattern = /Program\s+([A-Za-z0-9]{32,44})/g;
    for (const log of logs) {
        let match;
        while ((match = programPattern.exec(log)) !== null) {
            programIds.add(match[1]);
        }
    }
    // Known trusted programs (can be expanded)
    const trustedPrograms = [
        'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
        'hadeK9DLv9eA7ya5KCTqSvSvRZeJC3JgD5a9Y3CNbvu', // Helium
        // Add more trusted programs
    ];
    const unknownContracts = Array.from(programIds).filter(id => !trustedPrograms.includes(id));
    return {
        hasUnknownContract: unknownContracts.length > 0,
        contracts: unknownContracts
    };
}
function analyzeDomainTrust(domain) {
    const reasons = [];
    let isTrusted = true;
    // Check for known trusted domains
    const trustedDomains = [
        'jup.ag',
        'helium.com',
        'dialect.to',
        'solana.com'
    ];
    if (!trustedDomains.some(trusted => domain.includes(trusted))) {
        // Check domain age (would need additional API call)
        // For now, just flag as potentially untrusted
        reasons.push('Domain not in trusted list');
        isTrusted = false;
    }
    return { isTrusted, reasons };
}
//# sourceMappingURL=safetyEngine.js.map