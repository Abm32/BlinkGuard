/**
 * Content script for Twitter/X - detects Blinks and injects safety overlays
 */

import { SafetyLevel, BlinkMetadata, SafetyAnalysis } from '../../shared/types';
import { SOLANA_ACTION_PREFIX, ACTION_QUERY_PARAM } from '../../shared/constants';
import { detectBlinks, extractBlinkMetadata } from './utils/blinkDetector';
import { injectSafetyOverlay, removeSafetyOverlay } from './utils/uiInjection';
import { simulateTransaction } from './services/transactionSimulator';

// Initialize DOM observer
let observer: MutationObserver | null = null;
const processedBlinks = new Set<string>();

function initBlinkGuard() {
  console.log('BlinkGuard content script initialized');

  // Initial scan
  scanForBlinks();

  // Watch for new content (Twitter's infinite scroll)
  observer = new MutationObserver(() => {
    scanForBlinks();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
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

  try {
    // Fetch action metadata
    const actionMetadata = await fetchActionMetadata(metadata.actionUrl);
    
    // Simulate transaction
    const simulation = await simulateTransaction(metadata.actionUrl);
    
    // Request safety analysis from background
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_BLINK',
      data: {
        url: metadata.url,
        domain: metadata.domain,
        transactionData: simulation
      }
    });

    if (response.success) {
      const analysis: SafetyAnalysis = response.analysis;
      injectSafetyOverlay(element, analysis.level, getSafetyMessage(analysis));
    } else {
      injectSafetyOverlay(element, SafetyLevel.UNKNOWN, 'Analysis failed');
    }
  } catch (error) {
    console.error('Error analyzing blink:', error);
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
  document.addEventListener('DOMContentLoaded', initBlinkGuard);
} else {
  initBlinkGuard();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (observer) {
    observer.disconnect();
  }
});

