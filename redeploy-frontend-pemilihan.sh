#!/bin/bash

# SISTEM PEMILIHAN BAWASLU Frontend + PWA Redeploy Script
# Script untuk redeploy frontend aplikasi Sistem Pemilihan Bawaslu dengan PWA support
# Compatible dengan VPS deployment yang sudah ada

set -e  # Exit on any error

echo "🚀 Starting Sistem Pemilihan Bawaslu Frontend + PWA Redeploy..."
echo "==============================================================="

# Variables
REPO_DIR="/tmp/pemilihan-deploy"
FRONTEND_DIR="/var/www/trensilapor.my.id"
SERVICE_NAME="trensilapor-frontend"
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
GITHUB_REPO="https://MuhammadDarmawanFadilah:${GITHUB_TOKEN}@github.com/MuhammadDarmawanFadilah/pemilihan.git"

# Step 1: Stop frontend service
echo "⏹️  Stopping frontend service..."
sudo systemctl stop $SERVICE_NAME
echo "✅ Frontend service stopped"

# Step 2: Clean existing deployment (no backup)
echo "🗑️  Cleaning existing deployment..."
if [ -d "$FRONTEND_DIR" ]; then
    sudo rm -rf $FRONTEND_DIR/.next $FRONTEND_DIR/public $FRONTEND_DIR/package.json $FRONTEND_DIR/next.config.ts $FRONTEND_DIR/.env.local $FRONTEND_DIR/node_modules
    echo "✅ Existing deployment cleaned"
else
    echo "⚠️  No existing deployment found"
fi

# Step 3: Pull latest code
echo "📥 Pulling latest code from repository..."
if [ -d "$REPO_DIR" ]; then
    cd $REPO_DIR
    sudo git fetch --all
    sudo git reset --hard origin/main
    sudo git pull origin main
    echo "✅ Code updated from existing repository"
else
    sudo git clone $GITHUB_REPO $REPO_DIR
    echo "✅ Repository cloned"
fi

# Step 4: Navigate to frontend directory
cd $REPO_DIR/frontend
echo "📁 Working in: $(pwd)"

# Step 5: Setup environment configuration
echo "⚙️  Setting up environment configuration..."
sudo cp .env.prod .env.local
sudo cp .env.prod .env
echo "✅ Environment configuration ready"

# Step 6: Install dependencies with lockfile handling
echo "📦 Installing dependencies..."
echo "🔍 Checking lockfile compatibility..."

# Try frozen lockfile first, fallback to regular install if needed
if sudo pnpm install --frozen-lockfile 2>&1 | tee /tmp/pnpm-install.log | grep -q "OUTDATED_LOCKFILE\|Cannot install with.*frozen-lockfile"; then
    echo "⚠️  Lockfile is outdated or incompatible, updating dependencies..."
    echo "📝 Lockfile error details:"
    grep -A 2 -B 2 "OUTDATED_LOCKFILE\|frozen-lockfile" /tmp/pnpm-install.log || echo "  (error details not captured)"
    
    echo "🔄 Installing with updated lockfile..."
    sudo pnpm install --no-frozen-lockfile
    echo "✅ Dependencies installed (lockfile updated)"
    
    # Verify critical dependencies
    echo "🔍 Verifying critical dependencies..."
    if sudo pnpm list sharp > /dev/null 2>&1; then
        echo "✅ Sharp dependency verified"
    else
        echo "⚠️  Sharp dependency issue, installing explicitly..."
        sudo pnpm add sharp@^0.33.5 -D
    fi
else
    echo "✅ Dependencies installed (frozen lockfile)"
fi

# Clean up temporary log
sudo rm -f /tmp/pnpm-install.log

# Step 7: Generate PWA service worker and icons with mobile optimization
echo "📦 Generating PWA service worker and icons with mobile optimization for Sistem Pemilihan Bawaslu..."

# Generate PWA icons from logo.svg
echo "🎨 Generating PWA icons from logo.svg..."
if [ -f "scripts/generate-icons-from-logo.js" ]; then
    sudo pnpm run generate:icons
    echo "✅ PWA icons generated from logo.svg (brand consistent)"
