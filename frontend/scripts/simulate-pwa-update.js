#!/usr/bin/env node

/**
 * PWA Update Simulation Script for Trensilapor
 * Simulates deployment to test PWA update functionality
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 PWA Update Simulation - Trensilapor');
console.log('=====================================');

console.log('');
console.log('This script will:');
console.log('1. Generate a new service worker with unique deployment ID');
console.log('2. Simulate a production build');
console.log('3. Show you the new deployment ID');
console.log('');

// Generate new service worker
console.log('🔧 Generating new service worker...');
try {
  execSync('node scripts/generate-sw.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (error) {
  console.error('❌ Error generating service worker:', error.message);
  process.exit(1);
}

// Read the generated service worker to show deployment ID
const swPath = path.join(__dirname, '../public/sw.js');

if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  const deploymentMatch = swContent.match(/DEPLOYMENT_ID = '([^']+)'/);
  
  if (deploymentMatch) {
    const deploymentId = deploymentMatch[1];
    
    console.log('');
    console.log('✅ New service worker generated!');
    console.log('🆔 New Deployment ID:', deploymentId);
    console.log('');
    console.log('📋 Testing Instructions:');
    console.log('------------------------');
    console.log('1. Start development server: npm run dev');
    console.log('2. Open browser and note current deployment ID in console');
    console.log('3. Run this script again to generate new deployment ID');
    console.log('4. Check if update notification appears');
    console.log('');
    console.log('🌐 Production Testing:');
    console.log('----------------------');
    console.log('1. Deploy current version to production');
    console.log('2. Open https://trensilapor.my.id in browser');
    console.log('3. Run this script and redeploy');
    console.log('4. Refresh browser - should see update notification');
    console.log('');
    console.log('🛠️  Development Testing:');
    console.log('------------------------');
    console.log('- Use browser console: window.checkPWA()');
    console.log('- Clear PWA cache: window.clearPWA()');
    console.log('- Force update: window.updatePWA()');
  } else {
    console.error('❌ Could not find deployment ID in service worker');
  }
} else {
  console.error('❌ Service worker file not found');
}