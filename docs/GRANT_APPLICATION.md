# BlinkGuard: The Open-Source Safety Layer for Solana Actions

**Applicant Name:** Abhimanyu R B  
**Project Type:** Developer Tooling / Infrastructure  
**Total Grant Request:** $30,000 USD  
**Repository:** https://github.com/Abm32/BlinkGuard  
**Website/Demo:** https://blinkguard.abhimanyurb.com/

---

## 1. Overview of Ecosystem Impact

### The Problem

The introduction of Solana Actions and Blinks (Blockchain Links) transforms any web surface into a transaction interface. While this unlocks massive distribution for developers, it introduces significant "blind signing" risks for users. Currently, developers building Blinks face a trust barrier: users are hesitant to interact with "Donate" or "Mint" buttons on social feeds due to the prevalence of wallet drainers.

### The Public Good

BlinkGuard serves as a critical Public Good by providing the necessary safety infrastructure for the Blinks ecosystem to mature.

- **For Users**: It provides immediate, pre-click safety analysis, preventing drainer attacks before a wallet is even connected.
- **For Developers**: We are building the Open Malicious URL Registry. This is a shared, community-maintained database of flagged Action URLs and drainer program IDs. Any Solana developer (wallet builder, dApp frontend, or aggregator) can query our open API to instantly protect their own users.

By solving the security problem, we lower the barrier to entry for users, directly increasing the adoption and conversion rates for all legitimate developers building Solana Actions.

---

## 2. Product Design

### Architecture Overview

BlinkGuard operates on a privacy-first "Client-Server" architecture designed to minimize RPC load while maximizing detection speed.

#### Component A: The Browser Extension (Client)

**Role:** Acts as the passive interception layer.

**Current Implementation (POC):**
- TypeScript-based Chrome Extension (Manifest V3)
- Content script with MutationObserver for DOM monitoring
- Background service worker for coordination
- Transaction simulation engine integrated

**Planned Migration:**
- Plasmo Framework (React/TypeScript) for improved developer experience
- TailwindCSS for modern, responsive UI

**Workflow:**
1. Uses a MutationObserver to detect `solana-action:` protocols or Blink identifiers in the DOM (targeted at X.com/Twitter and dial.to)
2. Extracts the Action URL and performs a local regex check against a "Quick Blocklist"
3. If the URL passes local checks, it queries the BlinkGuard API for deep analysis
4. Injects a visual overlay (Green Shield / Yellow Caution / Red Warning) into the DOM based on the API response

#### Component B: The Simulation & Registry API (Server)

**Role:** The core decision engine.

**Current Implementation (POC):**
- Express.js/Node.js REST API
- File-based JSON registry storage
- Transaction simulation via Solana RPC
- Safety analysis engine with heuristic checks

**Planned Migration:**
- Next.js Serverless Functions for scalable API endpoints
- Rust (Axum) alternative implementation for high-throughput simulation handling
- PostgreSQL for persistent registry storage
- Redis for caching layer (TTL: 1 hour) to reduce RPC costs on viral links

**Workflow:**
1. **Fetch**: Retrieves the unsigned transaction from the Action provider
2. **Simulate**: Executes a `simulateTransaction` call against a Solana RPC node (Cluster: Mainnet-Beta)
3. **Analyze**: Parses simulation logs for heuristic red flags:
   - **Asset Diff Analysis**: Checks if >90% of SOL/SPL balance is transferred (drainer pattern)
   - **Authority Checks**: Flags SetAuthority instructions on token accounts
   - **Program Verification**: Cross-references invoked Program IDs against the BlinkGuard "Trusted Registry" (e.g., Jupiter, Helium, verified SPL contracts)
   - **Domain Trust**: Validates SSL certificates and domain reputation
4. **Cache**: Stores results in Redis (TTL: 1 hour) to serve subsequent requests for viral links without incurring RPC costs

### Technology Stack

