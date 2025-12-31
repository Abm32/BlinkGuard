/**
 * Registry report endpoint for Vercel
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MaliciousUrlEntry } from '../../shared/types';
import { addMaliciousUrl } from '../src/services/registryService';

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
}

