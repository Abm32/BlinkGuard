# Vercel Deployment Protection - How to Access Your API

## Issue: "Authentication Required" Page

When you access your Vercel deployment URL, you see an authentication page instead of your API. This is because **Vercel Deployment Protection** is enabled by default on preview deployments.

## Why This Happens

Vercel automatically enables deployment protection on:
- Preview deployments (non-production)
- Branch deployments
- Pull request deployments

This protects your API from unauthorized access during development.

## Solutions

### Option 1: Disable Deployment Protection (Recommended for Public API)

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to **Settings** → **Deployment Protection**

2. **Disable for Preview Deployments**
   - Find "Preview Deployments"
   - Toggle off "Enable Deployment Protection"
   - Save changes

3. **Redeploy**
   - The next deployment will be publicly accessible
   - Or trigger a redeploy manually

### Option 2: Use Production Deployment

Production deployments (from `main` branch) are typically public by default:

1. **Merge to main branch**
2. **Deploy to production**
3. **Access via production URL** (usually `your-project.vercel.app`)

### Option 3: Access with Bypass Token (For Testing)

If you need to test the preview deployment:

1. **Get Bypass Token**
   - Go to Vercel Dashboard → Project → Settings → Deployment Protection
   - Copy the bypass token

2. **Use Token in URL**
   ```
   https://your-deployment-url/api/health?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN
   ```

3. **Or Use in curl**
   ```bash
   curl "https://your-deployment-url/api/health?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN"
   ```

## Recommended Setup for BlinkGuard

Since BlinkGuard is a **public API** that needs to be accessible from:
- Browser extensions
- External websites
- Public clients

**You should:**

1. ✅ **Disable deployment protection** for preview deployments
2. ✅ **Keep it enabled** for production (optional, but recommended for security)
3. ✅ **Use environment-specific URLs**:
   - Preview: `your-project-git-branch-username.vercel.app` (public)
   - Production: `your-project.vercel.app` (public)

## Steps to Make API Public

### Quick Fix (5 minutes)

1. **Vercel Dashboard** → Your Project
2. **Settings** → **Deployment Protection**
3. **Preview Deployments** → Toggle **OFF**
4. **Save**
5. **Redeploy** (or wait for next commit)

### Verify It Works

After disabling protection, test:

```bash
# Health check
curl https://your-deployment-url/api/health

# Should return:
# {"status":"ok","timestamp":1234567890,"service":"BlinkGuard API"}
```

## Alternative: Use Production Branch

If you want to keep preview protection but have a public API:

1. **Create a production branch** (e.g., `production`)
2. **Deploy production branch** to production
3. **Use production URL** in your extension
4. **Keep preview deployments protected** for testing

## Security Considerations

### For Public API (BlinkGuard)

**Disable protection because:**
- ✅ API needs to be accessible from browser extensions
- ✅ No sensitive data (read-only analysis)
- ✅ Public registry is by design
- ✅ Rate limiting provides protection instead

**Still secure because:**
- ✅ Rate limiting (implement security fixes)
- ✅ Input validation
- ✅ CORS restrictions
- ✅ No authentication required (public good)

### For Private API

**Keep protection enabled if:**
- ❌ API contains sensitive data
- ❌ Requires authentication
- ❌ Internal use only

## Troubleshooting

### Still Seeing Auth Page After Disabling?

1. **Wait a few minutes** - Changes may take time to propagate
2. **Clear browser cache** - Old auth page may be cached
3. **Try incognito/private window**
4. **Check deployment logs** - Ensure deployment succeeded
5. **Verify settings** - Double-check protection is disabled

### API Still Not Accessible?

1. **Check deployment status** - Ensure deployment completed successfully
2. **Check function logs** - Look for errors in Vercel Dashboard
3. **Test with curl** - Bypass browser caching
4. **Check CORS** - Ensure your origin is allowed

## Next Steps

After making your API public:

1. ✅ Test all endpoints
2. ✅ Update extension to use Vercel URL
3. ✅ Implement security fixes (rate limiting, etc.)
4. ✅ Monitor usage and errors

## Summary

**For BlinkGuard:** Disable deployment protection on preview deployments to make the API publicly accessible. This is safe because:
- The API is designed to be public
- No sensitive data is exposed
- Security is handled via rate limiting and validation (not deployment protection)

