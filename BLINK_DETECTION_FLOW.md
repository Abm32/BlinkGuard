# BlinkGuard Detection Flow

## Overview

BlinkGuard detects Solana Blinks in two scenarios:

1. **Twitter/X**: Detects Blink links in tweets
2. **dial.to**: Detects fully rendered Blinks with interactive UI

## Detection Methods

### Method 1: Direct `solana-action:` Protocol Links
- Detects: `<a href="solana-action:https://...">`
- Used on: Twitter/X, direct links

### Method 2: Action Query Parameter Links
- Detects: `https://dial.to/?action=solana-action:https://...`
- Handles URL-encoded parameters
- Used on: Twitter/X (dial.to links)

### Method 3: Twitter Card Links
- Scans Twitter tweet cards for Blink links
- Used on: Twitter/X feed

### Method 4: Rendered Blink UI Elements
- Detects Dialect/Blink framework elements
- Looks for action buttons, vote buttons, poll containers
- Used on: dial.to, other Blink viewers

### Method 5: Page Metadata
- Checks for Blink metadata in `<meta>` tags
- Used on: dial.to, Blink viewer pages

## Flow Diagram

```
User visits page
    ↓
Content script loads
    ↓
Detect page type (Twitter vs dial.to)
    ↓
Scan for Blinks (all 5 methods)
    ↓
For each Blink found:
    ↓
Extract metadata (URL, domain, action URL)
    ↓
Check if already processed
    ↓
Simulate transaction
    ↓
Analyze safety
    ↓
Inject safety overlay
```

## Twitter/X Scenario

1. User sees tweet with Blink link
2. BlinkGuard detects link in tweet card
3. Extracts `solana-action:` URL from link
4. Analyzes transaction safety
5. Shows overlay on tweet card

## dial.to Scenario

1. User clicks Blink link from Twitter
2. Navigates to dial.to page
3. BlinkGuard detects rendered Blink UI
4. Extracts action URL from page URL or metadata
5. Analyzes transaction safety
6. Shows overlay on Blink container

## Test Functions

After reloading extension:

```javascript
// On Twitter/X or dial.to
window.blinkGuardTest.scanBlinks().then(count => {
  console.log('Found', count, 'Blinks');
});

// Check registry
window.blinkGuardTest.checkRegistry('https://example.com/blink');

// See processed Blinks
window.blinkGuardTest.getProcessedBlinks();
```

## Troubleshooting

### Test functions undefined on dial.to
1. Reload extension in `chrome://extensions/`
2. Reload dial.to page
3. Check console for "BlinkGuard content script initialized"
4. Wait 1-2 seconds for injection

### No Blinks detected on Twitter
- Blink must be a link in the tweet
- Check if link contains `solana-action:` or `action=` parameter
- Try scrolling to load more tweets

### No Blinks detected on dial.to
- Page must be fully loaded
- Blink UI must be rendered
- Check for action buttons or vote buttons
- Wait for dynamic content to load

