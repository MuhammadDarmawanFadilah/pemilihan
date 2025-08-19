#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development server with PWA...');

// Generate service worker first
console.log('📦 Generating service worker...');
const generateSW = spawn('node', ['scripts/generate-sw.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

generateSW.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to generate service worker');
    process.exit(1);
  }
  
  console.log('✅ Service worker generated successfully');
  console.log('🏃 Starting Next.js development server...');
  
  // Start Next.js development server
  const nextDev = spawn('next', ['dev', '--turbopack'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  nextDev.on('close', (code) => {
    console.log(`Development server exited with code ${code}`);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    nextDev.kill('SIGINT');
    process.exit(0);
  });
});