# Quick Security Fixes for Production

## 🚨 Critical Fixes (Do Before Production)

### 1. Install Security Dependencies

```bash
npm install express-rate-limit express-validator helmet
npm install --save-dev @types/express-rate-limit
```

### 2. Update API Server (`api/src/server.ts`)

Add these imports at the top:
```typescript
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, query, validationResult } from 'express-validator';
```

Add security middleware after `app.use(express.json())`:
```typescript
// Security headers
app.use(helmet());

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// Stricter rate limiting for report endpoint
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Only 10 reports per hour per IP
  message: 'Too many reports from this IP, please try again later.',
});

// Request size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// CORS restrictions
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://twitter.com',
      'https://x.com',
      'https://dial.to',
      'https://*.dialect.to',
      process.env.ALLOWED_ORIGIN // Add custom origins via env var
    ].filter(Boolean);
    
    // Allow Chrome extensions (they have chrome-extension:// origin)
    if (origin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 3. Add Input Validation to Report Endpoint

Replace the `/registry/report` endpoint:
```typescript
app.post('/registry/report', 
  reportLimiter, // Apply rate limiting
  [
    body('url')
      .isURL({ protocols: ['http', 'https'] })
      .withMessage('Invalid URL format')
      .isLength({ max: 2048 })
      .withMessage('URL too long'),
    body('reason')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters')
      .escape(), // Sanitize input
    body('reportedBy')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid reporter ID')
      .escape()
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { url, reason, reportedBy } = req.body;
      
      // Additional validation
      try {
        new URL(url); // Ensure URL is valid
      } catch {
        return res.status(400).json({ error: 'Invalid URL' });
      }

      console.log(`[${new Date().toISOString()}] Malicious URL reported: ${url} by ${reportedBy}`);
      const entry: MaliciousUrlEntry = {
        url: url.trim(),
        domain: new URL(url).hostname,
        reason: reason.trim(),
        reportedBy: reportedBy.trim(),
        reportedAt: Date.now(),
        verified: false // Always start as unverified
      };

      await addMaliciousUrl(entry);
      console.log(`[${new Date().toISOString()}] URL added to registry (unverified)`);
      res.json({ 
        success: true, 
        message: 'Report submitted. It will be reviewed before being added to the registry.',
        entry 
      });
    } catch (error) {
      console.error('Report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
```

### 4. Add Input Validation to Check Endpoint

Replace the `/registry/check` endpoint:
```typescript
app.get('/registry/check',
  [
    query('url')
      .isURL({ protocols: ['http', 'https'] })
      .withMessage('Invalid URL format')
      .isLength({ max: 2048 })
      .withMessage('URL too long')
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter required' });
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      console.log(`[${new Date().toISOString()}] Registry check requested for: ${url}`);
      const result = await checkUrlInRegistry(url);
      console.log(`[${new Date().toISOString()}] Registry check result:`, result.isMalicious ? 'MALICIOUS' : 'SAFE');
      res.json(result);
    } catch (error) {
      console.error('Registry check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
```

### 5. Add Error Handling Middleware

Add at the end of `server.ts` (before `app.listen`):
```typescript
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      stack: err.stack 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});
```

### 6. Update package.json

Add the new dependencies:
```json
{
  "dependencies": {
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0"
  }
}
```

### 7. Create .env.example

Create `api/.env.example`:
```bash
# API Configuration
PORT=3000
NODE_ENV=production

# Security
API_KEY=your-secret-api-key-here
ALLOWED_ORIGIN=https://yourdomain.com

# RPC (optional)
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

### 8. Update Vercel Functions

For Vercel deployment, add rate limiting to each function. Update `api/registry/report.ts`:

```typescript
import rateLimit from 'express-rate-limit';

// Vercel serverless functions need different rate limiting
// Use a simple in-memory store (resets on function restart)
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Use memory store for serverless
  store: new rateLimit.MemoryStore(),
});

export default reportLimiter(async (req, res) => {
  // ... existing handler code
});
```

## ✅ Testing the Security Fixes

### Test Rate Limiting
```bash
# Should work
curl http://localhost:3000/api/health

# Make 101 requests quickly - should get rate limited
for i in {1..101}; do curl http://localhost:3000/api/health; done
```

### Test Input Validation
```bash
# Should fail (invalid URL)
curl "http://localhost:3000/api/registry/check?url=not-a-url"

# Should fail (missing fields)
curl -X POST http://localhost:3000/api/registry/report \
  -H "Content-Type: application/json" \
  -d '{"url":"invalid"}'
```

### Test CORS
```bash
# Should work from allowed origin
curl -H "Origin: https://twitter.com" http://localhost:3000/api/health

# Should fail from disallowed origin
curl -H "Origin: https://evil.com" http://localhost:3000/api/health
```

## 📋 Security Checklist

After implementing these fixes:

- [ ] Rate limiting installed and configured
- [ ] Input validation on all endpoints
- [ ] CORS restricted to known origins
- [ ] Request size limits set
- [ ] Error handling doesn't expose stack traces in production
- [ ] `.env` file added to `.gitignore`
- [ ] `.env.example` created (without secrets)
- [ ] Security headers added (helmet)
- [ ] All endpoints tested with invalid input
- [ ] Rate limiting tested

## 🚀 Next Steps

1. Implement these fixes
2. Test thoroughly
3. Deploy to staging environment
4. Monitor for attacks
5. Set up alerts for suspicious activity

See `docs/technical/SECURITY_ANALYSIS.md` for comprehensive security documentation.

