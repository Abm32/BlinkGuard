# BlinkGuard Technical Architecture

## RPC Simulation Cost Management

### Current Approach

BlinkGuard uses Solana's public RPC endpoints for transaction simulation. The `simulateTransaction` RPC method is free to use on public endpoints, but has rate limits. Our implementation includes:

1. **Fallback Chain**: Multiple RPC endpoints with automatic failover
2. **Local Caching**: Registry checks happen before simulation to avoid unnecessary RPC calls
3. **Efficient Batching**: Multiple Blinks on the same page are analyzed sequentially to respect rate limits
4. **User-Configurable Endpoints**: Users can provide their own RPC endpoint if they have higher rate limits

### Cost Structure

- **Public RPC Endpoints**: Free but rate-limited (~40 requests/second)
- **Private RPC Providers**: Optional, users can configure (Helius, QuickNode, etc.)
- **Registry API**: Self-hosted, minimal infrastructure costs

### Scaling Strategy

As adoption grows, we will:

1. **Implement Request Queuing**: Batch simulation requests to maximize RPC efficiency
2. **Cache Simulation Results**: Store results for identical transactions to avoid re-simulation
3. **Partner with RPC Providers**: Negotiate higher rate limits for public good projects
4. **Distribute Load**: Use multiple RPC endpoints in round-robin fashion

### Future: On-Chain Registry

Long-term, we plan to move the registry to an on-chain program (Solana program) to:
- Eliminate API hosting costs
- Enable decentralized verification
- Allow community governance of malicious URL flags

## Transaction Simulation Flow

```
User Scrolls Twitter → DOM Observer Detects Blink
    ↓
Extract Blink Metadata (URL, domain, action URL)
    ↓
Check Local Registry Cache (fast, no RPC call)
    ↓
If not cached → Check Remote Registry API
    ↓
If not in registry → Fetch Transaction from Action API (GET request)
    ↓
Simulate Transaction via Solana RPC (simulateTransaction)
    ↓
Parse Simulation Logs for Balance Changes
    ↓
Run Safety Heuristics Analysis
    ↓
Inject Safety Overlay (Green/Yellow/Red)
```

## Safety Heuristics Implementation

### 1. Balance Transfer Detection

```typescript
// Pseudocode
function analyzeBalanceTransfer(balanceChanges) {
  const userAccount = findLargestBalanceChange(balanceChanges);
  const percentage = userAccount.change / userAccount.preBalance;
  
  if (percentage >= 0.9) return DRAINER;
  if (percentage >= 0.5) return HIGH_RISK;
  if (percentage >= 0.1) return CAUTION;
  return SAFE;
}
```

### 2. Approval Risk Detection

Scans simulation logs for:
- Token approval operations
- Unlimited approval patterns (`approve max`, `approve 0xffff`)
- Authority changes

### 3. Contract Verification

- Extracts program IDs from simulation logs
- Checks against whitelist of trusted programs (Jupiter, Helium, etc.)
- Flags unknown contracts

### 4. Domain Trust Scoring

- Checks domain against trusted list
- Validates SSL certificate (future)
- Checks domain age via WHOIS (future)

## Registry Architecture

### Data Structure

```json
{
  "url": "https://malicious-site.com/action",
  "domain": "malicious-site.com",
  "reason": "Drainer detected - transfers 95% of balance",
  "reportedBy": "user_wallet_address",
  "reportedAt": 1234567890,
  "verified": true
}
```

### Verification Workflow

1. User reports malicious URL → Stored as `verified: false`
2. Admin reviews report
3. Admin verifies entry → `verified: true`
4. Verified entries block transactions immediately
5. Unverified entries show as "Caution" but don't block

### Decentralization Path

Phase 1 (Current): Centralized API with open-source code
Phase 2 (Future): On-chain Solana program for registry
Phase 3 (Future): DAO governance for verification

## Performance Metrics

### Target Performance

- **Detection Latency**: <400ms (Solana RPC simulation time)
- **UI Injection**: <100ms after analysis complete
- **Registry Check**: <50ms (local cache) or <200ms (API)
- **Memory Usage**: <50MB extension overhead

### Optimization Techniques

1. **Debounced DOM Observation**: Wait 300ms after scroll stops before scanning
2. **Lazy Analysis**: Only analyze Blinks visible in viewport
3. **Result Caching**: Cache analysis results for identical Blinks
4. **Background Processing**: Analysis happens in background worker, non-blocking

## Security Model

### Threat Model

1. **Malicious Blinks**: Primary threat - drainer transactions
2. **Registry Poisoning**: Mitigated by verification requirement
3. **RPC Endpoint Attacks**: Mitigated by fallback chain
4. **Extension Tampering**: Mitigated by Chrome Web Store review

### Defense Mechanisms

1. **Multi-Layer Analysis**: Registry + Simulation + Heuristics
2. **Community Verification**: Multiple reports required for auto-verification
3. **Open Source Audit**: All code publicly auditable
4. **No Wallet Access**: Extension never touches user wallets

## Integration Points

### Solana Action API

BlinkGuard integrates with the standard Solana Action API:
- Fetches `actions.json` metadata
- POSTs to action URL to get unsigned transaction
- Respects Action API response format

### Wallet Integration (Future)

- Wallet providers can integrate BlinkGuard API
- Pre-transaction safety checks
- Customizable safety thresholds

## Deployment Architecture

### Extension Distribution

- **Chrome Web Store**: Primary distribution channel
- **GitHub Releases**: For developers and beta testers
- **Self-Hosting**: Users can build from source

### API Deployment

- **Initial**: Self-hosted on VPS/cloud provider
- **Future**: Distributed via IPFS or on-chain program
- **CDN**: Static registry data cached globally

## Monitoring & Analytics

### Metrics Tracked

- Number of Blinks analyzed per day
- Safety level distribution (Safe/Caution/High Risk)
- Registry hit rate (cached vs API)
- RPC endpoint performance
- User reports submitted

### Privacy

- No wallet addresses stored
- No transaction signatures logged
- Aggregated statistics only
- User opt-in for analytics

## Roadmap

### Milestone 1: Core Engine (Current)
- ✅ DOM observer
- ✅ Transaction simulation
- ✅ Basic safety heuristics
- ✅ UI overlay injection

### Milestone 2: Safety Heuristics & Registry
- ✅ Advanced drainer detection
- ✅ Approval risk analysis
- ✅ Community registry
- ⏳ Registry verification workflow

### Milestone 3: Public Launch
- ⏳ Chrome Web Store publication
- ⏳ Full open-source release
- ⏳ Documentation site
- ⏳ Community features

### Future Enhancements
- On-chain registry program
- Machine learning models
- Multi-chain support
- Wallet provider SDK

