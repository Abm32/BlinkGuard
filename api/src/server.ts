/**
 * BlinkGuard API Server
 * Provides registry management and safety analysis endpoints
 */

import express from 'express';
import cors from 'cors';
import { MaliciousUrlEntry, SafetyAnalysis } from '../../shared/types';
import { checkUrlInRegistry, addMaliciousUrl, getRegistry } from './services/registryService';
import { analyzeTransaction } from './services/safetyService';

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

    const result = await checkUrlInRegistry(url);
    res.json(result);
  } catch (error) {
    console.error('Registry check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/registry/latest', async (req, res) => {
  try {
    const registry = await getRegistry();
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

    const entry: MaliciousUrlEntry = {
      url,
      domain: new URL(url).hostname,
      reason,
      reportedBy,
      reportedAt: Date.now(),
      verified: false
    };

    await addMaliciousUrl(entry);
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

