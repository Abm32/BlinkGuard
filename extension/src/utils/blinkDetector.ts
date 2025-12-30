/**
 * Utility functions to detect Solana Blinks in the DOM
 */

import { BlinkMetadata } from '../../../shared/types';
import { SOLANA_ACTION_PREFIX, ACTION_QUERY_PARAM } from '../../../shared/constants';

/**
 * Detects all Blink elements in the current DOM
 */
export function detectBlinks(): HTMLElement[] {
  const blinks: HTMLElement[] = [];

  // Method 1: Find elements with solana-action: protocol in href
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="solana-action:"]');
  links.forEach(link => blinks.push(link));

  // Method 2: Find elements with action query parameter
  const actionLinks = document.querySelectorAll<HTMLAnchorElement>('a[href*="action="]');
  actionLinks.forEach(link => {
    try {
      const url = new URL(link.href);
      if (url.searchParams.has(ACTION_QUERY_PARAM)) {
        blinks.push(link);
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

  if (element instanceof HTMLAnchorElement) {
    url = element.href;
  } else {
    const link = element.querySelector<HTMLAnchorElement>('a[href]');
    url = link?.href || null;
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
      actionUrl = urlObj.searchParams.get(ACTION_QUERY_PARAM) || url;
    }

    const domain = new URL(actionUrl).hostname;

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

