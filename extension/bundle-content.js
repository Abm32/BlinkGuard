/**
 * Bundle content script for Chrome extension
 * Content scripts can't use ES modules, so we bundle everything into one file
 */

import { build } from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const extensionDir = __dirname;
const distDir = join(extensionDir, 'dist');
const srcDir = join(extensionDir, 'src');

async function bundleContentScript() {
  try {
    // First ensure dist directory exists
    const { mkdirSync, existsSync } = await import('fs');
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }

    await build({
      entryPoints: [join(srcDir, 'content.ts')],
      bundle: true,
      outfile: join(distDir, 'content.js'),
      format: 'iife',
      target: 'es2020',
      platform: 'browser',
      sourcemap: false,
      minify: false,
      external: ['chrome'],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      resolveExtensions: ['.ts', '.js'],
      loader: {
        '.ts': 'ts'
      },
      tsconfig: join(extensionDir, 'tsconfig.json'),
      inject: [],
      banner: {
        js: '// BlinkGuard Content Script'
      }
    });
    console.log('✓ Content script bundled successfully');
  } catch (error) {
    console.error('Failed to bundle content script:', error);
    process.exit(1);
  }
}

bundleContentScript();

