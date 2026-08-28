import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function processImages() {
  const sourceDir = 'D:/products/Kemei Electric Hair Removal Shaver for Women (Purple and White) _ Amazon.in_ Health & Personal Care';
  const targetDirs = [
    'C:/Users/danis/Desktop/Dkart Store/server/public/uploads',
    'C:/Users/danis/Desktop/Dkart Store/client/public/uploads'
  ];

  targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const files = fs.readdirSync(sourceDir);
  console.log('Source files:', files);

  const imageMap = [
    { src: '514AsZjQvYL._SL1200_.jpg', destName: 'kemei-hair-remover-main.webp' },
    { src: '61nMaHo2KML._SL1200_.jpg', destName: 'kemei-hair-remover-features.webp' },
    { src: '61t3SUsff0L._SL1200_.jpg', destName: 'kemei-hair-remover-cordless.webp' },
    { src: '61uNrAP7ObL._SL1200_.jpg', destName: 'kemei-hair-remover-blades.webp' },
    { src: 'ChatGPT Image Jan 14, 2026, 06_54_40 PM.png', destName: 'kemei-hair-remover-lifestyle.webp' },
    { src: 'ChatGPT Image Jan 14, 2026, 07_02_47 PM.png', destName: 'kemei-hair-remover-unboxing1.webp' },
    { src: 'ChatGPT Image Jan 14, 2026, 07_02_52 PM.png', destName: 'kemei-hair-remover-unboxing2.webp' },
    { src: 'ChatGPT Image Jan 14, 2026, 07_13_08 PM.png', destName: 'kemei-hair-remover-packaging.webp' }
  ];

  for (const item of imageMap) {
    const srcPath = path.join(sourceDir, item.src);
    if (!fs.existsSync(srcPath)) {
      console.log('Skipping missing:', item.src);
      continue;
    }

    const buffer = fs.readFileSync(srcPath);
    const compressed = await sharp(buffer)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    console.log(`Processed ${item.destName} -> Size: ${(compressed.length / 1024).toFixed(1)} KB`);

    for (const dir of targetDirs) {
      fs.writeFileSync(path.join(dir, item.destName), compressed);
    }
  }

  console.log('✅ All Kemei images compressed and saved to server and client uploads!');
}

processImages().catch(console.error);
