const fs = require('fs');
const path = require('path');

// Create simple PNG icons using base64 data
// This is a 72x72 PNG icon with orange background and white voting elements

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Base64 data for a simple orange square with white elements (72x72)
const base72x72 = 'iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADjklEQVR4nO2bS08TQRTH/9NpF8RI1KCJxgehKsYXKuIDH8QIXjG+PgBGjStNXBjfRhMVE1duFBPjQhMXBhdGEzQR40KNiQtNfKHRhRFfGF/xEd/1TKYdOtPOM53O9E4zv+Sfdub+79w/50577jBjjMGKGNDSDmClDRYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQFBZTaBASAHyASQFVJ0APsAnAJQBGAHgAyTfXEAzwE8BPAAQCeAJgCJIMsOKqAcACcBHANwGECZy/wSgB8AvgFoB3AHwLOQyxY0QJkAzgE4C6DA531wAHcBXAXwNaSyBQlQkfeQRMtM/QKDhBQ0QBcBVAEYEqJfDkAOgFdO5e/DJzBhVyaAWQDOOo1GW4g1HI2GZYGSpzz1ALoBZIVUvqDNaA8B3AJwNOSyAz+jPQJQGQHZgsreBVAYEblMa/UDQGEE5DIldJ/RLkdILhNCpRNBNa+7vDwNnc8LUHOOhYdJDZ3PCzh9I6wJ6sXQ+byA0/dGJlGZLJ3Pl57eiMhlyoj0jTZDaOh8XoDZN2MZlM7nCzD7Rqx36R7dN2K9S/fovvEIQCOAXaOk7sPhDN03iu2/xei+YZpnlAEoLXOJcg6AiyEjVP8H1f7SnFc0e6h2i+7fkY2eCz+jJaTyBW2Zu4vKx8X3A/ACwISQyhe0Ge2xi05nfG9xr1O5KQBaZ7RykpLh5Xm9L6t5Ssp8oJ+hlW7/U2H19y8APtMZhYoJz2g0I21xVCHD0VKT+5wWMvkC16N9RmJMBXAVw/egwqh8XwH8rIYXlO9x+IHgOlT/hNP6PTW5Xmj9Hsp4EE0rKhR4OUAJ/DnS6i2OwrxEG3zdZ7T1qD5NKJfpjNZOUg2WCb3PCzh9I1b/B9U/e7LkUCJk6VqSbJdgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARARYRYBEBFhFgEQEWEWARAf8B16nMFoMDlHQAAAAASUVORK5CYII=';

function createIcon(size, outputPath) {
    // Create a canvas element (in Node.js environment this would need canvas package)
    // For now, we'll create a simple colored square as placeholder
    
    const canvas = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#f69435"/>
        <rect x="${size * 0.2}" y="${size * 0.3}" width="${size * 0.6}" height="${size * 0.08}" fill="white"/>
        <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.6}" height="${size * 0.08}" fill="white"/>
        <rect x="${size * 0.2}" y="${size * 0.6}" width="${size * 0.3}" height="${size * 0.08}" fill="white"/>
        <circle cx="${size * 0.7}" cy="${size * 0.64}" r="${size * 0.06}" fill="white"/>
    </svg>`;
    
    return canvas;
}

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// For now, let's create simple PNG files by copying a base icon
// In production, you would use a proper image library like sharp or canvas

console.log('Creating PWA icons...');

// Create a simple base64 PNG for each size (placeholder approach)
iconSizes.forEach(size => {
    // Create SVG content
    const svgContent = createIcon(size, path.join(iconsDir, `icon-${size}x${size}.png`));
    
    // Save as SVG first (browsers can handle SVG in manifest)
    fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent);
    
    console.log(`✓ Created icon-${size}x${size}.svg`);
});

// Create maskable icons (192 and 512)
[192, 512].forEach(size => {
    const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#f69435"/>
        <g transform="translate(${size * 0.1}, ${size * 0.1}) scale(0.8)">
            <rect x="${size * 0.2}" y="${size * 0.3}" width="${size * 0.6}" height="${size * 0.08}" fill="white"/>
            <rect x="${size * 0.2}" y="${size * 0.45}" width="${size * 0.6}" height="${size * 0.08}" fill="white"/>
            <rect x="${size * 0.2}" y="${size * 0.6}" width="${size * 0.3}" height="${size * 0.08}" fill="white"/>
            <circle cx="${size * 0.7}" cy="${size * 0.64}" r="${size * 0.06}" fill="white"/>
        </g>
    </svg>`;
    
    fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}-maskable.svg`), svgContent);
    console.log(`✓ Created icon-${size}x${size}-maskable.svg`);
});

// Create Apple touch icon
const appleTouchIcon = `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="180" height="180" fill="#f69435"/>
    <rect x="36" y="54" width="108" height="14" fill="white"/>
    <rect x="36" y="81" width="108" height="14" fill="white"/>
    <rect x="36" y="108" width="54" height="14" fill="white"/>
    <circle cx="126" cy="115" r="11" fill="white"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('✓ Created apple-touch-icon.svg');

// Create favicon
const favicon = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#f69435"/>
    <rect x="6" y="10" width="20" height="3" fill="white"/>
    <rect x="6" y="16" width="20" height="3" fill="white"/>
    <rect x="6" y="22" width="10" height="3" fill="white"/>
    <circle cx="22" cy="23" r="2" fill="white"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), favicon);
console.log('✓ Created favicon.svg');

console.log('\n✅ PWA icons created successfully!');
console.log('Note: SVG icons are used as placeholders. For production, convert to PNG using:');
console.log('- Online tools like convertio.co or cloudconvert.com');
console.log('- Command line tools like ImageMagick or Inkscape');
console.log('- Or use a Node.js library like sharp for automated conversion');

module.exports = { createIcon };