# BlinkGuard Usage Guide

> **Quick Start**: See [QUICKSTART.md](./QUICKSTART.md) for installation and setup instructions.

## 🎯 What BlinkGuard Does

BlinkGuard automatically scans Twitter/X and dial.to for **Solana Blinks** (Blockchain Links) and shows safety indicators **before** you click them. It analyzes transactions to detect potential drainers and scams.

## 🚀 How It Works

### Automatic Detection
1. **You browse Twitter/X or dial.to** - BlinkGuard runs in the background
2. **It detects Blinks** - Automatically finds `solana-action:` URLs in tweets or rendered Blink UI
3. **It analyzes safety** - Simulates transactions and checks against the registry
4. **It shows overlays** - Displays colored badges on Blink cards

### No Action Required!
- ✅ Works automatically
- ✅ No wallet connection needed
- ✅ No clicks required
- ✅ Just browse Twitter/X or dial.to normally

## 📊 Understanding Safety Overlays

When BlinkGuard detects a Solana Blink, it shows a colored badge:

### 🟢 Green Badge: "✓ Verified Safe"
- Transaction looks legitimate
- Low risk of being a drainer
- Safe to interact with

### 🟡 Yellow Badge: "⚠ Caution"
- Moderate risk detected
- Review the transaction carefully
- May involve significant balance transfers

### 🔴 Red Badge: "✗ High Risk"
- **DANGER** - Potential drainer detected
- Transaction transfers >90% of balance
- **DO NOT** interact with this Blink
- Report it if possible

### ⚪ Gray Badge: "? Unknown"
- Couldn't analyze the transaction
- Insufficient data
- Proceed with caution

## 🧪 How to Test It

### Step 1: Make Sure Everything is Running

```bash
# Terminal 1: API Server
npm run start:api
# Should see: "BlinkGuard API server running on port 3000"

# Terminal 2: Extension (already loaded in Chrome)
# Just make sure it's enabled in chrome://extensions/
```

### Step 2: Go to Twitter/X

1. Open a new tab
2. Go to **https://twitter.com** or **https://x.com**
3. Log in to your account

### Step 3: Find Solana Blinks

BlinkGuard only works when there are actual **Solana Blinks** on the page. Look for:

- Tweets with Solana-related content
- Links that start with `solana-action:`
- Tweets from projects like:
  - Jupiter (JUP)
  - Helium
  - Other Solana projects

### Step 4: Check for Overlays

When you see a Solana Blink:
- Look for a colored badge in the **top-right corner** of the tweet card
- The badge shows the safety level
- Hover over it (if clickable) for more details

## 🔍 Verifying It's Working

### Check Browser Console

1. On Twitter/X, press **F12** to open DevTools
2. Go to **Console** tab
3. You should see:
   ```
   BlinkGuard content script initialized
   ```

### Check Service Worker

1. Go to `chrome://extensions/`
2. Find BlinkGuard
3. Click **"service worker"** link
4. You should see:
   ```
   BlinkGuard installed
   ```

### Check Extension Popup

1. Click the **BlinkGuard icon** in your browser toolbar
2. You should see:
   - Extension name and status
   - Toggle switches for enabling/disabling
   - Links to documentation

## 🎨 What You'll See

### On Twitter/X Feed

When scrolling through your feed:
- BlinkGuard automatically scans for Blinks
- Safety badges appear automatically
- No interaction needed from you

### Example Tweet with Blink

```
┌─────────────────────────────────────┐
│ @SolanaProject                      │
│                                     │
│ Check out this new feature!         │
│ [solana-action:https://...]  🟢 ✓  │ ← Green badge = Safe
│                                     │
└─────────────────────────────────────┘
```

## ⚙️ Extension Settings

### Access Settings

1. Click the **BlinkGuard icon** in browser toolbar
2. You'll see:
   - **Enable BlinkGuard** - Toggle on/off
   - **Show Safety Overlays** - Toggle badge visibility

