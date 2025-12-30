/**
 * Popup script for extension options
 */

document.addEventListener('DOMContentLoaded', () => {
  const enabledCheckbox = document.getElementById('enabled') as HTMLInputElement;
  const showOverlaysCheckbox = document.getElementById('showOverlays') as HTMLInputElement;
  const statusDiv = document.getElementById('status') as HTMLElement;

  // Load current settings
  chrome.storage.local.get(['enabled', 'showOverlays'], (result) => {
    enabledCheckbox.checked = result.enabled !== false;
    showOverlaysCheckbox.checked = result.showOverlays !== false;
    updateStatus();
  });

  // Save settings on change
  enabledCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ enabled: enabledCheckbox.checked });
    updateStatus();
  });

  showOverlaysCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ showOverlays: showOverlaysCheckbox.checked });
  });

  function updateStatus() {
    if (enabledCheckbox.checked) {
      statusDiv.textContent = '✓ Active';
      statusDiv.className = 'status enabled';
    } else {
      statusDiv.textContent = '✗ Disabled';
      statusDiv.className = 'status disabled';
    }
  }
});

