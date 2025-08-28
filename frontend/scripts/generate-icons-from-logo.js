const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const SOURCE_SVG = path.join(__dirname, '..', 'public', 'logo.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const APPLE_SIZE = 180;

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function generateIcons() {
  console.log('🔧 Generating PWA icons from logo.svg...');

  if (!fs.existsSync(SOURCE_SVG)) {
    console.error('❌ Source logo.svg not found at', SOURCE_SVG);
    process.exit(1);
  }

  await ensureDir(OUTPUT_DIR);

  // Read SVG content
  const svgContent = await fs.promises.readFile(SOURCE_SVG);

  // Generate PNG icons using sharp
  for (const size of SIZES) {
    const outPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(svgContent)
      .resize(size, size, { fit: 'contain', background: { r: 246, g: 148, b: 53, alpha: 1 } })
      .png()
      .toFile(outPath);
    console.log(`✅ Generated ${outPath}`);
  }

  // Generate maskable versions (with padding for safe zone)
  for (const size of [192, 512]) {
    const outPath = path.join(OUTPUT_DIR, `icon-${size}x${size}-maskable.png`);
    const padding = Math.round(size * 0.1); // 10% padding
    const paddedSize = size - padding * 2;

    const compositeBuffer = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 246, g: 148, b: 53, alpha: 1 }
      }
    })
      .composite([
        {
          input: await sharp(svgContent)
            .resize(paddedSize, paddedSize, { fit: 'contain' })
            .png()
            .toBuffer(),
          top: padding,
          left: padding
        }
      ])
      .png()
      .toBuffer();

    await sharp(compositeBuffer).toFile(outPath);
    console.log(`✅ Generated maskable ${outPath}`);
  }

  // Apple touch icon
  const applePath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
  await sharp(svgContent)
    .resize(APPLE_SIZE, APPLE_SIZE, { fit: 'contain', background: { r: 246, g: 148, b: 53, alpha: 1 } })
    .png()
    .toFile(applePath);
  console.log(`✅ Generated ${applePath}`);

  // Favicons 16 and 32
  for (const size of [16, 32]) {
    const favPath = path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`);
    await sharp(svgContent)
      .resize(size, size, { fit: 'contain', background: { r: 246, g: 148, b: 53, alpha: 1 } })
      .png()
      .toFile(favPath);
    console.log(`✅ Generated ${favPath}`);
  }

  console.log('\n🎉 All icons generated successfully from logo.svg');
  console.log('➡️  Update manifest.json to point to .png icons if not already.');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
