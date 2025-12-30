/**
 * Build script for extension
 * Copies necessary files and compiles TypeScript
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const extensionDir = join(process.cwd(), 'extension');
const distDir = join(extensionDir, 'dist');
const srcDir = join(extensionDir, 'src');

// Create dist directory
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy manifest
copyFileSync(
  join(extensionDir, 'manifest.json'),
  join(distDir, 'manifest.json')
);

// Copy HTML files
copyFileSync(
  join(extensionDir, 'popup.html'),
  join(distDir, 'popup.html')
);

// Copy CSS
copyFileSync(
  join(extensionDir, 'content.css'),
  join(distDir, 'content.css')
);

// Copy icons (if they exist)
const iconsDir = join(extensionDir, 'icons');
if (existsSync(iconsDir)) {
  const iconsDist = join(distDir, 'icons');
  if (!existsSync(iconsDist)) {
    mkdirSync(iconsDist, { recursive: true });
  }
  // Copy icon files if they exist
  ['icon16.png', 'icon48.png', 'icon128.png'].forEach(icon => {
    const src = join(iconsDir, icon);
    if (existsSync(src)) {
      copyFileSync(src, join(iconsDist, icon));
    }
  });
}

console.log('Extension build complete!');