else
    echo "⚠️  Logo-based icon generation script not found, using fallback..."
    sudo node scripts/create-pwa-icons.js
    echo "✅ PWA icons generated (fallback method)"
fi

# Generate service worker with new deployment ID for version management
sudo NODE_ENV=production node scripts/generate-sw.js
echo "✅ PWA service worker and icons generated with unique deployment ID for version management"

# Step 8: Build application with PWA optimization and console.log removal
echo "🔨 Building application with PWA support and production optimizations..."
sudo rm -rf .next  # Clean previous build

# Ensure NODE_ENV is set to production for console.log removal
export NODE_ENV=production

# Build with console.log removal verification
echo "📋 Building with automatic console.log removal..."
sudo NODE_ENV=production pnpm run build:verify
echo "✅ Application built successfully with PWA features and console.log removal verified"

# Step 9: Verify PWA files are properly generated with mobile support
echo "🔍 Verifying PWA files with mobile support..."
if [ -f "public/sw.js" ]; then
    echo "✅ Service worker found"
else
    echo "⚠️  Service worker not found, regenerating..."
    sudo node scripts/generate-sw.js
fi

if [ -f "public/manifest.json" ]; then
    echo "✅ PWA manifest found"
    # Check if manifest has proper mobile configuration
    if grep -q '"orientation": "any"' public/manifest.json; then
        echo "✅ Mobile-friendly orientation configured"
    fi
    if grep -q '"display_override"' public/manifest.json; then
        echo "✅ Enhanced display modes configured"
    fi
else
    echo "❌ PWA manifest not found"
    exit 1
fi

if [ -f "public/offline.html" ]; then
    echo "✅ Offline page found"
else
    echo "❌ Offline page not found"
    exit 1
fi

