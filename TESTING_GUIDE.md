# Testing BlinkGuard Extension

## 🔍 How to Test from Browser Console

### Important: Console Context Matters!

When you open DevTools console on Twitter/X, you're in the **page context**, not the **content script context**. The extension's content script runs in an isolated context.

### Method 1: Check if Content Script is Loaded

Open browser console (F12) on Twitter/X and look for:
```
BlinkGuard content script initialized
```

If you see this, the content script is working!

### Method 2: Access Content Script Context

To test from the content script context:

1. Open DevTools (F12)
2. Go to **Sources** tab
3. In the left sidebar, expand:
   - `top` → `x.com` → `extensions` → `[your-extension-id]` → `content.js`
4. Set a breakpoint or use the console in that context

### Method 3: Inject Test Code into Content Script

Add this to your content script temporarily for testing:

```javascript
// In extension/src/content.ts, add at the end:
(window as any).testBlinkGuard = {
  checkRegistry: async (url: string) => {
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_REGISTRY',
      url
    });
    console.log('Registry check:', response);
    return response;
  },
  scanBlinks: () => {
    const blinks = detectBlinks();
    console.log('Found blinks:', blinks);
    return blinks;
  }
};
```

Then in browser console:
```javascript
// This will work because it's exposed to window
testBlinkGuard.scanBlinks();
testBlinkGuard.checkRegistry('https://example.com/test');
```

### Method 4: Check Extension ID

To use `chrome.runtime.sendMessage` from page context, you need the extension ID:

1. Go to `chrome://extensions/`
2. Find BlinkGuard
3. Copy the Extension ID (long string)
4. In browser console:
```javascript
chrome.runtime.sendMessage(
  'YOUR-EXTENSION-ID-HERE',  // Add your extension ID
  {
    type: 'CHECK_REGISTRY',
    url: 'https://example.com/test-blink'
  },
  (response) => {
    console.log('Registry check:', response);
  }
);
```

## 🧪 Better Testing Methods

### Test 1: Visual Check
1. Go to Twitter/X
2. Find a tweet with a Solana Blink
3. Look for colored badge in top-right corner of tweet
4. Should see: Green/Yellow/Red/Gray badge

### Test 2: Console Logs
Open console (F12) and look for:
- `BlinkGuard content script initialized` ✓
- `BlinkGuard: Analyzing Blink` (when Blink detected)
- `BlinkGuard: Transaction simulation result`
- `BlinkGuard: Safety analysis`

### Test 3: Network Tab
1. Open DevTools → Network tab
2. Filter by "localhost:3000"
3. When Blink is detected, you should see API requests

### Test 4: Service Worker Console
1. Go to `chrome://extensions/`
2. Click "service worker" on BlinkGuard
3. Check console for:
   - `BlinkGuard installed`
   - Any error messages

## 🐛 Debugging Checklist

- [ ] Extension is enabled in `chrome://extensions/`
- [ ] Content script shows "BlinkGuard content script initialized" in console
- [ ] Service worker shows "BlinkGuard installed"
- [ ] API server is running (`npm run start:api`)
- [ ] You're on twitter.com or x.com
- [ ] There are actual Solana Blinks on the page

## 💡 Quick Test Commands

### From Content Script Context (if you expose test functions):

```javascript
// Scan for Blinks
testBlinkGuard.scanBlinks();

// Check registry
testBlinkGuard.checkRegistry('https://example.com');

// Manually trigger analysis (if exposed)
testBlinkGuard.analyzeBlink(element);
```

### From Page Context (requires extension ID):

```javascript
// Get extension ID first from chrome://extensions/
const extensionId = 'YOUR-EXTENSION-ID';

chrome.runtime.sendMessage(extensionId, {
  type: 'CHECK_REGISTRY',
  url: 'https://example.com'
}, (response) => {
  console.log(response);
});
```

## 🎯 Expected Behavior

When working correctly:
1. Console shows: "BlinkGuard content script initialized"
2. When Blink appears: "BlinkGuard: Analyzing Blink"
3. Overlay badge appears on tweet
4. No errors in console

## ⚠️ Common Issues

### "chrome.runtime.sendMessage() called from a webpage must specify an Extension ID"
- **Cause:** Trying to use chrome APIs from page context
- **Solution:** Use extension ID or test from content script context

### "BlinkGuard active" returns undefined
- **Cause:** Content script context is isolated
- **Solution:** Check for "BlinkGuard content script initialized" message instead

### No logs appearing
- **Cause:** Content script not loaded
- **Solution:** Reload extension and page, check for errors

