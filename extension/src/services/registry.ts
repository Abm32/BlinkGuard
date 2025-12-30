/**
 * Registry service for malicious URL tracking
 */

import { MaliciousUrlEntry } from '../../../shared/types';

interface RegistryCheck {
  isMalicious: boolean;
  reason?: string;
  entry?: MaliciousUrlEntry;
}

/**
 * Checks if a URL is in the malicious registry
 */
export async function checkUrlInRegistry(url: string): Promise<RegistryCheck> {
  try {
    // First check local cache
    const localResult = await checkLocalRegistry(url);
    if (localResult.isMalicious) {
      return localResult;
    }

    // Then check remote API
    const response = await fetch(`https://api.blinkguard.io/registry/check?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.isMalicious) {
        // Cache the result locally
        await cacheRegistryEntry(data.entry);
        return {
          isMalicious: true,
          reason: data.entry.reason,
          entry: data.entry
        };
      }
    }

    return { isMalicious: false };
  } catch (error) {
    console.error('Registry check error:', error);
    // Fallback to local check only
    return checkLocalRegistry(url);
  }
}

/**
 * Checks local storage registry cache
 */
async function checkLocalRegistry(url: string): Promise<RegistryCheck> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['registry'], (result) => {
      const registry: MaliciousUrlEntry[] = result.registry || [];
      
      // Check exact URL match
      const exactMatch = registry.find(entry => entry.url === url);
      if (exactMatch && exactMatch.verified) {
        resolve({
          isMalicious: true,
          reason: exactMatch.reason,
          entry: exactMatch
        });
        return;
      }

      // Check domain match
      try {
        const urlObj = new URL(url);
        const domainMatch = registry.find(entry => {
          try {
            return new URL(entry.url).hostname === urlObj.hostname;
          } catch {
            return false;
          }
        });
        
        if (domainMatch && domainMatch.verified) {
          resolve({
            isMalicious: true,
            reason: domainMatch.reason,
            entry: domainMatch
          });
          return;
        }
      } catch {
        // Invalid URL, skip domain check
      }

      resolve({ isMalicious: false });
    });
  });
}

/**
 * Caches a registry entry locally
 */
async function cacheRegistryEntry(entry: MaliciousUrlEntry): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['registry'], (result) => {
      const registry: MaliciousUrlEntry[] = result.registry || [];
      
      // Check if already exists
      const exists = registry.some(e => e.url === entry.url);
      if (!exists) {
        registry.push(entry);
        chrome.storage.local.set({ registry }, () => resolve());
      } else {
        resolve();
      }
    });
  });
}

/**
 * Reports a malicious URL to the registry
 */
export async function reportMaliciousUrl(data: {
  url: string;
  reason: string;
  reportedBy: string;
}): Promise<void> {
  try {
    // Submit to API
    const response = await fetch('https://api.blinkguard.io/registry/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        reportedAt: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to report: ${response.statusText}`);
    }

    // Also cache locally (unverified)
    const entry: MaliciousUrlEntry = {
      url: data.url,
      domain: new URL(data.url).hostname,
      reason: data.reason,
      reportedBy: data.reportedBy,
      reportedAt: Date.now(),
      verified: false
    };

    await cacheRegistryEntry(entry);
  } catch (error) {
    console.error('Failed to report malicious URL:', error);
    throw error;
  }
}

