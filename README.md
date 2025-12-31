# BlinkGuard

**The Open-Source Safety Layer for Solana Actions**

BlinkGuard is an open-source browser extension and API service designed to "pre-validate" Solana Blinks (Blockchain Links) directly within the Twitter/X user interface. It provides a safety layer that analyzes transactions before users interact with their wallets.

## 🛡️ Features

- **Pre-Click Safety Validation**: Analyzes Solana Blinks before wallet interaction
- **Real-Time Transaction Simulation**: Uses Solana's fast `simulateTransaction` RPC for instant analysis
- **Community Registry**: Open-source database of malicious URLs that anyone can contribute to
- **Visual Safety Indicators**: Green (Safe), Yellow (Caution), or Red (High Risk) overlays on Blinks
- **Heuristic Analysis**: Detects drainers, suspicious approvals, and unknown contracts

## 🏗️ Architecture

### Browser Extension
- **Content Script**: Detects Blinks in Twitter/X DOM and injects safety overlays
- **Background Worker**: Handles API communication and registry synchronization
- **Transaction Simulator**: Performs dry-run transaction analysis via Solana RPC

### API Service
- **Registry Management**: Stores and serves malicious URL database
- **Safety Analysis**: Provides transaction safety scoring
- **Community Reporting**: Allows users to report suspicious Blinks

## 📚 Documentation

All documentation is organized in the [`docs/`](./docs/) directory:
- **Technical Docs**: Architecture, API flows, detection processes
- **Guides**: Usage, quick start, testing
- **Development**: Debugging, troubleshooting

See [docs/README.md](./docs/README.md) for the complete documentation index.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Chrome or Brave browser
- Solana RPC endpoint (or use public endpoints)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/blinkguard/blinkguard.git
cd blinkguard
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build:extension
```

4. Build the API (optional, for local development):
```bash
npm run build:api
```

### Loading the Extension

1. Open Chrome/Brave and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/dist` directory

### Running the API Server

```bash
npm run build:api
node api/dist/server.js
```

The API will run on `http://localhost:3000` by default.

## 📖 Usage

Once installed, BlinkGuard automatically:

1. **Detects Blinks**: Scans Twitter/X for Solana Blink URLs
2. **Simulates Transactions**: Performs background transaction analysis
3. **Shows Safety Overlays**: Displays colored badges indicating safety level:
   - 🟢 **Green**: Verified Safe
   - 🟡 **Yellow**: Caution (moderate risk)
   - 🔴 **Red**: High Risk (potential drainer)

### Reporting Malicious Blinks

Users can report suspicious Blinks through the extension popup or directly via the API. Reports are added to the community registry for verification.

## 🔧 Configuration

### Extension Settings

Access settings via the extension popup:
- **Enable/Disable**: Toggle BlinkGuard on/off
- **Show Overlays**: Toggle safety badge visibility
- **RPC Endpoint**: Configure custom Solana RPC endpoint

### API Configuration

Set environment variables:
- `PORT`: API server port (default: 3000)
- `REGISTRY_FILE`: Path to registry JSON file

## 🧪 Safety Heuristics

BlinkGuard analyzes transactions for:

1. **Balance Transfer Analysis**: Detects if >90% of balance is transferred (drainer pattern)
2. **Approval Risks**: Identifies suspicious token approvals
3. **Unknown Contracts**: Flags interactions with unverified programs
4. **Domain Trust**: Checks domain reputation and SSL status
5. **Registry Matches**: Cross-references with community malicious URL database

## 📊 Safety Scoring

Transactions receive a safety score (0-100):
- **80-100**: Safe (Green)
- **50-79**: Caution (Yellow)
- **0-49**: High Risk (Red)

## 🤝 Contributing

BlinkGuard is open-source and welcomes contributions! Areas where we need help:

- Improving safety heuristics
- Adding more trusted program IDs
- Expanding domain trust analysis
- UI/UX improvements
- Documentation

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: https://github.com/blinkguard/blinkguard
- **Documentation**: https://blinkguard.io/docs
- **Chrome Web Store**: Coming soon

## 🙏 Acknowledgments

Built for the Solana ecosystem. Special thanks to:
- Solana Foundation for the Blinks standard
- The Solana developer community
- All contributors and beta testers

## ⚠️ Disclaimer

BlinkGuard provides safety analysis but cannot guarantee 100% protection. Always:
- Verify transactions in your wallet
- Double-check destination addresses
- Be cautious with large transfers
- Report suspicious activity

---

**Made with ❤️ for the Solana community**

