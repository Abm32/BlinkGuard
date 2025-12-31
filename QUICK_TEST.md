# Quick Testing Guide

## ✅ Correct Way to Test (After Reloading Extension)

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find BlinkGuard
3. Click **RELOAD** button

### Step 2: Reload Twitter/X Page
- Refresh the page (F5)

### Step 3: Open Console (F12)

### Step 4: Use Test Functions

```javascript
// Check if BlinkGuard is loaded
window.blinkGuardTest
// Should return: { scanBlinks: ƒ, checkRegistry: ƒ, getProcessedBlinks: ƒ }

// Scan for Blinks on the page
window.blinkGuardTest.scanBlinks()
// Returns array of Blink elements found

// Check registry for a URL
window.blinkGuardTest.checkRegistry('https://example.com/test')
// Returns: { success: true, result: { isMalicious: false } }

// See processed Blinks
window.blinkGuardTest.getProcessedBlinks()
// Returns array of URLs that have been analyzed
```

## ❌ What NOT to Do

### Don't use chrome.runtime.sendMessage directly:
```javascript
// ❌ This won't work from page context
chrome.runtime.sendMessage({
  type: 'CHECK_REGISTRY',
  url: 'https://example.com'
}, (response) => {
  console.log(response);
});
```

**Error:** "chrome.runtime.sendMessage() called from a webpage must specify an Extension ID"

### Why?
- Browser console runs in **page context**
- Extension APIs need **content script context** or **extension ID**
- Test functions bridge this gap

## ✅ What Works

### Use the test functions:
```javascript
// ✅ This works - uses test functions
window.blinkGuardTest.checkRegistry('https://example.com')
```

## 🔍 Check if Content Script Loaded

Look for this message in console:
```
BlinkGuard content script initialized
BlinkGuard: Test functions available at window.blinkGuardTest
```

If you don't see these:
1. Reload extension
2. Reload page
3. Check for errors in console

## 🎯 Expected Results

### When BlinkGuard is working:
```javascript
// Should return object with functions
window.blinkGuardTest
// { scanBlinks: ƒ, checkRegistry: ƒ, getProcessedBlinks: ƒ }

// Should find Blinks on page
window.blinkGuardTest.scanBlinks()
// Array of Blink elements

// Should check registry
window.blinkGuardTest.checkRegistry('https://example.com')
// { success: true, result: { isMalicious: false } }
```

## 💡 Tips

1. **Always reload extension** after code changes
2. **Reload page** after reloading extension
3. **Check console** for initialization messages
4. **Use test functions** instead of chrome APIs directly

