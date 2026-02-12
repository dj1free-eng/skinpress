#!/usr/bin/env node

import { build } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildApp() {
  console.log('Building SkinPress...');
  
  // Build with Vite
  await build();
  
  // Replace BUILD_TIME in service worker
  const swPath = path.join(__dirname, 'dist', 'sw.js');
  const buildTime = Date.now().toString();
  
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf-8');
    swContent = swContent.replace('{{BUILD_TIME}}', buildTime);
    fs.writeFileSync(swPath, swContent);
    console.log(`✓ Service worker updated with BUILD_TIME: ${buildTime}`);
  }
  
  console.log('✓ Build complete!');
  console.log('\nTo deploy to GitHub Pages:');
  console.log('1. git add dist -f');
  console.log('2. git commit -m "Deploy"');
  console.log('3. git subtree push --prefix dist origin gh-pages');
  console.log('\nOr use: gh-pages -d dist');
}

buildApp().catch(console.error);
