/**
 * Safety analysis endpoint for Vercel
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeTransaction } from '../src/services/safetyService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}

