/**
 * BlinkGuard API Server
 * Provides registry management and safety analysis endpoints
 */

import express from 'express';
import cors from 'cors';
import { MaliciousUrlEntry, SafetyAnalysis } from '../../shared/types.js';
import { checkUrlInRegistry, addMaliciousUrl, getRegistry } from './services/registryService.js';
import { analyzeTransaction } from './services/safetyService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Registry endpoints
app.get('/registry/check', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    console.log(`[${new Date().toISOString()}] Registry check requested for: ${url}`);
    const result = await checkUrlInRegistry(url);
    console.log(`[${new Date().toISOString()}] Registry check result:`, result.isMalicious ? 'MALICIOUS' : 'SAFE');
    res.json(result);
  } catch (error) {
    console.error('Registry check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/registry/latest', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Registry sync requested`);
    const registry = await getRegistry();
    console.log(`[${new Date().toISOString()}] Returning ${registry.length} registry entries`);
    res.json(registry);
  } catch (error) {
    console.error('Registry fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/registry/report', async (req, res) => {
  try {
    const { url, reason, reportedBy } = req.body;
    
    if (!url || !reason || !reportedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`[${new Date().toISOString()}] Malicious URL reported: ${url} by ${reportedBy}`);
    const entry: MaliciousUrlEntry = {
      url,
      domain: new URL(url).hostname,
      reason,
      reportedBy,
      reportedAt: Date.now(),
      verified: false
    };

    await addMaliciousUrl(entry);
    console.log(`[${new Date().toISOString()}] URL added to registry`);
    res.json({ success: true, entry });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Safety analysis endpoint
app.post('/analyze', async (req, res) => {
  try {
    const { transactionData, domain } = req.body;
    
    if (!transactionData) {
      return res.status(400).json({ error: 'Transaction data required' });
    }

    const analysis = await analyzeTransaction(transactionData, domain);
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`BlinkGuard API server running on port ${PORT}`);
});

