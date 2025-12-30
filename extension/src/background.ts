/**
 * Background service worker for BlinkGuard extension
 * Handles API communication, registry updates, and cross-tab coordination
 */

import { SafetyLevel, SafetyAnalysis, MaliciousUrlEntry } from '../../shared/types';
import { checkUrlInRegistry, reportMaliciousUrl } from './services/registry';
import { analyzeTransactionSafety } from './services/safetyEngine';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('BlinkGuard installed');
  // Initialize default settings
  chrome.storage.local.set({
    enabled: true,
    rpcEndpoint: 'https://api.mainnet-beta.solana.com',
    showOverlays: true
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_BLINK') {
    handleBlinkAnalysis(message.data)
      .then(analysis => sendResponse({ success: true, analysis }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'CHECK_REGISTRY') {
    checkUrlInRegistry(message.url)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'REPORT_MALICIOUS') {
    reportMaliciousUrl(message.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleBlinkAnalysis(data: {
  url: string;
  domain: string;
  transactionData?: any;
}): Promise<SafetyAnalysis> {
  // First check registry
  const registryCheck = await checkUrlInRegistry(data.url);
  if (registryCheck.isMalicious) {
    return {
      level: SafetyLevel.HIGH_RISK,
      score: 0,
      flags: [{
        type: 'flagged_address',
        severity: 'critical',
        description: 'URL flagged in community registry'
      }],
      reasons: [`Flagged as malicious: ${registryCheck.reason}`]
    };
  }

  // If transaction data provided, analyze it
  if (data.transactionData) {
    return await analyzeTransactionSafety(data.transactionData, data.domain);
  }

  // Default to unknown if no transaction data
  return {
    level: SafetyLevel.UNKNOWN,
    score: 50,
    flags: [],
    reasons: ['No transaction data available for analysis']
  };
}

// Periodic registry sync (every 6 hours)
chrome.alarms.create('syncRegistry', { periodInMinutes: 360 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncRegistry') {
    syncRegistry();
  }
});

async function syncRegistry() {
  try {
    // Fetch latest registry from API
    const response = await fetch('https://api.blinkguard.io/registry/latest');
    const data = await response.json();
    await chrome.storage.local.set({ registry: data });
    console.log('Registry synced');
  } catch (error) {
    console.error('Failed to sync registry:', error);
  }
}

