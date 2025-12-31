# Deploying BlinkGuard API to Vercel

This guide walks you through deploying the BlinkGuard API to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (`npm i -g vercel`)
3. Git repository set up (for automatic deployments)

## Project Structure

The Vercel deployment uses serverless functions in the `api/` directory:

```
api/
├── health.ts              # Health check endpoint
├── analyze.ts             # Safety analysis endpoint
└── registry/
    ├── check.ts           # Check if URL is malicious
    ├── latest.ts          # Get full registry
    └── report.ts          # Report malicious URL
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:shared:api`
   - **Output Directory**: `.` (root)
   - **Install Command**: `npm install`

4. **Set Environment Variables** (if needed)
   - Go to Project Settings → Environment Variables
   - Add any required variables (e.g., `NODE_ENV=production`)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your API will be available at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm project settings
   - Deploy

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

## API Endpoints

After deployment, your API endpoints will be available at:

- `https://your-project.vercel.app/api/health` - Health check
- `https://your-project.vercel.app/api/registry/check?url=<url>` - Check URL
- `https://your-project.vercel.app/api/registry/latest` - Get full registry
- `https://your-project.vercel.app/api/registry/report` - Report malicious URL (POST)
- `https://your-project.vercel.app/api/analyze` - Analyze transaction (POST)

## Testing the Deployment

1. **Health Check**
   ```bash
   curl https://your-project.vercel.app/api/health
   ```

2. **Registry Check**
   ```bash
   curl "https://your-project.vercel.app/api/registry/check?url=https://example.com"
   ```

3. **Get Registry**
   ```bash
   curl https://your-project.vercel.app/api/registry/latest
   ```

## Configuration

### vercel.json

The `vercel.json` file configures:
- Build command for shared TypeScript files
- Function runtime (`@vercel/node`)
- URL rewrites for clean API paths

### Registry Storage

**Important**: The current implementation uses file-based storage (`data/registry.json`). In Vercel:
- **Reads**: Work from the deployed `data/registry.json` file
- **Writes**: Use `/tmp` directory (ephemeral - data is lost on function restart)

**For Production**: You should migrate to a database (PostgreSQL, MongoDB, etc.) as mentioned in the grant application. The file-based approach works for POC but is not suitable for production.

## Updating the Extension

After deploying to Vercel, update the extension to use the new API URL:

1. **Update `shared/constants.ts`**:
   ```typescript
   export const DEFAULT_API_URL = 'https://blink-guard-ixk2a1whf-abm32s-projects.vercel.app';
   ```

2. **Rebuild the extension**:
   ```bash
   npm run build:extension
   ```

3. **Or configure via extension settings**: Users can set a custom API URL in the extension popup.

## Troubleshooting

### Build Errors

If you encounter build errors:

1. **Check Node.js version**: Vercel uses Node.js 18.x by default
2. **Verify dependencies**: Ensure all dependencies are in `package.json`
3. **Check TypeScript errors**: Run `npm run build:shared:api` locally first

### Function Timeout

Vercel serverless functions have execution time limits:
- Hobby: 10 seconds
- Pro: 60 seconds

If your functions timeout:
- Optimize transaction simulation
- Add caching (Redis)
- Consider using Vercel Pro plan

### Import Errors

If you see module not found errors:
- Ensure `build:shared:api` runs before deployment
- Check import paths use `.js` extensions
- Verify `tsconfig.json` is configured correctly

## Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

- `NODE_ENV=production` (optional, set automatically)
- `VERCEL=1` (set automatically by Vercel)

## Monitoring

- **Logs**: View function logs in Vercel Dashboard → Functions
- **Analytics**: Available in Vercel Dashboard → Analytics
- **Errors**: Check Vercel Dashboard → Functions → Errors

## Next Steps

1. ✅ Deploy to Vercel
2. 🔄 Update extension to use Vercel API URL
3. 🔄 Set up database for registry (PostgreSQL)
4. 🔄 Add Redis caching layer
5. 🔄 Configure custom domain (optional)

## Support

For issues:
- Check Vercel documentation: https://vercel.com/docs
- Review function logs in Vercel Dashboard
- Open an issue on GitHub: https://github.com/Abm32/BlinkGuard

