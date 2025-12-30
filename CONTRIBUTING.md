# Contributing to BlinkGuard

Thank you for your interest in contributing to BlinkGuard! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/blinkguard.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

```bash
npm install
npm run build
```

### Extension Development

```bash
npm run dev:extension
```

Then load the `extension/dist` directory as an unpacked extension in Chrome.

### API Development

```bash
npm run dev:api
npm run build:api
node api/dist/server.js
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add comments for complex logic
- Keep functions focused and small
- Use meaningful variable names

## Testing

Before submitting a PR, please:

1. Test the extension on Twitter/X
2. Verify safety overlays appear correctly
3. Test with known safe and unsafe Blinks
4. Check for console errors

## Areas for Contribution

### High Priority

- **Safety Heuristics**: Improve drainer detection algorithms
- **Trusted Programs**: Add more verified program IDs
- **Domain Analysis**: Enhance domain trust scoring
- **UI/UX**: Improve overlay design and positioning

### Medium Priority

- **Performance**: Optimize transaction simulation
- **Documentation**: Expand API documentation
- **Testing**: Add unit and integration tests
- **Error Handling**: Improve error messages and recovery

### Low Priority

- **Localization**: Add multi-language support
- **Themes**: Support dark/light mode
- **Analytics**: Add usage metrics (privacy-preserving)

## Pull Request Process

1. Update README.md if needed
2. Add tests if applicable
3. Ensure all builds pass
4. Write clear commit messages
5. Reference any related issues

## Questions?

Open an issue or reach out to the maintainers!

