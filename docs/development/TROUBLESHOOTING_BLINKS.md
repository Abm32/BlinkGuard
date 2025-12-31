# Troubleshooting: Blink Not Detected

## Issue: Clicked on Blink but Nothing Happened

### Common Reasons

1. **Blink Not Detected**
   - Extension might not have found the Blink in the DOM
   - URL format might not match detection patterns

2. **Overlay Not Showing**
   - Analysis might be failing silently
   - Element positioning might be wrong

3. **Transaction Simulation Failing**
   - Action API might not be responding
   - CORS issues
   - Invalid transaction format

## 🔍 Debugging Steps

### Step 1: Check if Blink is Detected

Open browser console on Twitter/X (F12) and check for:
```
BlinkGuard: Analyzing Blink { url: ..., domain: ..., actionUrl: ... }
```

If you don't see this, the Blink wasn't detected.

### Step 2: Check Console for Errors

Look for red error messages:
- `Error analyzing blink`
- `Transaction simulation error`
- `Failed to fetch`

### Step 3: Verify URL Format

The extension detects:
- Direct `solana-action:` protocol URLs
- URLs with `action=` query parameter
- Dial.to links with nested `solana-action:`

### Step 4: Manual Test

In browser console, run:
```javascript
// Check if content script is loaded
console.log('BlinkGuard active');

// Manually trigger detection
// (The extension should do this automatically)
```

### Step 5: Check Service Worker

1. Go to `chrome://extensions/`
2. Click "service worker" on BlinkGuard
3. Check for errors in console

## 🛠️ Fixes Applied

### Fix 1: Handle Dial.to URLs
- Now properly extracts `solana-action:` from URL-encoded action parameters
- Handles nested Blink URLs

### Fix 2: Better Error Logging
- Added console.log statements to track analysis flow
- Shows what's happening at each step

### Fix 3: Improved URL Extraction
- Better handling of URL-encoded parameters
- More robust domain extraction

## 🧪 Testing Your Specific URL

Your URL: `https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fblinks-verdancy.cryptoutils.xyz%2Fapi%2Factions%2Fpolls%3Fid%3D31&cluster=mainnet`

This should now be detected because:
1. ✅ Has `action=` parameter
2. ✅ Contains `solana-action:` (URL-encoded)
3. ✅ Extension now handles this format

## 📝 What to Check After Reload

1. **Reload extension** in `chrome://extensions/`
2. **Reload Twitter/X page**
3. **Open console** (F12)
4. **Click on the Blink again**
5. **Check console** for:
   - "BlinkGuard: Analyzing Blink"
   - "BlinkGuard: Transaction simulation result"
   - "BlinkGuard: Safety analysis"
6. **Look for overlay badge** on the tweet

## 🎯 Expected Behavior

When working correctly:
1. You click on a Blink
2. Console shows: "BlinkGuard: Analyzing Blink"
3. Overlay appears with "Analyzing..." badge
4. After analysis, badge changes to Green/Yellow/Red
5. Console shows analysis results

## 🐛 If Still Not Working

1. **Check if extension is enabled**
2. **Verify you're on twitter.com/x.com**
3. **Check browser console for errors**
4. **Try a different Blink URL**
5. **Check if API server is running**

## 💡 Tips

- The overlay appears on the **tweet card**, not the link itself
- Look for badge in **top-right corner** of tweet
- Badge might be small - check carefully
- Some Blinks might not have transactions to simulate
- Analysis might take a few seconds

