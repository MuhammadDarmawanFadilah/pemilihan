#!/bin/bash

# PWA Icon Generator Script for Sistem Pemilihan Bawaslu
# Generates PNG icons from SVG for better mobile PWA support

echo "🎨 Generating PWA Icons for Sistem Pemilihan Bawaslu..."

# Create icons directory if it doesn't exist
mkdir -p public/icons

# Icon sizes needed for PWA
sizes=(72 96 128 144 152 192 384 512)

# Create a temporary SVG file with proper content
cat > temp_icon.svg << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" rx="64" fill="#f69435"/>
  
  <!-- Document lines -->
  <rect x="128" y="160" width="256" height="32" fill="white"/>
  <rect x="128" y="224" width="256" height="32" fill="white"/>
  <rect x="128" y="288" width="256" height="32" fill="white"/>
  <rect x="128" y="352" width="128" height="32" fill="white"/>
  
  <!-- Vote check circle -->
  <circle cx="384" cy="368" r="24" fill="white"/>
  <circle cx="384" cy="368" r="16" fill="#f69435"/>
  <circle cx="384" cy="368" r="8" fill="white"/>
</svg>
EOF

# Generate regular icons
for size in "${sizes[@]}"; do
  echo "📏 Generating ${size}x${size} icon..."
  
  if command -v convert >/dev/null 2>&1; then
    # Using ImageMagick
    convert temp_icon.svg -resize ${size}x${size} public/icons/icon-${size}x${size}.png
  elif command -v rsvg-convert >/dev/null 2>&1; then
    # Using librsvg
    rsvg-convert -w ${size} -h ${size} temp_icon.svg -o public/icons/icon-${size}x${size}.png
  elif command -v inkscape >/dev/null 2>&1; then
    # Using Inkscape
    inkscape temp_icon.svg -w ${size} -h ${size} -o public/icons/icon-${size}x${size}.png
  else
    echo "❌ No SVG converter found. Please install ImageMagick, librsvg, or Inkscape"
    echo "   Ubuntu/Debian: sudo apt install imagemagick"
    echo "   CentOS/RHEL: sudo yum install ImageMagick"
    echo "   macOS: brew install imagemagick"
    exit 1
  fi
done

# Generate maskable icons (with safe area padding)
cat > temp_maskable_icon.svg << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background (full area for maskable) -->
  <rect width="512" height="512" fill="#f69435"/>
  
  <!-- Content in safe area (80% of size, centered) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <!-- Document lines -->
    <rect x="128" y="160" width="256" height="32" fill="white"/>
    <rect x="128" y="224" width="256" height="32" fill="white"/>
    <rect x="128" y="288" width="256" height="32" fill="white"/>
    <rect x="128" y="352" width="128" height="32" fill="white"/>
    
    <!-- Vote check circle -->
    <circle cx="384" cy="368" r="24" fill="white"/>
    <circle cx="384" cy="368" r="16" fill="#f69435"/>
    <circle cx="384" cy="368" r="8" fill="white"/>
  </g>
</svg>
EOF

echo "🎭 Generating maskable icons..."
for size in 192 512; do
  echo "📏 Generating ${size}x${size} maskable icon..."
  
  if command -v convert >/dev/null 2>&1; then
    convert temp_maskable_icon.svg -resize ${size}x${size} public/icons/icon-${size}x${size}-maskable.png
  elif command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert -w ${size} -h ${size} temp_maskable_icon.svg -o public/icons/icon-${size}x${size}-maskable.png
  elif command -v inkscape >/dev/null 2>&1; then
    inkscape temp_maskable_icon.svg -w ${size} -h ${size} -o public/icons/icon-${size}x${size}-maskable.png
  fi
done

# Generate Apple Touch Icon (180x180)
echo "🍎 Generating Apple Touch Icon..."
cat > temp_apple_icon.svg << 'EOF'
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="180" height="180" fill="#f69435"/>
  
  <!-- Document lines -->
  <rect x="36" y="45" width="108" height="12" fill="white"/>
  <rect x="36" y="69" width="108" height="12" fill="white"/>
  <rect x="36" y="93" width="108" height="12" fill="white"/>
  <rect x="36" y="117" width="54" height="12" fill="white"/>
  
  <!-- Vote check circle -->
  <circle cx="126" cy="123" r="9" fill="white"/>
  <circle cx="126" cy="123" r="6" fill="#f69435"/>
  <circle cx="126" cy="123" r="3" fill="white"/>
</svg>
EOF

if command -v convert >/dev/null 2>&1; then
  convert temp_apple_icon.svg -resize 180x180 public/icons/apple-touch-icon.png
elif command -v rsvg-convert >/dev/null 2>&1; then
  rsvg-convert -w 180 -h 180 temp_apple_icon.svg -o public/icons/apple-touch-icon.png
elif command -v inkscape >/dev/null 2>&1; then
  inkscape temp_apple_icon.svg -w 180 -h 180 -o public/icons/apple-touch-icon.png
fi

# Generate favicon.ico (32x32)
echo "🔗 Generating favicon..."
if command -v convert >/dev/null 2>&1; then
  convert temp_icon.svg -resize 32x32 public/icons/favicon-32x32.png
  convert temp_icon.svg -resize 16x16 public/icons/favicon-16x16.png
  
  # Create multi-size favicon.ico if possible
  if command -v convert >/dev/null 2>&1; then
    convert public/icons/favicon-16x16.png public/icons/favicon-32x32.png public/favicon.ico
  fi
fi

# Clean up temporary files
rm -f temp_icon.svg temp_maskable_icon.svg temp_apple_icon.svg

echo ""
echo "✅ PWA Icons Generated Successfully!"
echo "📁 Icons saved to: public/icons/"
echo "📱 Icons optimized for mobile PWA installation"
echo ""
echo "Generated icons:"
ls -la public/icons/

echo ""
echo "🔧 Next steps:"
echo "1. Test PWA installation on mobile devices"
echo "2. Verify icons display correctly in app drawer"
echo "3. Check maskable icons work properly on Android"