# Check for PWA icons
if [ -d "public/icons" ]; then
    ICON_COUNT=$(ls public/icons/*.svg 2>/dev/null | wc -l)
    if [ $ICON_COUNT -gt 0 ]; then
        echo "✅ PWA icons found ($ICON_COUNT icons)"
    else
        echo "⚠️  No PWA icons found, regenerating..."
        sudo node scripts/create-pwa-icons.js
    fi
else
    echo "⚠️  Icons directory not found, creating icons..."
    sudo mkdir -p public/icons
    sudo node scripts/create-pwa-icons.js
fi

# Step 10: Deploy to production directory with PWA files
echo "🚀 Deploying to production directory with PWA support..."
sudo mkdir -p $FRONTEND_DIR
sudo cp -r .next public package.json next.config.ts .env.local node_modules $FRONTEND_DIR/
sudo chown -R root:root $FRONTEND_DIR
sudo chmod -R 755 $FRONTEND_DIR

# Ensure PWA files have correct permissions
if [ -f "$FRONTEND_DIR/public/manifest.json" ]; then
    sudo chmod 644 "$FRONTEND_DIR/public/manifest.json"
    echo "✅ PWA manifest permissions set"
fi

if [ -f "$FRONTEND_DIR/public/sw.js" ]; then
    sudo chmod 644 "$FRONTEND_DIR/public/sw.js"
    echo "✅ Service worker permissions set"
fi

if [ -f "$FRONTEND_DIR/public/offline.html" ]; then
    sudo chmod 644 "$FRONTEND_DIR/public/offline.html"
    echo "✅ Offline page permissions set"
fi

echo "✅ Files deployed to $FRONTEND_DIR with PWA support"

# Step 11: Start frontend service
echo "▶️  Starting frontend service..."
sudo systemctl start $SERVICE_NAME
sudo systemctl enable $SERVICE_NAME
echo "✅ Frontend service started"

# Step 12: Update Nginx for PWA MIME types (without breaking existing config)
echo "🔧 Updating Nginx MIME types for PWA support..."
MIME_TYPES_FILE="/etc/nginx/mime.types"

# Backup current mime.types
sudo cp $MIME_TYPES_FILE "${MIME_TYPES_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Add PWA-specific MIME types if not present
if ! grep -q "application/manifest+json" "$MIME_TYPES_FILE"; then
    echo "📝 Adding PWA manifest MIME type..."
    sudo sed -i '/types {/a\    application/manifest+json                       webmanifest;' "$MIME_TYPES_FILE"
    echo "✅ PWA manifest MIME type added"
fi

# Ensure CSS MIME type is properly defined
if ! grep -q "text/css.*css" "$MIME_TYPES_FILE"; then
    echo "📝 Adding CSS MIME type..."
    sudo sed -i '/types {/a\    text/css                                        css;' "$MIME_TYPES_FILE"
    echo "✅ CSS MIME type added"
fi

# Ensure JS MIME type is properly defined
if ! grep -q "application/javascript.*js" "$MIME_TYPES_FILE"; then
    echo "📝 Adding JavaScript MIME type..."
    sudo sed -i '/types {/a\    application/javascript                          js;' "$MIME_TYPES_FILE"
    echo "✅ JavaScript MIME type added"
fi

# Update existing Nginx config for PWA headers (preserve existing structure)
NGINX_CONFIG="/etc/nginx/sites-available/trensilapor.my.id"
if [ -f "$NGINX_CONFIG" ]; then
    echo "🔄 Adding PWA headers to existing Nginx config..."
    
    # Check if PWA headers already exist
    if ! grep -q "add_header X-Content-Type-Options" "$NGINX_CONFIG"; then
        # Add PWA-specific headers to the SSL server block
        sudo sed -i '/ssl_prefer_server_ciphers off;/a\    \n    # PWA specific headers\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header Cache-Control "public, max-age=31536000" always;' "$NGINX_CONFIG"
        echo "✅ PWA headers added to Nginx config"
    else
        echo "✅ PWA headers already exist in Nginx config"
    fi
    
    # Ensure service worker is not cached
    if ! grep -q "location.*sw\.js" "$NGINX_CONFIG"; then
        sudo sed -i '/# Other static files/i\    # Service Worker - no cache\n    location ~* /sw\.js$ {\n        add_header Cache-Control "no-cache, no-store, must-revalidate";\n        add_header Pragma "no-cache";\n        add_header Expires "0";\n        try_files $uri @nextjs;\n    }\n' "$NGINX_CONFIG"
        echo "✅ Service worker no-cache rule added"
    else
        echo "✅ Service worker cache rules already exist"
    fi
    
    # Ensure manifest.json has correct MIME type
    if ! grep -q "location.*manifest\.json" "$NGINX_CONFIG"; then
        sudo sed -i '/# Service Worker - no cache/i\    # PWA Manifest\n    location ~* /manifest\.json$ {\n        add_header Content-Type "application/manifest+json";\n        add_header Cache-Control "public, max-age=86400";\n        try_files $uri @nextjs;\n    }\n' "$NGINX_CONFIG"
        echo "✅ PWA manifest location added"
    else
        echo "✅ PWA manifest location already exists"
    fi
else
    echo "⚠️  Nginx config file not found, skipping PWA header updates"
fi

# Step 13: Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Step 14: Test and reload Nginx
echo "🔄 Testing and reloading Nginx configuration..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx configuration tested and reloaded"
else
    echo "❌ Nginx configuration test failed"
    echo "📋 Nginx configuration errors:"
    sudo nginx -t
    exit 1
fi

# Step 15: Verify deployment with PWA testing
echo "🔍 Verifying deployment with PWA support..."
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Service is running"
    
    # Test local connection
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Local connection successful"
    else
        echo "⚠️  Local connection failed"
    fi
    
    # Test HTTPS connection
    if curl -s https://trensilapor.my.id > /dev/null; then
        echo "✅ HTTPS connection successful"
    else
        echo "⚠️  HTTPS connection failed"
    fi
    
    # Test PWA manifest
    if curl -s -I https://trensilapor.my.id/manifest.json | grep -q "200 OK"; then
        echo "✅ PWA manifest accessible"
        
        # Check manifest MIME type
        MANIFEST_MIME=$(curl -s -I https://trensilapor.my.id/manifest.json | grep -i "content-type" | head -1)
        if echo "$MANIFEST_MIME" | grep -q "application/manifest+json\|application/json"; then
            echo "✅ PWA manifest MIME type correct"
        else
            echo "⚠️  PWA manifest MIME type: $MANIFEST_MIME"
        fi
    else
        echo "⚠️  PWA manifest not accessible"
    fi
    
    # Test service worker
    if curl -s -I https://trensilapor.my.id/sw.js | grep -q "200 OK"; then
        echo "✅ Service worker accessible"
        
        # Check service worker cache headers
        SW_CACHE=$(curl -s -I https://trensilapor.my.id/sw.js | grep -i "cache-control" | head -1)
        if echo "$SW_CACHE" | grep -q "no-cache\|no-store"; then
            echo "✅ Service worker cache headers correct"
        else
            echo "⚠️  Service worker cache headers: $SW_CACHE"
        fi
    else
        echo "⚠️  Service worker not accessible (this may be normal for some PWA setups)"
    fi
    
    # Test offline page
    if curl -s -I https://trensilapor.my.id/offline.html | grep -q "200 OK"; then
        echo "✅ Offline page accessible"
    else
        echo "⚠️  Offline page not accessible"
    fi
    
    # Test static assets MIME types
    echo "🔍 Testing static asset MIME types..."
    CSS_MIME=$(curl -s -I "https://trensilapor.my.id/_next/static/css/" 2>/dev/null | grep -i "content-type" | head -1 || echo "No CSS found")
    echo "📝 CSS MIME type: $CSS_MIME"
    
else
    echo "❌ Service failed to start"
    echo "📋 Service status:"
    sudo systemctl status $SERVICE_NAME --no-pager
    exit 1
fi

# Step 16: Reload Nginx (if needed)
echo "🔄 Final Nginx reload..."
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx final reload completed"

# Step 17: Show deployment summary with PWA info
echo ""
echo "🎉 SISTEM PEMILIHAN BAWASLU FRONTEND + PWA REDEPLOY COMPLETED!"
echo "================================================================"
echo "✅ Service: $SERVICE_NAME"
echo "✅ Port: 3000"
echo "✅ Directory: $FRONTEND_DIR"
echo "✅ URL: https://trensilapor.my.id"
echo "✅ Backend API: https://trensilapor.my.id/api (proxy to localhost:8080/silapor/api)"
echo "✅ Status: $(sudo systemctl is-active $SERVICE_NAME)"
echo "✅ PWA Support: Enabled with version update notifications"
echo "✅ Production Optimizations: Console.log removal, bundle splitting"
echo "✅ MIME Types: Updated for PWA"
echo "✅ Deployment Time: $(date)"
echo ""
echo "📊 Service Status:"
sudo systemctl status $SERVICE_NAME --no-pager -l
echo ""
echo "🌐 Testing URLs:"
echo "- Frontend: https://trensilapor.my.id"
echo "- API: https://trensilapor.my.id/api"
echo "- Local Frontend: http://localhost:3000"
echo "- PWA Manifest: https://trensilapor.my.id/manifest.json"
echo "- Service Worker: https://trensilapor.my.id/sw.js"
echo "- Offline Page: https://trensilapor.my.id/offline.html"
echo ""
echo "📱 PWA Installation:"
echo "- Chrome/Edge: Look for install icon in address bar"
echo "- Firefox: Use 'Add to Home Screen' from menu"
echo "- Safari: Use 'Add to Home Screen' from share menu"
echo "- Mobile: Native install prompts should appear"
echo "- PWA Name: Sistem Pemilihan Bawaslu"
echo ""
echo "📝 Logs command: sudo journalctl -u $SERVICE_NAME -f"
echo "🔄 Restart command: sudo systemctl restart $SERVICE_NAME"
echo "🔍 PWA Test: Open Chrome DevTools > Application > Manifest"
echo "🧪 PWA Scripts: npm run test-pwa, npm run simulate-pwa-update"
echo ""
echo "✅ Sistem Pemilihan Bawaslu Frontend + PWA redeploy completed successfully!"