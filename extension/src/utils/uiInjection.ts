/**
 * UI injection utilities for safety overlays
 */

import { SafetyLevel } from '../../../shared/types';
import { SAFETY_COLORS } from '../../../shared/constants';

const OVERLAY_CLASS = 'blinkguard-overlay';
const OVERLAY_ID_PREFIX = 'blinkguard-';

/**
 * Injects a safety overlay onto a Blink element
 */
export function injectSafetyOverlay(
  element: HTMLElement,
  level: SafetyLevel,
  message: string
): void {
  // Remove existing overlay if present
  removeSafetyOverlay(element);

  // Create overlay element
  const overlay = document.createElement('div');
  const overlayId = `${OVERLAY_ID_PREFIX}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  overlay.id = overlayId;
  overlay.className = OVERLAY_CLASS;
  overlay.setAttribute('data-safety-level', level);

  // Style the overlay
  const color = SAFETY_COLORS[level] || SAFETY_COLORS.unknown;
  overlay.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: ${color};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    z-index: 10000;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  overlay.textContent = message;

  // Position relative to parent
  const parent = element.closest('[data-testid="tweet"], article, [role="article"]') || element.parentElement;
  if (parent) {
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.position === 'static') {
      (parent as HTMLElement).style.position = 'relative';
    }
    parent.appendChild(overlay);
  } else {
    element.appendChild(overlay);
  }

  // Store reference on element
  (element as any).__blinkguardOverlayId = overlayId;
}

/**
 * Removes safety overlay from an element
 */
export function removeSafetyOverlay(element: HTMLElement): void {
  const overlayId = (element as any).__blinkguardOverlayId;
  if (overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
      overlay.remove();
    }
    delete (element as any).__blinkguardOverlayId;
  }

  // Also remove any orphaned overlays
  const existingOverlays = element.querySelectorAll(`.${OVERLAY_CLASS}`);
  existingOverlays.forEach(overlay => overlay.remove());
}

/**
 * Updates an existing overlay
 */
export function updateSafetyOverlay(
  element: HTMLElement,
  level: SafetyLevel,
  message: string
): void {
  const overlayId = (element as any).__blinkguardOverlayId;
  if (overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
      overlay.setAttribute('data-safety-level', level);
      overlay.textContent = message;
      const color = SAFETY_COLORS[level] || SAFETY_COLORS.unknown;
      overlay.style.background = color;
    }
  } else {
    injectSafetyOverlay(element, level, message);
  }
}

