# Vercel Deployment Troubleshooting

## Common Issues and Solutions

### Error: "Function Runtimes must have a valid version"

**Problem:** The `vercel.json` file has an invalid runtime configuration.

**Solution:** 
- Remove the `functions` section from `vercel.json`
- Vercel auto-detects TypeScript files in `api/` directory
- No explicit runtime configuration needed

**Fixed Configuration:**
```json
{
  "buildCommand": "npm run build:shared:api"
}
```

### Import Path Issues

**Problem:** Serverless functions can't find imported modules.

**Solution:**
- Use relative imports without `.js` extension in TypeScript
- Vercel will compile TypeScript automatically
- Ensure `buildCommand` compiles shared dependencies

**Example:**
```typescript
// ✅ Correct
import { checkUrlInRegistry } from '../src/services/registryService';

// ❌ Wrong
import { checkUrlInRegistry } from '../src/services/registryService.js';
```

### Build Command Issues

**Problem:** Build fails or dependencies not found.

**Solution:**
1. Ensure `package.json` has all dependencies
2. Add Node.js version to `package.json`:
   ```json
   {
     "engines": {
       "node": "20.x"
     }
   }
   ```
3. Make sure `build:shared:api` script exists and works locally

### TypeScript Compilation Issues

**Problem:** TypeScript errors in serverless functions.

**Solution:**
- Vercel compiles TypeScript automatically
- Ensure `tsconfig.json` is configured correctly
- Check that all imports resolve correctly
- Test compilation locally: `npm run build:shared:api`

### Module Resolution Issues

**Problem:** Cannot find module errors.

**Solution:**
1. Check import paths are correct
2. Ensure shared files are compiled by build command
3. Verify `api/src/services/` files exist
4. Check that `shared/` directory files are accessible

### CORS Issues

**Problem:** CORS errors when calling API from extension.

**Solution:**
- Add CORS headers in each serverless function
- Or use Vercel's CORS configuration
- Ensure allowed origins are configured

### Environment Variables

**Problem:** Environment variables not available.

**Solution:**
1. Set in Vercel Dashboard → Project Settings → Environment Variables
2. Use `process.env.VARIABLE_NAME` in code
3. Restart deployment after adding variables

## Deployment Checklist

Before deploying to Vercel:

- [ ] `vercel.json` is simplified (no functions section)
- [ ] Node.js version specified in `package.json`
- [ ] Import paths use TypeScript (no `.js` extensions)
- [ ] Build command works locally: `npm run build:shared:api`
- [ ] All dependencies in `package.json`
- [ ] TypeScript compiles without errors
- [ ] Test functions locally if possible

## Testing Locally

You can test Vercel functions locally using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Run dev server
vercel dev

# Test endpoints
curl http://localhost:3000/api/health
```

## Getting Help

1. Check Vercel build logs for specific errors
2. Test build command locally
3. Verify all imports resolve
4. Check Vercel documentation: https://vercel.com/docs