**Current Implementation (POC):**
- **Frontend/Extension**: TypeScript, Chrome Extension Manifest V3
- **Backend API**: Express.js/Node.js
- **Database**: File-based JSON registry
- **Infrastructure**: Public Solana RPC endpoints

**Planned Production Stack:**
- **Frontend/Extension**: Plasmo Framework (React/TypeScript), TailwindCSS
- **Backend API**: Next.js (Serverless Functions) or Rust (Axum) for high-throughput simulation handling
- **Database**: PostgreSQL (Registry storage), Redis (Caching)
- **Infrastructure**: Helius / QuickNode (RPC Providers), Vercel (Hosting)

### Proof of Concept

A working Proof of Concept (POC) has been released to GitHub.

**Current Status:**
- ✅ Extension successfully detects Action URLs on X.com and dial.to
- ✅ Transaction simulation engine functional
- ✅ Safety analysis with heuristic checks implemented
- ✅ Visual overlays (Green/Yellow/Red) integrated into UI
- ✅ API service with registry management operational
- ✅ Open-source repository with comprehensive documentation

**Repo Link:** https://github.com/Abm32/BlinkGuard

**Key Features Implemented:**
- Real-time Blink detection via DOM observation
- Transaction simulation using Solana RPC `simulateTransaction`
- Multi-layer safety heuristics (balance transfers, approvals, contract verification, domain trust)
- Community registry system for malicious URL reporting
- Safety scoring algorithm (0-100 scale)
- Visual safety indicators with color-coded overlays

---

## 3. Budget Breakdown (Milestones)

**Total Request:** $30,000  
**Allocation:** Development ($14,000) | Maintenance ($10,000) | Adoption ($6,000)

### Phase 1: Development (Beta Release) - $14,000

**Objective:** Release a fully functional Beta to the Chrome Web Store with production-ready infrastructure.

#### Milestone 1.1: Core Simulation Engine & API Migration ($7,000)

**Deliverables:**
- ✅ API endpoint capable of fetching an Action URL, simulating the transaction, and returning a JSON safety score (POC complete)
- ✅ Implementation of "Drainer Detection" heuristics (balance sweep checks) (POC complete)
- 🔄 **Migration to production stack:**
  - Migrate Express API to Next.js Serverless Functions
  - Implement PostgreSQL database for registry storage
  - Integrate Redis caching layer
  - Deploy to Vercel with Helius/QuickNode RPC endpoints
  - Performance optimization and load testing

**Verification:** Live API endpoint with <500ms average response time, 99%+ uptime

#### Milestone 1.2: Extension Beta Release & Chrome Web Store ($7,000)

**Deliverables:**
- ✅ Published Chrome Extension with "Traffic Light" UI (Green/Yellow/Red) integrated with the API (POC complete)
- ✅ Open-source GitHub repository with full documentation on how to run the stack locally (Complete)
- 🔄 **Production readiness:**
  - Migrate extension to Plasmo Framework for improved maintainability
  - Implement TailwindCSS for modern UI/UX
  - Chrome Web Store listing preparation and submission
  - Store assets (screenshots, descriptions, privacy policy)
  - Beta testing with community feedback

**Verification:** 
- Live demo video showing the extension blocking a test drainer transaction
- Chrome Web Store listing published and accessible
- Extension installable and functional for beta users

### Phase 2: Maintenance (6 Months) - $10,000

**Objective:** Ensure uptime, fix bugs, and update the registry.

**Payment Structure:** Paid monthly ($1,666/month) upon submission of a maintenance report.

**Responsibilities:**
- **SLA Uptime**: Maintain 99.9% uptime for the Safety API
- **Registry Updates**: Manually review and add new "Verified" protocols and "Malicious" domains to the registry weekly
- **Bug Fixes**: Resolve any GitHub issues labeled "bug" within 72 hours
- **RPC Management**: Monitor and optimize RPC usage to ensure the grant funding sustains the traffic load
- **Security Updates**: Keep dependencies updated and address any security vulnerabilities
- **Performance Monitoring**: Track API response times and optimize slow endpoints

