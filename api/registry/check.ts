/**
 * Registry check endpoint for Vercel
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkUrlInRegistry } from '../src/services/registryService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}

