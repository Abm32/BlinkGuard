# BlinkGuard Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- Chrome or Brave browser
- Git

## Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/blinkguard/blinkguard.git
cd blinkguard
npm install
```

2. **Build the extension:**
```bash
npm run build:extension
```

3. **Load extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension/dist` directory

4. **Test on Twitter/X:**
   - Navigate to https://twitter.com or https://x.com
   - Look for Solana Blinks (they'll have `solana-action:` URLs)
   - Safety overlays should appear automatically

## Running the API (Optional)

For local development or self-hosting:

```bash
npm run build:api
node api/dist/server.js
```

The API will run on `http://localhost:3000`

## Development Mode

Watch mode for extension development:

```bash
npm run dev:extension
```

Then reload the extension in Chrome after changes.

## Project Structure

```
BlinkGuard/
├── extension/          # Chrome extension code
│   ├── src/           # TypeScript source
│   ├── manifest.json  # Extension manifest
│   └── dist/          # Compiled output (after build)
├── api/               # API server code
│   ├── src/           # TypeScript source
│   └── dist/          # Compiled output (after build)
├── shared/            # Shared code between extension and API
│   ├── types.ts       # TypeScript types
│   ├── constants.ts   # Constants
│   └── safetyEngine.ts # Safety analysis logic
└── README.md          # Main documentation
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Troubleshooting

**Extension not loading?**
- Make sure you built the extension: `npm run build:extension`
- Check that `extension/dist` directory exists
- Look for errors in Chrome's extension console

**No overlays appearing?**
- Check browser console for errors (F12)
- Verify you're on twitter.com or x.com
- Make sure extension is enabled in chrome://extensions

**Build errors?**
- Run `npm install` again
- Check Node.js version: `node --version` (should be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

