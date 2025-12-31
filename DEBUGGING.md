# BlinkGuard Debugging Guide

## Quick Setup Checklist

### ✅ 1. API Server Running
```bash
npm run start:api
# Should see: "BlinkGuard API server running on port 3000"
```

### ✅ 2. Extension Built
```bash
npm run build:extension
# Should see: "Extension build complete!"
```

### ✅ 3. Extension Loaded in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select: `extension/dist` directory
5. Extension should appear with icon

### ✅ 4. Test on Twitter/X
1. Navigate to https://twitter.com or https://x.com
2. Look for Solana Blinks (tweets with `solana-action:` URLs)
3. Safety overlays should appear automatically

## Troubleshooting

### Extension Not Working?

#### Step 1: Check Extension is Enabled
- Go to `chrome://extensions/`
- Make sure BlinkGuard is **enabled** (toggle should be blue/on)
- Check for any error messages in red

#### Step 2: Check Browser Console
1. Open Twitter/X in a new tab
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for errors (red text)
5. Common errors:
   - `Failed to fetch` → API server not running
   - `CORS error` → API permissions issue
   - `Cannot read property` → Code error

#### Step 3: Check Background Service Worker
1. Go to `chrome://extensions/`
2. Find BlinkGuard extension
3. Click **"service worker"** link (or "Inspect views: service worker")
4. Check Console for errors
5. Look for messages like:
   - "BlinkGuard installed"
   - "Registry synced"
   - Any error messages

#### Step 4: Check API Connection
1. Make sure API is running: `npm run start:api`
2. Test API directly:
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok","timestamp":...}
   ```
3. Check if extension can reach API:
   - Open extension popup (click icon)
   - Check browser console for fetch errors

#### Step 5: Check Content Script
1. On Twitter/X page, press `F12`
2. Go to **Console** tab
3. Look for: "BlinkGuard content script initialized"
4. If not present, content script didn't load

### Common Issues

#### Issue: "Failed to fetch" errors
**Solution:**
- Make sure API server is running on port 3000
- Check firewall isn't blocking localhost:3000
- Verify extension has permission for `http://localhost:3000/*`

#### Issue: No overlays appearing
**Possible causes:**
1. No Blinks on the page (test with a real Blink)
2. Content script not running (check console)
3. DOM observer not detecting Blinks
4. Transaction simulation failing

**Debug:**
```javascript
// In browser console on Twitter/X:
// Check if BlinkGuard is active
console.log('BlinkGuard active:', document.querySelector('.blinkguard-overlay') !== null);
```

#### Issue: Extension icon not showing
**Solution:**
- Rebuild extension: `npm run build:extension`
- Reload extension in `chrome://extensions/`
- Check `extension/dist/icons/` has PNG files

#### Issue: CORS errors
**Solution:**
- API server should have CORS enabled (already configured)
- Check API is running
- Verify `http://localhost:3000` is in manifest `host_permissions`

### Testing Steps

1. **Test API directly:**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Registry check
   curl "http://localhost:3000/registry/check?url=https://example.com"
   ```

2. **Test Extension Detection:**
   - Go to Twitter/X
   - Open console (F12)
   - Look for BlinkGuard messages
   - Check for any Solana Blinks on the page

3. **Test Overlay Injection:**
   - Find a tweet with a Solana Blink
   - Look for colored badge (green/yellow/red)
   - Should appear in top-right of tweet card

### Manual Testing

If automatic detection isn't working, you can manually test:

1. **Check if content script loaded:**
   ```javascript
   // In browser console on Twitter/X:
   // Should see BlinkGuard messages
   ```

2. **Manually trigger detection:**
   ```javascript
   // In browser console:
   // This simulates finding a Blink
   const testLink = document.createElement('a');
   testLink.href = 'solana-action:https://example.com/action';
   testLink.textContent = 'Test Blink';
   document.body.appendChild(testLink);
   ```

3. **Check storage:**
   ```javascript
   // In extension popup or background console:
   chrome.storage.local.get(null, console.log);
   ```

### Getting Help

If still not working:
1. Check all console errors (browser + service worker)
2. Verify API is responding: `curl http://localhost:3000/health`
3. Check extension permissions in `chrome://extensions/`
4. Try reloading the extension
5. Check that you're on Twitter/X (not other sites)

## Expected Behavior

When working correctly:
1. Extension loads without errors
2. Content script initializes on Twitter/X
3. Blinks are detected automatically
4. Safety overlays appear (green/yellow/red badges)
5. No console errors

## Debug Mode

To enable verbose logging, you can modify the code to add more console.log statements, or check the existing logs in:
- Browser console (F12 on Twitter/X)
- Service worker console (chrome://extensions/ → service worker)
- Extension popup console

