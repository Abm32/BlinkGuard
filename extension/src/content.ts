/**
 * Content script for Twitter/X - detects Blinks and injects safety overlays
 */

import { SafetyLevel, BlinkMetadata, SafetyAnalysis } from '../../shared/types.js';
import { SOLANA_ACTION_PREFIX, ACTION_QUERY_PARAM } from '../../shared/constants.js';
import { detectBlinks, extractBlinkMetadata } from './utils/blinkDetector.js';
import { injectSafetyOverlay, removeSafetyOverlay } from './utils/uiInjection.js';
import { simulateTransaction } from './services/transactionSimulator.js';

// Initialize DOM observer
let observer: MutationObserver | null = null;
const processedBlinks = new Set<string>();

function initBlinkGuard() {
  const hostname = window.location.hostname;
  const isTwitter = hostname.includes('twitter.com') || hostname.includes('x.com');
  const isDialTo = hostname.includes('dial.to') || hostname.includes('dialect.to');
  
  console.log('BlinkGuard content script initialized', { hostname, isTwitter, isDialTo });

  // Initial scan
  scanForBlinks();

  // Watch for new content (Twitter's infinite scroll or dial.to dynamic loading)
  observer = new MutationObserver(() => {
    scanForBlinks();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // For dial.to, also scan after a delay to catch dynamically loaded Blinks
  if (isDialTo) {
    setTimeout(() => scanForBlinks(), 1000);
    setTimeout(() => scanForBlinks(), 3000);
  }
}

async function scanForBlinks() {
  const blinks = detectBlinks();
  
  for (const blinkElement of blinks) {
    const metadata = extractBlinkMetadata(blinkElement);
    if (!metadata || processedBlinks.has(metadata.url)) {
      continue;
    }

    processedBlinks.add(metadata.url);
    await analyzeAndInjectOverlay(blinkElement, metadata);
  }
}

async function analyzeAndInjectOverlay(element: HTMLElement, metadata: BlinkMetadata) {
  // Show loading state
  injectSafetyOverlay(element, SafetyLevel.UNKNOWN, 'Analyzing...');
  
  console.log('BlinkGuard: Analyzing Blink', {
    url: metadata.url,
    domain: metadata.domain,
    actionUrl: metadata.actionUrl
  });

  try {
    // Fetch action metadata
    const actionMetadata = await fetchActionMetadata(metadata.actionUrl);
    
    // Simulate transaction
    const simulation = await simulateTransaction(metadata.actionUrl);
    console.log('BlinkGuard: Transaction simulation result', simulation);
    
    // Request safety analysis from background
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_BLINK',
      data: {
        url: metadata.url,
        domain: metadata.domain,
        transactionData: simulation
      }
    });

    if (response && response.success) {
      const analysis: SafetyAnalysis = response.analysis;
      console.log('BlinkGuard: Safety analysis', analysis);
      injectSafetyOverlay(element, analysis.level, getSafetyMessage(analysis));
    } else {
      console.warn('BlinkGuard: Analysis failed', response);
      injectSafetyOverlay(element, SafetyLevel.UNKNOWN, 'Analysis failed');
    }
  } catch (error) {
    console.error('BlinkGuard: Error analyzing blink', error);
    injectSafetyOverlay(element, SafetyLevel.UNKNOWN, 'Unable to analyze');
  }
}

async function fetchActionMetadata(actionUrl: string): Promise<any> {
  try {
    const url = new URL(actionUrl);
    const metadataUrl = `${url.origin}/actions.json`;
    const response = await fetch(metadataUrl);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch action metadata:', error);
    return null;
  }
}

function getSafetyMessage(analysis: SafetyAnalysis): string {
  switch (analysis.level) {
    case SafetyLevel.SAFE:
      return '✓ Verified Safe';
    case SafetyLevel.CAUTION:
      return '⚠ Caution';
    case SafetyLevel.HIGH_RISK:
      return '✗ High Risk';
    default:
      return '? Unknown';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initBlinkGuard();
    exposeTestFunctions();
  });
} else {
  initBlinkGuard();
  exposeTestFunctions();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (observer) {
    observer.disconnect();
  }
});

// Expose test functions to page context
// Use chrome.scripting.executeScript via background script to bypass CSP
function exposeTestFunctions() {
  // Always set up message bridge first
  setupMessageBridge();
  
  // Request background script to inject into page context
  chrome.runtime.sendMessage({
    type: 'INJECT_TEST_FUNCTIONS',
    tabId: null // Background will get current tab
  }).then(() => {
    console.log('BlinkGuard: Injection request sent to background');
    // Retry injection silently if it doesn't appear after a longer delay
    setTimeout(() => {
      // Only retry once, silently (test functions are optional for debugging)
      chrome.runtime.sendMessage({
        type: 'INJECT_TEST_FUNCTIONS',
        tabId: null
      }).catch(() => {
        // Ignore errors - test functions are optional
      });
    }, 1500); // Longer delay to allow injection to complete
  }).catch((error) => {
    // Only log real errors, not timing issues
    if (error.message && !error.message.includes('Receiving end')) {
      console.error('BlinkGuard: Failed to request injection:', error);
    }
  });
}

// Set up message bridge between page context and content script
function setupMessageBridge() {
  // Listen for messages from page context
  window.addEventListener('message', (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'BLINKGUARD_SCAN_BLINKS') {
      const blinks = detectBlinks();
      window.postMessage({ 
        type: 'BLINKGUARD_SCAN_BLINKS_RESULT', 
        blinks: blinks.length 
      }, '*');
    } else if (event.data && event.data.type === 'BLINKGUARD_CHECK_REGISTRY') {
      chrome.runtime.sendMessage({
        type: 'CHECK_REGISTRY',
        url: event.data.url
      }).then(response => {
        window.postMessage({ 
          type: 'BLINKGUARD_CHECK_REGISTRY_RESULT', 
          result: response 
        }, '*');
      }).catch(err => {
        window.postMessage({ 
          type: 'BLINKGUARD_CHECK_REGISTRY_RESULT', 
          result: { error: err.message } 
        }, '*');
      });
    } else if (event.data && event.data.type === 'BLINKGUARD_GET_PROCESSED') {
      window.postMessage({ 
        type: 'BLINKGUARD_GET_PROCESSED_RESULT', 
        blinks: Array.from(processedBlinks) 
      }, '*');
    }
  });
  
  console.log('BlinkGuard: Message bridge set up');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initBlinkGuard();
    exposeTestFunctions();
  });
} else {
  initBlinkGuard();
  exposeTestFunctions();
}

window.addEventListener('beforeunload', () => {
  if (observer) {
    observer.disconnect();
  }
});

