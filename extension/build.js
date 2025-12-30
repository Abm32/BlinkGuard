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
    } else {
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
console.log('Fixing import paths...');
const jsFiles = readdirSync(distDir).filter(f => f.endsWith('.js'));
jsFiles.forEach(file => {
  const filePath = join(distDir, file);
  const content = readFileSync(filePath, 'utf-8');
  const fixed = content.replace(/from\s+['"]\.\.\/\.\.\/shared\//g, "from '../shared/");
  writeFileSync(filePath, fixed);
});

// Also fix imports in subdirectories
function fixImportsInDir(dir) {
  const entries = readdirSync(dir);
  entries.forEach(entry => {
    const entryPath = join(dir, entry);
    const stat = statSync(entryPath);
    if (stat.isDirectory() && entry !== 'shared' && entry !== 'icons') {
      fixImportsInDir(entryPath);
    } else if (entry.endsWith('.js')) {
      const content = readFileSync(entryPath, 'utf-8');
      const fixed = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/shared\//g, "from '../../shared/");
      writeFileSync(entryPath, fixed);
    }
  });
}

fixImportsInDir(distDir);

console.log('Extension build complete!');
