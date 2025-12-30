# BlinkGuard Architecture

## Overview

BlinkGuard consists of three main components:
1. **Browser Extension** (Chrome/Brave)
2. **API Service** (Node.js/Express)
3. **Shared Library** (TypeScript modules)

## Component Details

### Browser Extension

**Location**: `extension/`

#### Content Script (`content.ts`)
- Runs on Twitter/X pages
- Observes DOM mutations to detect new Blinks
- Extracts Blink metadata from URLs
- Requests safety analysis from background worker
- Injects safety overlays onto Blink elements

#### Background Worker (`background.ts`)
- Service worker for extension
- Handles message passing between content script and extension
- Manages registry synchronization
- Coordinates transaction analysis

#### Services

**Transaction Simulator** (`services/transactionSimulator.ts`)
- Fetches unsigned transactions from Action APIs
- Simulates transactions via Solana RPC
- Parses balance changes from simulation logs

**Registry Service** (`services/registry.ts`)
- Checks URLs against local and remote registries
- Caches registry entries locally
- Handles malicious URL reporting

**Safety Engine** (`services/safetyEngine.ts`)
- Re-exports shared safety analysis logic

#### Utilities

**Blink Detector** (`utils/blinkDetector.ts`)
- Detects `solana-action:` protocol URLs
- Finds action query parameters
- Extracts metadata from Blink elements

**UI Injection** (`utils/uiInjection.ts`)
- Creates and positions safety overlays
- Manages overlay lifecycle
- Applies safety level styling

### API Service

**Location**: `api/`

#### Server (`server.ts`)
- Express.js REST API
- Endpoints:
  - `GET /health` - Health check
  - `GET /registry/check` - Check if URL is malicious
  - `GET /registry/latest` - Get full registry
  - `POST /registry/report` - Report malicious URL
  - `POST /analyze` - Analyze transaction safety

#### Services

**Registry Service** (`services/registryService.ts`)
- File-based registry storage (JSON)
- CRUD operations for malicious URLs
- Verification workflow

**Safety Service** (`services/safetyService.ts`)
- Wraps shared safety engine for API use

### Shared Library

**Location**: `shared/`

#### Types (`types.ts`)
- TypeScript interfaces and enums
- Shared across extension and API

#### Constants (`constants.ts`)
- Safety thresholds
- RPC endpoints
- UI colors

#### Safety Engine (`safetyEngine.ts`)
- Core safety analysis logic
- Balance transfer analysis
- Approval detection
- Contract verification
- Domain trust scoring

## Data Flow

### Blink Detection Flow

1. User scrolls Twitter/X feed
2. Content script observes DOM mutations
3. Blink detector finds `solana-action:` URLs
4. Metadata extracted (URL, domain, action URL)
5. Transaction simulation requested
6. Background worker coordinates analysis
7. Safety overlay injected with result

### Transaction Analysis Flow

1. Content script requests analysis
2. Background worker checks registry first
3. If not in registry, fetches transaction from Action API
4. Simulates transaction via Solana RPC
5. Safety engine analyzes simulation results
6. Returns safety level and score
7. Overlay updated with result

### Registry Flow

1. User reports malicious Blink
2. Extension sends report to API
3. API stores in registry (unverified)
4. Admin verifies entry
5. Registry synced to all clients
6. Future checks match against verified entries

## Safety Heuristics

### Balance Transfer Analysis
- **Drainer**: >90% of balance transferred
- **High Risk**: >50% of balance transferred
- **Caution**: >10% of balance transferred

### Approval Detection
- Token approval operations flagged
- Unlimited approvals = critical risk
- Standard approvals = medium risk

### Contract Verification
- Unknown program IDs flagged
- Trusted programs whitelist
- Domain-based trust signals

### Domain Trust
- Known trusted domains (Jupiter, Helium, etc.)
- SSL certificate validation
- Domain age (future enhancement)

## Security Considerations

1. **RPC Endpoint Security**: Uses public Solana RPC endpoints with fallbacks
2. **Registry Verification**: Unverified reports don't block transactions
3. **Privacy**: No user wallet addresses stored
4. **Open Source**: All logic auditable by community

## Performance Optimizations

1. **Local Registry Cache**: Reduces API calls
2. **Debounced DOM Observation**: Prevents excessive scans
3. **Background Simulation**: Non-blocking analysis
4. **Registry Sync**: Periodic updates (every 6 hours)

## Future Enhancements

- [ ] Machine learning for drainer detection
- [ ] On-chain reputation system
- [ ] Multi-chain support
- [ ] Wallet integration
- [ ] Real-time threat intelligence

