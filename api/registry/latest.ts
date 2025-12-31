/**
 * Registry latest endpoint for Vercel
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRegistry } from '../src/services/registryService.js';

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
    console.log(`[${new Date().toISOString()}] Registry sync requested`);
    const registry = await getRegistry();
    console.log(`[${new Date().toISOString()}] Returning ${registry.length} registry entries`);
    res.json(registry);
  } catch (error) {
    console.error('Registry fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

