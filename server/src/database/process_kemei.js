import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcDir = 'D:/products/Kemei Electric Hair Removal Shaver for Women (Purple and White) _ Amazon.in_ Health & Personal Care';

const targets = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

const imageMapping = [
  { src: '514AsZjQvYL._SL1200_.jpg', name: 'kemei-rechargeable-hair-remover-main' },
  { src: '61nMaHo2KML._SL1200_.jpg', name: 'kemei-rechargeable-hair-remover-features' },
  { src: '61t3SUsff0L._SL1200_.jpg', name: 'kemei-rechargeable-hair-remover-blade' },
  { src: '61uNrAP7ObL._SL1200_.jpg', name: 'kemei-rechargeable-hair-remover-usage' },
  { src: 'ChatGPT Image Jan 14, 2026, 06_54_40 PM.png', name: 'kemei-review-1' },
  { src: 'ChatGPT Image Jan 14, 2026, 07_02_47 PM.png', name: 'kemei-review-2' },
  { src: 'ChatGPT Image Jan 14, 2026, 07_02_52 PM.png', name: 'kemei-review-3' },
  { src: 'ChatGPT Image Jan 14, 2026, 07_13_08 PM.png', name: 'kemei-review-4' }
];

async function processImages() {
  for (const t of targets) {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  }

  for (const item of imageMapping) {
    const inputPath = path.join(srcDir, item.src);
    if (!fs.existsSync(inputPath)) {
      console.log('Missing file:', inputPath);
      continue;
    }

    for (const t of targets) {
      const outWebp = path.join(t, item.name + '.webp');
      const outJpg = path.join(t, item.name + '.jpg');

      // Convert to WebP < 100KB
      await sharp(inputPath)
        .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outWebp);

      // Convert to JPG < 100KB
      await sharp(inputPath)
        .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outJpg);

      const sizeWebp = fs.statSync(outWebp).size;
      const sizeJpg = fs.statSync(outJpg).size;
      console.log(`Processed ${item.name} -> WebP: ${(sizeWebp/1024).toFixed(1)}KB | JPG: ${(sizeJpg/1024).toFixed(1)}KB`);
    }
  }
}

processImages().catch(console.error);
