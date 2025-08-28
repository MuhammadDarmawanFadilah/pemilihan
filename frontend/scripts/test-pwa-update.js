#!/usr/bin/env node

/**
 * PWA Update Testing Script for Trensilapor
 * Tests and validates PWA update functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 PWA Update Test - Trensilapor');
console.log('================================');

// Read current service worker
const swPath = path.join(__dirname, '../public/sw.js');

if (!fs.existsSync(swPath)) {
  console.error('❌ Service worker not found. Run: npm run generate-sw');
  process.exit(1);
}

const swContent = fs.readFileSync(swPath, 'utf8');

console.log('');
console.log('🔧 Service Worker Analysis:');
console.log('---------------------------');

// Check deployment ID
const deploymentMatch = swContent.match(/DEPLOYMENT_ID = '([^']+)'/);
if (deploymentMatch) {
  console.log('✅ Deployment ID Found:', deploymentMatch[1]);
} else {
  console.log('⚠️  No Deployment ID found');
}

// Check version
const versionMatch = swContent.match(/VERSION = '([^']+)'/);
if (versionMatch) {
  console.log('✅ Version Found:', versionMatch[1]);
} else {
  console.log('⚠️  No Version found');
}

// Check build time
const buildTimeMatch = swContent.match(/BUILD_TIME = (\d+)/);
if (buildTimeMatch) {
  const buildTime = parseInt(buildTimeMatch[1]);
  console.log('✅ Build Time:', new Date(buildTime).toLocaleString());
} else {
  console.log('⚠️  No Build Time found');
}

console.log('');
console.log('🔄 Update Features Check:');
console.log('-------------------------');

if (swContent.includes('SW_UPDATED')) {
  console.log('✅ Update Notification: Enabled');
} else {
  console.log('⚠️  Update Notification: Disabled');
}

if (swContent.includes('self.clients.claim()')) {
  console.log('✅ Claims Clients: Enabled');
} else {
  console.log('⚠️  Claims Clients: Disabled');
}

if (swContent.includes('skipWaiting()')) {
  console.log('✅ Skip Waiting: Enabled');
} else {
  console.log('⚠️  Skip Waiting: Disabled');
}

// Check cache invalidation strategy
console.log('');
console.log('🔄 Cache Invalidation Strategy:');
console.log('-------------------------------');

if (swContent.includes('caches.delete(cache)')) {
  console.log('✅ Old Cache Cleanup: Enabled');
} else {
  console.log('⚠️  Old Cache Cleanup: Disabled');
}

const cacheNamePattern = swContent.match(/CACHE_NAME = (.+)/);
if (cacheNamePattern) {
  console.log(`📝 Cache Pattern: ${cacheNamePattern[1].trim()}`);
  
  if (cacheNamePattern[1].includes('DEPLOYMENT_ID')) {
    console.log('✅ Deployment-based Cache: Enabled (guarantees invalidation)');
  } else if (cacheNamePattern[1].includes('BUILD_TIME')) {
    console.log('✅ Time-based Cache: Enabled');
  } else {
    console.log('⚠️  Static Cache: May not invalidate properly');
  }
}

// Test cache name generation
console.log('');
console.log('🧪 Cache Name Test:');
console.log('-------------------');

const isDev = false; // Simulate production
const version = versionMatch ? versionMatch[1] : '1.0.0';
const deploymentId = deploymentMatch ? deploymentMatch[1] : 'unknown';
const buildTime = buildTimeMatch ? parseInt(buildTimeMatch[1]) : Date.now();

const testCacheName = isDev ? 
  `pemilihan-bawaslu-dev-${buildTime}` : 
  `pemilihan-bawaslu-v${version}-${deploymentId}`;

console.log(`🏗️  Generated Cache Name: ${testCacheName}`);

// Recommendations
console.log('');
console.log('💡 Recommendations:');
console.log('-------------------');

const age = (Date.now() - buildTime) / 1000;
if (age > 300) { // More than 5 minutes old
  console.log('⚠️  Service worker is old. Consider regenerating for deployment.');
  console.log('   Run: npm run generate-sw');
}

if (!swContent.includes('DEPLOYMENT_ID')) {
  console.log('⚠️  Missing deployment ID. Update notification may not work properly.');
}

if (!swContent.includes('client.postMessage')) {
  console.log('⚠️  Missing client messaging. Update notifications will not work.');
} else {
  console.log('✅ Client Messaging: Enabled');
}

console.log('');
console.log('🚀 Test Commands:');
console.log('-----------------');
console.log('1. Generate new SW: node scripts/generate-sw.js');
console.log('2. Simulate update: node scripts/simulate-pwa-update.js');
console.log('3. Start dev server: npm run dev');
console.log('4. Open browser console and check for deployment ID');
console.log('5. Run step 2 again and check for update notification');