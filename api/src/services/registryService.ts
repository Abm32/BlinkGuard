/**
 * Registry service for managing malicious URL database
 */

import { MaliciousUrlEntry } from '../../../shared/types';
import fs from 'fs/promises';
import path from 'path';

const REGISTRY_FILE = path.join(process.cwd(), 'data', 'registry.json');

interface RegistryCheck {
  isMalicious: boolean;
  reason?: string;
  entry?: MaliciousUrlEntry;
}

/**
 * Ensures registry file exists
 */
async function ensureRegistryFile(): Promise<void> {
  const dataDir = path.dirname(REGISTRY_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  try {
    await fs.access(REGISTRY_FILE);
  } catch {
    await fs.writeFile(REGISTRY_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Reads the registry from file
 */
async function readRegistry(): Promise<MaliciousUrlEntry[]> {
  await ensureRegistryFile();
  const data = await fs.readFile(REGISTRY_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Writes the registry to file
 */
async function writeRegistry(registry: MaliciousUrlEntry[]): Promise<void> {
  await ensureRegistryFile();
  await fs.writeFile(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

/**
 * Checks if a URL is in the registry
 */
export async function checkUrlInRegistry(url: string): Promise<RegistryCheck> {
  const registry = await readRegistry();
  
  // Check exact URL match
  const exactMatch = registry.find(entry => entry.url === url && entry.verified);
  if (exactMatch) {
    return {
      isMalicious: true,
      reason: exactMatch.reason,
      entry: exactMatch
    };
  }

  // Check domain match
  try {
    const urlObj = new URL(url);
    const domainMatch = registry.find(entry => {
      try {
        return new URL(entry.url).hostname === urlObj.hostname && entry.verified;
      } catch {
        return false;
      }
    });
    
    if (domainMatch) {
      return {
        isMalicious: true,
        reason: domainMatch.reason,
        entry: domainMatch
      };
    }
  } catch {
    // Invalid URL
  }

  return { isMalicious: false };
}

/**
 * Adds a malicious URL to the registry
 */
export async function addMaliciousUrl(entry: MaliciousUrlEntry): Promise<void> {
  const registry = await readRegistry();
  
  // Check if already exists
  const exists = registry.some(e => e.url === entry.url);
  if (!exists) {
    registry.push(entry);
    await writeRegistry(registry);
  } else {
    // Update existing entry
    const index = registry.findIndex(e => e.url === entry.url);
    registry[index] = entry;
    await writeRegistry(registry);
  }
}

/**
 * Gets the full registry
 */
export async function getRegistry(): Promise<MaliciousUrlEntry[]> {
  return readRegistry();
}

/**
 * Verifies a registry entry (admin function)
 */
export async function verifyEntry(url: string, verified: boolean): Promise<void> {
  const registry = await readRegistry();
  const entry = registry.find(e => e.url === url);
  
  if (entry) {
    entry.verified = verified;
    await writeRegistry(registry);
  }
}

