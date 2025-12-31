# Debugging: Content Script Not Loading

## Issue: window.blinkGuardTest is undefined

This means the content script either:
1. Didn't load at all
2. Loaded but failed to execute
3. Executed but test functions weren't exposed

## 🔍 Step-by-Step Debugging

### Step 1: Check if Content Script Loaded

Open browser console (F12) on Twitter/X and look for:
```
BlinkGuard content script initialized
```

**If you DON'T see this:**
- Content script didn't load
- Check for errors in console
- Reload extension and page

### Step 2: Check for Errors

Look for red error messages in console:
- Syntax errors
- Import errors
- Runtime errors

### Step 3: Verify Extension is Enabled

1. Go to `chrome://extensions/`
2. Find BlinkGuard
3. Make sure toggle is **ON** (blue)
4. Check for error messages in red

### Step 4: Check Service Worker

1. Go to `chrome://extensions/`
2. Click **"service worker"** on BlinkGuard
3. Check console for errors
4. Should see: "BlinkGuard installed"

### Step 5: Verify Content Script Injection

1. Open DevTools (F12) on Twitter/X
2. Go to **Sources** tab
3. Look for:
   - `top` → `x.com` → `extensions` → `[extension-id]` → `content.js`
4. If you see `content.js`, it's loaded

### Step 6: Manual Test

In browser console, try:
```javascript
// Check if content script context exists
console.log('Testing from page context');

// Check if we can access extension
chrome.runtime.id
// Should return extension ID (if accessible)
```

## 🛠️ Solutions

### Solution 1: Reload Everything
1. Reload extension in `chrome://extensions/`
2. Reload Twitter/X page (F5)
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Solution 2: Check Manifest
Verify `content_scripts` in manifest.json:
```json
"content_scripts": [
  {
    "matches": ["https://twitter.com/*", "https://x.com/*"],
    "js": ["content.js"],
    "css": ["content.css"],
    "run_at": "document_idle"
  }
]
```

### Solution 3: Check File Exists
```bash
# In terminal
ls -la extension/dist/content.js
# Should exist and have content
```

### Solution 4: Rebuild Extension
```bash
npm run build:extension
# Then reload extension
```

## 🧪 Alternative Testing Methods

### Method 1: Check Console Messages
Look for these messages when page loads:
- `BlinkGuard content script initialized` ✓
- `BlinkGuard: Test functions available` ✓

### Method 2: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "content.js"
3. Should see content.js loaded

### Method 3: Check Elements
1. Open DevTools → Elements tab
2. Look for elements with class `blinkguard-overlay`
3. If found, content script is working

## 🎯 Expected Behavior

### When Working:
1. Console shows: "BlinkGuard content script initialized"
2. Console shows: "BlinkGuard: Test functions available"
3. `window.blinkGuardTest` returns object
4. `window.blinkGuardTest.test()` works

### When Not Working:
1. No console messages
2. `window.blinkGuardTest` is undefined
3. Errors in console

## 💡 Quick Fix Checklist

- [ ] Extension enabled in chrome://extensions/
- [ ] Extension reloaded
- [ ] Page reloaded (F5)
- [ ] Console shows "BlinkGuard content script initialized"
- [ ] No errors in console
- [ ] content.js exists in extension/dist/
- [ ] Manifest has correct content_scripts config

## 🔧 If Still Not Working

1. **Remove and re-add extension:**
   - Go to chrome://extensions/
   - Remove BlinkGuard
   - Click "Load unpacked"
   - Select extension/dist directory

2. **Check browser console for specific errors**
3. **Verify you're on twitter.com or x.com** (not other domains)
4. **Check if content.js file is actually bundled** (should be large, ~20k lines)

