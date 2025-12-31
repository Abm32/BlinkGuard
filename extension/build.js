/**
 * Build script for extension
 * Copies necessary files, compiles TypeScript, and fixes output structure
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, renameSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const extensionDir = __dirname;
const distDir = join(extensionDir, 'dist');
const srcDir = join(extensionDir, 'src');

// Function to recursively move files
// Exclude content.js as it's bundled separately
function moveFiles(src, dest) {
  if (!existsSync(src)) return;
  
  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);
    
    if (stat.isDirectory()) {
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true });
      }
      moveFiles(srcPath, destPath);
    } else if (entry !== 'content.js') {
      // Don't overwrite bundled content.js
      copyFileSync(srcPath, destPath);
    }
  }
}

// Create dist directory if it doesn't exist
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Move files from extension/dist/extension/src to extension/dist
const nestedSrc = join(distDir, 'extension', 'src');
if (existsSync(nestedSrc)) {
  console.log('Moving files from nested structure...');
  moveFiles(nestedSrc, distDir);
  // Clean up nested directories
  execSync(`rm -rf ${join(distDir, 'extension')}`, { stdio: 'inherit' });
}

// Don't overwrite bundled content.js - it's already bundled
// Remove the TypeScript-compiled content.js if it exists (bundler creates the final one)
const tsContentJs = join(distDir, 'content.js');
if (existsSync(tsContentJs)) {
  // Check if it has imports (TypeScript output) vs bundled (no imports)
  const content = readFileSync(tsContentJs, 'utf-8');
  if (content.includes('import ') && !content.includes('(function() {')) {
    // This is TypeScript output, remove it (bundler already created the bundled version)
    // Actually, bundler should have overwritten it, but let's be safe
    console.log('Note: content.js should be bundled (no imports)');
  }
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
  ['icon16.png', 'icon48.png', 'icon128.png'].forEach(icon => {
    const src = join(iconsDir, icon);
    if (existsSync(src)) {
      copyFileSync(src, join(iconsDist, icon));
    }
  });
}

// Fix import paths in compiled JS files to use ./shared/ instead of ../../shared/
// Preserve .js extensions (only add if not already present)
// Skip content.js as it's already bundled
console.log('Fixing import paths...');
const jsFiles = readdirSync(distDir).filter(f => f.endsWith('.js') && f !== 'content.js');
jsFiles.forEach(file => {
  const filePath = join(distDir, file);
  const content = readFileSync(filePath, 'utf-8');
  // Fix paths - add .js only if not already present
  let fixed = content.replace(/from\s+['"]\.\.\/\.\.\/shared\/([^'"]+?)(\.js)?(['"])/g, (match, p1, p2, p3) => {
    return `from '../shared/${p1}${p2 || '.js'}${p3}`;
  });
  writeFileSync(filePath, fixed);
});

// Also fix imports in subdirectories
// Skip content.js as it's already bundled
function fixImportsInDir(dir) {
  const entries = readdirSync(dir);
  entries.forEach(entry => {
    const entryPath = join(dir, entry);
    const stat = statSync(entryPath);
    if (stat.isDirectory() && entry !== 'shared' && entry !== 'icons') {
      fixImportsInDir(entryPath);
    } else if (entry.endsWith('.js') && entry !== 'content.js') {
      const content = readFileSync(entryPath, 'utf-8');
      // Fix paths - add .js only if not already present
      const fixed = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/shared\/([^'"]+?)(\.js)?(['"])/g, (match, p1, p2, p3) => {
        return `from '../../shared/${p1}${p2 || '.js'}${p3}`;
      });
      writeFileSync(entryPath, fixed);
    }
  });
}

fixImportsInDir(distDir);

console.log('Extension build complete!');