### Phase 3: User Adoption - $6,000

**Objective:** Drive usage and developer integration.

**Payment Structure:** Paid in 25% increments ($1,500) as metrics are met.

#### Metric A: Active Users (Consumer Adoption) - $1,500

**Goal:** 1,000 Weekly Active Users (WAU) on the browser extension.

**Verification:** Google Chrome Web Store analytics screenshots showing WAU metrics.

#### Metric B: Developer API Integration (Ecosystem Adoption) - $1,500

**Goal:** 3 External Projects (Wallets, dApps, or Community Discords) integrating the BlinkGuard Safety API.

**Verification:** GitHub code references or public announcements from partners demonstrating API integration.

#### Metric C: Community Contributions - $1,500

**Goal:** 20+ Pull Requests or "Malicious URL" reports submitted by the community to the open registry.

**Verification:** GitHub contribution graph and closed issues count showing community engagement.

#### Metric D: Documentation & Developer Experience - $1,500

**Goal:** 
- Complete API documentation with examples
- Developer SDK or integration guide
- At least 5 external developers successfully integrating the API

**Verification:** Documentation site/page with integration examples and developer testimonials.

---

## 4. Roadmap & Timeline

### Month 1: Core Development & Beta Launch
- **Week 1-2**: API migration to Next.js, PostgreSQL setup, Redis integration
- **Week 3**: Extension migration to Plasmo Framework, TailwindCSS implementation
- **Week 4**: Chrome Web Store submission, beta testing, Milestones 1.1 & 1.2 completion

### Month 2: Public Release & Marketing
- **Week 1**: Chrome Web Store launch, public announcement
- **Week 2-4**: Marketing push for Adoption Metric A (1,000 WAU)
- **Ongoing**: Partnership outreach for Adoption Metric B (3 API integrations)

### Month 3-8: Active Maintenance Period
- **Ongoing**: Phase 2 maintenance (99.9% uptime, registry updates, bug fixes)
- **Ongoing**: Community engagement for Adoption Metric C (20+ contributions)
- **Ongoing**: Developer support and documentation for Adoption Metric D

---

## 5. Success Metrics

### Technical Metrics
- API uptime: 99.9%+
- Average API response time: <500ms
- Extension detection accuracy: >95% for standard Blink formats
- False positive rate: <5%

### Adoption Metrics
- 1,000+ Weekly Active Users (WAU)
- 3+ External API integrations
- 20+ Community contributions
- 5+ Developers successfully using API

### Impact Metrics
- Number of malicious Blinks detected and blocked
- User reports of prevented drainer attacks
- Developer testimonials on improved conversion rates
- Community registry growth and accuracy

---

## 6. Open Source Commitment

BlinkGuard is and will remain fully open-source under the MIT License. This includes:
- Complete source code on GitHub
- Open API endpoints (with rate limiting for abuse prevention)
- Community-maintained malicious URL registry
- Full documentation and contribution guidelines
- Transparent development process and roadmap

---

## 7. Risk Mitigation

### Technical Risks
- **RPC Rate Limiting**: Mitigated by Redis caching and potential Rust implementation for efficiency
- **False Positives**: Continuous refinement of heuristics based on community feedback
- **Extension Compatibility**: Testing across Chrome, Brave, and Edge browsers

### Adoption Risks
- **Low User Adoption**: Mitigated by clear value proposition and Chrome Web Store optimization
- **Developer Integration Barriers**: Comprehensive documentation, SDK, and developer support
- **Registry Accuracy**: Manual review process and community verification system

---

## 8. Long-Term Vision

Beyond the grant period, BlinkGuard aims to:
- Expand to additional platforms (Firefox, Safari extensions)
- Integrate with major Solana wallets as a built-in safety layer
- Develop machine learning models for advanced drainer detection
- Create a decentralized registry using on-chain governance
- Build partnerships with major Solana projects and platforms

---

**Made with ❤️ for the Solana community**

