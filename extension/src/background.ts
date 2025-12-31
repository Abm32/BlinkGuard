/**
 * Background service worker for BlinkGuard extension
 * Handles API communication, registry updates, and cross-tab coordination
 */

import { SafetyLevel, SafetyAnalysis, MaliciousUrlEntry } from '../../shared/types.js';
import { checkUrlInRegistry, reportMaliciousUrl } from './services/registry.js';
import { analyzeTransactionSafety } from './services/safetyEngine.js';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('BlinkGuard installed');
  // Initialize default settings
  chrome.storage.local.set({
    enabled: true,
    rpcEndpoint: 'https://api.mainnet-beta.solana.com',
    showOverlays: true
  });
  
  // Set up periodic registry sync (every 6 hours)
  try {
    if (chrome.alarms && chrome.alarms.create) {
      chrome.alarms.create('syncRegistry', { periodInMinutes: 360 });
    }
  } catch (error) {
    console.warn('Failed to create alarm:', error);
  }
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

  if (message.type === 'INJECT_TEST_FUNCTIONS') {
    // Inject test functions into page context (MAIN world) to bypass CSP
    // Use sender.tab.id from the message instead of querying
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        func: () => {
            // This code runs in the page context, not content script context
            (window as any).blinkGuardTest = {
              scanBlinks: function() {
                console.log('BlinkGuard: Scanning for Blinks from page context...');
                return new Promise((resolve) => {
                  window.postMessage({ type: 'BLINKGUARD_SCAN_BLINKS' }, '*');
                  const handler = (event: MessageEvent) => {
                    if (event.data && event.data.type === 'BLINKGUARD_SCAN_BLINKS_RESULT') {
                      window.removeEventListener('message', handler);
                      resolve(event.data.blinks);
                    }
                  };
                  window.addEventListener('message', handler);
                });
              },
              checkRegistry: function(url: string) {
                console.log('BlinkGuard: Checking registry for:', url);
                return new Promise((resolve) => {
                  window.postMessage({ type: 'BLINKGUARD_CHECK_REGISTRY', url }, '*');
                  const handler = (event: MessageEvent) => {
                    if (event.data && event.data.type === 'BLINKGUARD_CHECK_REGISTRY_RESULT') {
                      window.removeEventListener('message', handler);
                      resolve(event.data.result);
                    }
                  };
                  window.addEventListener('message', handler);
                });
              },
              getProcessedBlinks: function() {
                return new Promise((resolve) => {
                  window.postMessage({ type: 'BLINKGUARD_GET_PROCESSED' }, '*');
                  const handler = (event: MessageEvent) => {
                    if (event.data && event.data.type === 'BLINKGUARD_GET_PROCESSED_RESULT') {
                      window.removeEventListener('message', handler);
                      resolve(event.data.blinks);
                    }
                  };
                  window.addEventListener('message', handler);
                });
              },
              test: function() {
                console.log('BlinkGuard: Test functions are working from page context!');
                return 'BlinkGuard is active';
              }
            };
            console.log('BlinkGuard: Test functions injected into page context');
            console.log('BlinkGuard: Try: window.blinkGuardTest.test()');
          }
        }).catch((error) => {
          console.error('BlinkGuard: Failed to inject test functions:', error);
        });
    } else {
      console.warn('BlinkGuard: No tab ID available for injection');
    }
    sendResponse({ success: true });
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

// Periodic registry sync alarm listener
try {
  if (chrome.alarms && chrome.alarms.onAlarm) {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'syncRegistry') {
        syncRegistry();
      }
    });
  }
} catch (error) {
  console.warn('Failed to set up alarm listener:', error);
}

async function syncRegistry() {
  try {
    // Get API URL from storage
    const apiUrl = await new Promise<string>((resolve) => {
      chrome.storage.local.get(['apiUrl'], (result) => {
        resolve(result.apiUrl || 'https://blink-guard-ixk2a1whf-abm32s-projects.vercel.app');
      });
    });
    
    // Fetch latest registry from API
    const response = await fetch(`${apiUrl}/registry/latest`);
    const data = await response.json();
    await chrome.storage.local.set({ registry: data });
    console.log('Registry synced');
  } catch (error) {
    console.error('Failed to sync registry:', error);
  }
}

