# API Request Flow - When Requests Are Sent

## 🔄 When API Requests Happen

### 1. **Registry Check** (When Blink is Detected)
**When:** Every time a new Solana Blink is found on Twitter/X

**Flow:**
```
User scrolls Twitter/X
  ↓
Extension detects Blink
  ↓
Checks LOCAL cache first (fast, no API call)
  ↓
If NOT in local cache → API call: GET /registry/check?url=...
  ↓
If found in API → Caches locally (no more API calls for this URL)
```

**API Endpoint:** `GET /registry/check?url=<blink-url>`

**Why you might not see requests:**
- ✅ Blink already in local cache → No API call
- ✅ No Blinks on the page → No API call
- ✅ First time checking a URL → API call happens

### 2. **Registry Sync** (Periodic)
**When:** Every 6 hours (via Chrome alarm)

**Flow:**
```
Chrome alarm triggers (every 6 hours)
  ↓
API call: GET /registry/latest
  ↓
Updates local cache with latest registry
```

**API Endpoint:** `GET /registry/latest`

**Note:** This happens in the background, you might not see it immediately

### 3. **Report Malicious URL** (Manual)
**When:** User reports a suspicious Blink

**Flow:**
```
User clicks "Report" button
  ↓
API call: POST /registry/report
  ↓
URL added to registry (unverified)
```

**API Endpoint:** `POST /registry/report`

## 📊 Detection Flow (Complete)

```
1. User browses Twitter/X
   ↓
2. Content script detects DOM changes
   ↓
3. Scans for solana-action: URLs
   ↓
4. For each Blink found:
   ├─ Extract metadata (URL, domain)
   ├─ Check LOCAL registry cache
   │   ├─ If found → Use cached result (NO API CALL)
   │   └─ If NOT found → API call: /registry/check
   ├─ Fetch transaction from Action API (NOT your API)
   ├─ Simulate transaction via Solana RPC (NOT your API)
   ├─ Analyze safety locally (NOT your API)
   └─ Show overlay badge
```

## 🎯 Why You're Not Seeing Requests

### Reason 1: No Blinks on Page
- **Solution:** You need actual Solana Blinks (`solana-action:` URLs) on Twitter/X
- **Test:** Look for tweets from Solana projects

### Reason 2: Local Cache Hit
- **Solution:** The URL was already checked and cached locally
- **Test:** Clear cache or check a new Blink URL

### Reason 3: Analysis Happens Locally
- **Important:** Most analysis (transaction simulation, safety heuristics) happens **locally**
- **API is only used for:** Registry lookups (malicious URL database)

### Reason 4: Registry Sync Not Triggered Yet
- **Solution:** Registry sync happens every 6 hours
- **Test:** Manually trigger it (see below)

## 🧪 How to Test API Requests

### Test 1: Force Registry Check
Open browser console on Twitter/X and run:
```javascript
// This will trigger a registry check
chrome.runtime.sendMessage({
  type: 'CHECK_REGISTRY',
  url: 'https://example.com/test-blink'
}, (response) => {
  console.log('Registry check:', response);
});
```

### Test 2: Manually Trigger Registry Sync
Open service worker console and run:
```javascript
// Manually sync registry
chrome.storage.local.get(['apiUrl'], (result) => {
  const apiUrl = result.apiUrl || 'http://localhost:3000';
  fetch(`${apiUrl}/registry/latest`)
    .then(r => r.json())
    .then(data => {
      chrome.storage.local.set({ registry: data });
      console.log('Registry synced manually:', data);
    });
});
```

### Test 3: Check if Blinks Are Detected
Open browser console on Twitter/X:
```javascript
// Check if content script is running
console.log('BlinkGuard active');

// Manually trigger scan
// (This is internal, but you can check console for "BlinkGuard content script initialized")
```

### Test 4: Add Test Blink to Page
Create a test Blink on the page:
```javascript
// In browser console on Twitter/X
const testLink = document.createElement('a');
testLink.href = 'solana-action:https://jup.ag/swap';
testLink.textContent = 'Test Blink';
testLink.style.cssText = 'display: block; padding: 10px; background: #f0f0f0; margin: 10px;';
document.body.appendChild(testLink);
// BlinkGuard should detect this and make API call
```

## 🔍 Monitoring API Requests

### In API Server Terminal
You should see requests like:
```
GET /registry/check?url=... 200
GET /registry/latest 200
POST /registry/report 200
```

### In Browser Console
Check Network tab:
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by "localhost:3000"
4. You'll see API requests when they happen

### In Service Worker Console
1. Go to `chrome://extensions/`
2. Click "service worker" on BlinkGuard
3. Check console for:
   - "Registry synced" (every 6 hours)
   - API fetch errors
   - Registry check logs

## 📝 Expected Behavior

### Normal Operation
- **Most requests:** Local cache hits (no API calls)
- **Occasional requests:** New Blink URLs not in cache
- **Periodic requests:** Registry sync every 6 hours
- **Rare requests:** User reports malicious URLs

### When You'll See Lots of Requests
- First time using extension (no cache)
- Many new Blinks on page
- Registry sync triggered
- User reporting multiple URLs

## 🐛 Debugging: Why No Requests?

### Check 1: Is Extension Detecting Blinks?
```javascript
// In browser console on Twitter/X
// Should see: "BlinkGuard content script initialized"
```

### Check 2: Are There Actual Blinks?
- Look for `solana-action:` URLs in page source
- Check if tweets contain Solana Blinks
- Not all links are Blinks!

### Check 3: Is Local Cache Working?
```javascript
// In service worker console
chrome.storage.local.get(['registry'], (result) => {
  console.log('Local registry:', result.registry);
});
```

### Check 4: Is API Reachable?
```bash
# In terminal
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":...}
```

## 💡 Key Points

1. **API is for registry only** - Most analysis is local
2. **Local cache reduces API calls** - Good for performance
3. **Requests happen when:**
   - New Blink detected (not in cache)
   - Registry sync (every 6 hours)
   - User reports URL
4. **No requests = Normal** if:
   - No Blinks on page
   - All Blinks already cached
   - Analysis happening locally

## 🎯 Summary

**API requests will appear when:**
- ✅ A new Solana Blink is detected (not in local cache)
- ✅ Registry sync runs (every 6 hours)
- ✅ User reports a malicious URL

**You won't see requests if:**
- ❌ No Blinks on the page
- ❌ Blinks already in local cache
- ❌ Analysis happening locally (which is most of it!)

The extension is designed to minimize API calls for performance, so **not seeing constant requests is normal and expected!**

