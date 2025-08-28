#!/bin/bash

# PWA Mobile Installation Test Script
# Tests PWA installation capabilities on mobile devices

echo "📱 Testing PWA Mobile Installation for Sistem Pemilihan Bawaslu"
echo "================================================================"

# Test URL
TEST_URL="https://trensilapor.my.id"
LOCALHOST_URL="http://localhost:3000"

# Function to test URL
test_pwa_url() {
    local url=$1
    local name=$2
    
    echo ""
    echo "🔍 Testing $name: $url"
    echo "----------------------------------------"
    
    # Test basic connectivity
    echo "📡 Testing connectivity..."
    if curl -s -I "$url" > /dev/null; then
        echo "✅ Site is accessible"
    else
        echo "❌ Site is not accessible"
        return 1
    fi
    
    # Test HTTPS (required for PWA)
    if [[ $url == https://* ]]; then
        echo "✅ HTTPS enabled (required for PWA)"
    else
        echo "⚠️  HTTP only - PWA requires HTTPS in production"
    fi
    
    # Test manifest
    echo "📋 Testing PWA manifest..."
    MANIFEST_STATUS=$(curl -s -I "$url/manifest.json" | grep "HTTP" | head -1)
    if echo "$MANIFEST_STATUS" | grep -q "200 OK"; then
        echo "✅ PWA manifest accessible"
        
        # Check manifest content
        MANIFEST_CONTENT=$(curl -s "$url/manifest.json")
        
        # Check for mobile-specific fields
        if echo "$MANIFEST_CONTENT" | grep -q '"display": "standalone"'; then
            echo "✅ Standalone display mode configured"
        fi
        
        if echo "$MANIFEST_CONTENT" | grep -q '"orientation": "any"'; then
            echo "✅ Mobile-friendly orientation"
        else
            echo "⚠️  Orientation may be too restrictive for mobile"
        fi
        
        if echo "$MANIFEST_CONTENT" | grep -q '"display_override"'; then
            echo "✅ Enhanced display modes available"
        fi
        
        # Check for proper icons
        ICON_COUNT=$(echo "$MANIFEST_CONTENT" | grep -o '"src"' | wc -l)
        if [ $ICON_COUNT -ge 8 ]; then
            echo "✅ Sufficient icons defined ($ICON_COUNT icons)"
        else
            echo "⚠️  Limited icons ($ICON_COUNT icons) - may affect mobile installation"
        fi
        
        # Check for maskable icons
        if echo "$MANIFEST_CONTENT" | grep -q '"purpose": "maskable"'; then
            echo "✅ Maskable icons available (good for Android)"
        else
            echo "⚠️  No maskable icons - Android installation may be affected"
        fi
        
    else
        echo "❌ PWA manifest not accessible"
        echo "   Status: $MANIFEST_STATUS"
    fi
    
    # Test service worker
    echo "🔧 Testing service worker..."
    SW_STATUS=$(curl -s -I "$url/sw.js" | grep "HTTP" | head -1)
    if echo "$SW_STATUS" | grep -q "200 OK"; then
        echo "✅ Service worker accessible"
        
        # Check cache headers
        CACHE_HEADER=$(curl -s -I "$url/sw.js" | grep -i "cache-control" | head -1)
        if echo "$CACHE_HEADER" | grep -q "no-cache\|no-store"; then
            echo "✅ Service worker has correct cache headers"
        else
            echo "⚠️  Service worker cache headers: $CACHE_HEADER"
        fi
    else
        echo "❌ Service worker not accessible"
        echo "   Status: $SW_STATUS"
    fi
    
    # Test PWA icons
    echo "🎨 Testing PWA icons..."
    for size in 192 512; do
        ICON_STATUS=$(curl -s -I "$url/icons/icon-${size}x${size}.svg" | grep "HTTP" | head -1)
        if echo "$ICON_STATUS" | grep -q "200 OK"; then
            echo "✅ Icon ${size}x${size} accessible"
        else
            echo "⚠️  Icon ${size}x${size} not accessible"
        fi
    done
    
    # Test Apple touch icon
    APPLE_ICON_STATUS=$(curl -s -I "$url/icons/apple-touch-icon.svg" | grep "HTTP" | head -1)
    if echo "$APPLE_ICON_STATUS" | grep -q "200 OK"; then
        echo "✅ Apple touch icon accessible"
    else
        echo "⚠️  Apple touch icon not accessible"
    fi
    
    # Test offline page
    echo "📱 Testing offline functionality..."
    OFFLINE_STATUS=$(curl -s -I "$url/offline.html" | grep "HTTP" | head -1)
    if echo "$OFFLINE_STATUS" | grep -q "200 OK"; then
        echo "✅ Offline page accessible"
    else
        echo "⚠️  Offline page not accessible"
    fi
}

# Test production URL
test_pwa_url "$TEST_URL" "Production"

# Test localhost if running
if curl -s -I "$LOCALHOST_URL" > /dev/null 2>&1; then
    test_pwa_url "$LOCALHOST_URL" "Local Development"
else
    echo ""
    echo "ℹ️  Local development server not running"
fi

echo ""
echo "📋 PWA Mobile Installation Guidelines:"
echo "=================================================="
echo ""
echo "🤖 Android Devices:"
echo "   • Chrome: Look for install banner or menu option 'Install app'"
echo "   • Samsung Internet: Menu → Add page to → Home screen"
echo "   • Firefox: Menu → Install (if available)"
echo ""
echo "🍎 iOS Devices:"
echo "   • Safari: Share button → Add to Home Screen"
echo "   • Note: iOS requires Safari for PWA installation"
echo ""
echo "💻 Desktop:"
echo "   • Chrome/Edge: Install icon in address bar or menu"
echo "   • Firefox: Bookmark for quick access"
echo ""
echo "🔧 Troubleshooting Mobile Installation:"
echo "=================================================="
echo "1. Ensure site is served over HTTPS"
echo "2. Visit site multiple times to trigger install criteria"
echo "3. Check manifest.json is loading correctly"
echo "4. Verify service worker is registered"
echo "5. Try different browsers (Chrome works best on Android)"
echo "6. Clear browser cache and try again"
echo "7. Check browser console for PWA-related errors"
echo ""
echo "📊 Installation Criteria (Chrome):"
echo "   • Served over HTTPS"
echo "   • Valid manifest.json with required fields"
echo "   • Service worker registered"
echo "   • User engagement signals (multiple visits)"
echo ""
echo "🧪 Test URLs for mobile:"
echo "   • Production: $TEST_URL"
echo "   • Local: $LOCALHOST_URL"
echo ""
echo "✅ PWA Mobile Installation Test Complete!"