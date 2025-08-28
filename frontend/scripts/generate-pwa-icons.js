const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Function to generate PNG icon from SVG
function generatePWAIcons() {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    const svgString = `
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="64" fill="#f69435"/>
        <path d="M128 160h256v32H128v-32z" fill="white"/>
        <path d="M128 224h256v32H128v-32z" fill="white"/>
        <path d="M128 288h256v32H128v-32z" fill="white"/>
        <path d="M128 352h128v32H128v-32z" fill="white"/>
        <circle cx="384" cy="368" r="24" fill="white"/>
    </svg>`;
    
    sizes.forEach(size => {
        canvas.width = size;
        canvas.height = size;
        
        // Create image from SVG
        const img = new Image();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        img.onload = function() {
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            
            canvas.toBlob(function(blob) {
                const link = document.createElement('a');
                link.download = `icon-${size}x${size}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            });
            
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    });
}

// Generate maskable icon (with safe area)
function generateMaskableIcon(size) {
    canvas.width = size;
    canvas.height = size;
    
    // Background circle (safe area)
    ctx.fillStyle = '#f69435';
    ctx.fillRect(0, 0, size, size);
    
    // Icon in center (80% of size for safe area)
    const iconSize = size * 0.8;
    const offset = (size - iconSize) / 2;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(offset + iconSize * 0.2, offset + iconSize * 0.2, iconSize * 0.6, iconSize * 0.1);
    ctx.fillRect(offset + iconSize * 0.2, offset + iconSize * 0.35, iconSize * 0.6, iconSize * 0.1);
    ctx.fillRect(offset + iconSize * 0.2, offset + iconSize * 0.5, iconSize * 0.6, iconSize * 0.1);
    ctx.fillRect(offset + iconSize * 0.2, offset + iconSize * 0.65, iconSize * 0.3, iconSize * 0.1);
    
    // Circle (vote mark)
    ctx.beginPath();
    ctx.arc(offset + iconSize * 0.7, offset + iconSize * 0.7, iconSize * 0.08, 0, 2 * Math.PI);
    ctx.fill();
    
    canvas.toBlob(function(blob) {
        const link = document.createElement('a');
        link.download = `icon-${size}x${size}-maskable.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    });
}

// Generate Apple touch icon
function generateAppleTouchIcon() {
    const size = 180;
    canvas.width = size;
    canvas.height = size;
    
    // Background with rounded corners (iOS style)
    ctx.fillStyle = '#f69435';
    ctx.fillRect(0, 0, size, size);
    
    // Icon elements
    ctx.fillStyle = 'white';
    ctx.fillRect(size * 0.2, size * 0.25, size * 0.6, size * 0.08);
    ctx.fillRect(size * 0.2, size * 0.38, size * 0.6, size * 0.08);
    ctx.fillRect(size * 0.2, size * 0.51, size * 0.6, size * 0.08);
    ctx.fillRect(size * 0.2, size * 0.64, size * 0.3, size * 0.08);
    
    // Vote circle
    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.68, size * 0.06, 0, 2 * Math.PI);
    ctx.fill();
    
    canvas.toBlob(function(blob) {
        const link = document.createElement('a');
        link.download = `apple-touch-icon.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    });
}

console.log('PWA Icon Generator Ready!');
console.log('Run generatePWAIcons() to generate all PNG icons');
console.log('Run generateMaskableIcon(192) and generateMaskableIcon(512) for maskable icons');
console.log('Run generateAppleTouchIcon() for Apple touch icon');