### Configure API URL (Advanced)

By default, BlinkGuard uses the Vercel deployment at `https://blink-guard-ixk2a1whf-abm32s-projects.vercel.app`. 

To use a local API or change the URL:

1. Open service worker console
2. Run:
   ```javascript
   chrome.storage.local.set({ apiUrl: 'https://your-api-url.com' });
   ```

## 🐛 Troubleshooting

### No Overlays Appearing?

**Possible reasons:**
1. **No Blinks on the page** - BlinkGuard only works with actual Solana Blinks
2. **Content script not loaded** - Check browser console for errors
3. **Extension disabled** - Check chrome://extensions/
4. **Overlays disabled** - Check extension popup settings

**Solution:**
- Check browser console (F12) for errors
- Verify extension is enabled
- Make sure you're on twitter.com/x.com
- Look for actual Solana Blinks (not just any link)

### Overlays Show "Unknown"?

**Possible reasons:**
1. **API server not running** - Start it with `npm run start:api`
2. **Transaction simulation failed** - Check API logs
3. **Network error** - Check if localhost:3000 is accessible

**Solution:**
- Verify API is running: `curl http://localhost:3000/health`
- Check service worker console for errors
- Check API server logs

### Extension Not Working?

1. **Reload extension:**
   - Go to chrome://extensions/
   - Click reload button on BlinkGuard

2. **Check for errors:**
   - Open service worker console
   - Open browser console on Twitter/X
   - Look for red error messages

3. **Verify setup:**
   - API server running? ✓
   - Extension enabled? ✓
   - On Twitter/X? ✓

## 📝 Reporting Malicious Blinks

If you find a dangerous Blink:

1. **Don't interact with it!**
2. Click the BlinkGuard icon
3. Look for "Report" option (if implemented)
4. Or manually report via API:
   ```bash
   curl -X POST http://localhost:3000/registry/report \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://malicious-site.com/action",
       "reason": "Drainer detected",
       "reportedBy": "your-wallet-address"
     }'
   ```

## 🎓 Understanding the Analysis

### What BlinkGuard Checks

1. **Balance Transfer Analysis**
   - Detects if >90% of balance would be transferred
   - Flags high-risk transactions

2. **Approval Risks**
   - Checks for suspicious token approvals
   - Detects unlimited approvals

3. **Contract Verification**
   - Verifies if contracts are known/trusted
   - Flags unknown programs

4. **Domain Trust**
   - Checks domain reputation
   - Validates SSL certificates

5. **Registry Match**
   - Cross-references with community database
   - Checks for known malicious URLs

## 💡 Tips for Best Experience

1. **Keep API running** - For real-time analysis
2. **Check overlays before clicking** - Always review safety badges
3. **Report suspicious Blinks** - Help the community
4. **Don't disable overlays** - They're your safety net
5. **Check console if unsure** - Debug information available

## 🚨 Important Notes

- **BlinkGuard is a tool, not a guarantee** - Always verify transactions in your wallet
- **Pre-click analysis** - Works before you interact with your wallet
- **No wallet access** - Extension never touches your wallet
- **Privacy-focused** - No personal data collected
- **Open source** - Code is auditable

## 🎯 Quick Start Checklist

- [ ] API server running (`npm run start:api`)
- [ ] Extension loaded and enabled
- [ ] On Twitter/X (twitter.com or x.com)
- [ ] See "BlinkGuard content script initialized" in console
- [ ] Find a Solana Blink in your feed
- [ ] See safety overlay badge appear
- [ ] Extension is working! 🎉

## 📞 Need Help?

- Check `DEBUGGING.md` for detailed troubleshooting
- Check browser console for error messages
- Verify API is responding: `curl http://localhost:3000/health`
- Check service worker console for background errors

---

**Remember:** BlinkGuard provides safety analysis, but always verify transactions in your wallet before confirming!

