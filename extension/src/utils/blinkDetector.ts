/**
 * Utility functions to detect Solana Blinks in the DOM
 */

import { BlinkMetadata } from '../../../shared/types.js';
import { SOLANA_ACTION_PREFIX, ACTION_QUERY_PARAM } from '../../../shared/constants.js';

/**
 * Detects all Blink elements in the current DOM
 */
export function detectBlinks(): HTMLElement[] {
  const blinks: HTMLElement[] = [];

  // Method 1: Find elements with solana-action: protocol in href
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="solana-action:"]');
  links.forEach(link => blinks.push(link));

  // Method 2: Find elements with action query parameter (including dial.to links)
  const actionLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="action="]');
  actionLinks.forEach(link => {
    try {
      const url = new URL(link.href);
      const actionParam = url.searchParams.get(ACTION_QUERY_PARAM);
      if (actionParam) {
        // Check if it contains solana-action (even if URL-encoded)
        if (actionParam.includes('solana-action') || decodeURIComponent(actionParam).includes('solana-action')) {
          blinks.push(link);
        }
      }
    } catch {
      // Invalid URL, skip
    }
  });

  // Method 3: Find Twitter card elements that might contain Blinks
  // Twitter/X often wraps links in specific containers
  const twitterCards = document.querySelectorAll('[data-testid="tweet"]');
  twitterCards.forEach(card => {
    const cardLinks = card.querySelectorAll<HTMLAnchorElement>('a[href]');
    cardLinks.forEach(link => {
      if (isBlinkUrl(link.href)) {
        blinks.push(link);
      }
    });
  });

  // Method 4: Detect rendered Blinks on dial.to and other Blink viewers
  // Look for Dialect/Blink UI elements (buttons, action containers)
  const dialectElements = document.querySelectorAll<HTMLElement>(
    '[class*="dialect"], [class*="blink"], [class*="action"], [data-blink], [data-action], button[class*="vote"], button[class*="poll"]'
  );
  dialectElements.forEach(el => {
    // Check if it's actually a Blink action element
    const isActionButton = el.tagName === 'BUTTON' || el.closest('button');
    const hasActionAttr = el.getAttribute('data-action') || el.getAttribute('data-blink');
    const isVoteButton = el.textContent && (el.textContent.includes('vote') || el.textContent.includes('Vote'));
    
    if (isActionButton || hasActionAttr || isVoteButton) {
      // Find the parent container that represents the Blink
      const container = el.closest('[class*="blink"], [class*="action"], [class*="poll"], main, [role="main"]') || el;
      if (!blinks.includes(container as HTMLElement)) {
        blinks.push(container as HTMLElement);
      }
    }
  });

  // Method 5: Check for Blink metadata in page (dial.to, etc.)
  const actionMeta = document.querySelector('meta[property="og:type"][content*="action"]') || 
                     document.querySelector('meta[name="dscvr:canvas:version"]') ||
                     document.querySelector('meta[property="fc:frame"]');
  if (actionMeta) {
    // Find the main content container
    const mainContent = document.querySelector('main, [role="main"], .blink-container, [class*="blink"]');
    if (mainContent) {
      blinks.push(mainContent as HTMLElement);
    }
  }

  return Array.from(new Set(blinks)); // Remove duplicates
}

/**
 * Checks if a URL is a Solana Blink
 */
export function isBlinkUrl(url: string): boolean {
  if (!url) return false;
  
  // Check for solana-action: protocol
  if (url.startsWith(SOLANA_ACTION_PREFIX)) {
    return true;
  }

  // Check for action query parameter
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.has(ACTION_QUERY_PARAM);
  } catch {
    return false;
  }
}

/**
 * Extracts metadata from a Blink element
 */
export function extractBlinkMetadata(element: HTMLElement): BlinkMetadata | null {
  let url: string | null = null;

  // Method 1: Direct link element
  if (element instanceof HTMLAnchorElement) {
    url = element.href;
  } else {
    // Method 2: Find link within element
    const link = element.querySelector<HTMLAnchorElement>('a[href]');
    url = link?.href || null;
  }

  // Method 3: For rendered Blinks on dial.to, check current page URL
  if (!url || !isBlinkUrl(url)) {
    const currentUrl = window.location.href;
    if (isBlinkUrl(currentUrl)) {
      url = currentUrl;
    }
  }

  // Method 4: Check for Blink URL in page metadata or data attributes
  if (!url || !isBlinkUrl(url)) {
    const actionUrl = element.getAttribute('data-action-url') || 
                     element.getAttribute('data-blink-url') ||
                     element.closest('[data-action-url]')?.getAttribute('data-action-url');
    if (actionUrl && isBlinkUrl(actionUrl)) {
      url = actionUrl;
    }
  }

  if (!url || !isBlinkUrl(url)) {
    return null;
  }

  try {
    let actionUrl: string;
    
    if (url.startsWith(SOLANA_ACTION_PREFIX)) {
      actionUrl = url.substring(SOLANA_ACTION_PREFIX.length);
    } else {
      const urlObj = new URL(url);
      const actionParam = urlObj.searchParams.get(ACTION_QUERY_PARAM);
      
      if (actionParam) {
        // Handle URL-encoded solana-action: URLs (e.g., from Dial.to)
        if (actionParam.startsWith(SOLANA_ACTION_PREFIX)) {
          actionUrl = actionParam.substring(SOLANA_ACTION_PREFIX.length);
        } else if (actionParam.startsWith('solana-action%3A') || actionParam.includes('solana-action:')) {
          // Decode URL-encoded solana-action:
          const decoded = decodeURIComponent(actionParam);
          if (decoded.startsWith(SOLANA_ACTION_PREFIX)) {
            actionUrl = decoded.substring(SOLANA_ACTION_PREFIX.length);
          } else {
            actionUrl = decoded;
          }
        } else {
          actionUrl = actionParam;
        }
      } else {
        actionUrl = url;
      }
    }

    // Validate and extract domain
    let domain: string;
    try {
      domain = new URL(actionUrl).hostname;
    } catch {
      // If actionUrl is not a valid URL, try to extract from original URL
      domain = new URL(url).hostname;
    }

    return {
      url,
      domain,
      actionUrl,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to extract blink metadata:', error);
    return null;
  }
}

