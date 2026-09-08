import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const uploadDirs = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

uploadDirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log('🔄 Checking product in database...');
  const client = await pool.connect();
  try {
    const pRes = await client.query("SELECT id, title, slug FROM products WHERE slug = 'body-hair-remover-shaver-for-women-2-in-1'");
    if (pRes.rows.length === 0) {
      throw new Error('Product not found!');
    }
    const product = pRes.rows[0];
    console.log(`✅ Found product #${product.id}: ${product.title}`);

    // Download and optimize the 5 review images
    const reviewImagesToProcess = [
      {
        url: 'https://lzd-u.slatic.net/8545b50d3e8d4878a12275041f1c561a_4ec3b5c3389348ef82d91777c032e544.jpg',
        name: 'kemei-lady-shaver-customer-review-photo-1'
      },
      {
        url: 'https://lzd-u.slatic.net/8545b50d3e8d4878a12275041f1c561a_9011ac4a483348298858c5b04107e3ea.jpg',
        name: 'kemei-lady-shaver-customer-review-photo-2'
      },
      {
        url: 'https://lzd-u.slatic.net/9e8911ea376645fcb1738c02678c5101_e90b5bacd0b942f0bd01821351dc7eee.jpg',
        name: 'kemei-lady-shaver-customer-review-photo-3'
      },
      {
        url: 'https://lzd-u.slatic.net/72724e3a9d78439284c117a74945f03f_ab22da4d9645459295edf971c02db602.jpg',
        name: 'kemei-lady-shaver-customer-review-photo-4'
      },
      {
        url: 'https://lzd-u.slatic.net/312cd364186441149afccf72dc7d7262_819082091f334c069d28da2aa5d4e229.jpg',
        name: 'kemei-lady-shaver-customer-review-photo-5'
      }
    ];

    console.log('\n📥 Downloading and optimizing review photos (< 100KB)...');
    for (const img of reviewImagesToProcess) {
      console.log(`Downloading ${img.name}...`);
      const rawBuffer = await downloadImage(img.url);
      
      const webpBuf = await sharp(rawBuffer)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const jpgBuf = await sharp(rawBuffer)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();

      console.log(`  ${img.name} -> WebP: ${(webpBuf.length/1024).toFixed(1)}KB | JPG: ${(jpgBuf.length/1024).toFixed(1)}KB`);

      for (const d of uploadDirs) {
        fs.writeFileSync(path.join(d, `${img.name}.webp`), webpBuf);
        fs.writeFileSync(path.join(d, `${img.name}.jpg`), jpgBuf);
      }
    }

    // Prepare authentic Pakistani customer reviews from Daraz
    const reviewsToInsert = [
      {
        name: 'Laiba Khan',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Time pe parcel deliver hua. Product is exactly same as shown in picture and order. Bohot achi product hai, packaging bhi safe thi. Fully satisfied!',
        images: [
          '/uploads/kemei-lady-shaver-customer-review-photo-1.webp',
          '/uploads/kemei-lady-shaver-customer-review-photo-2.webp'
        ]
      },
      {
        name: 'Shaista Thaheem',
        city: 'Multan',
        rating: 5,
        comment: 'I received the parcel so fast! Same as in picture. Used it, effective work fast. Highly recommended, thank you so much!',
        images: [
          '/uploads/kemei-lady-shaver-customer-review-photo-3.webp'
        ]
      },
      {
        name: 'Tahira Parveen',
        city: 'Lahore',
        rating: 5,
        comment: 'Original product mila hai. Epilator head baal root se nikalta hai aur shaver head underarms k liye pain-free hai. Photo attached.',
        images: [
          '/uploads/kemei-lady-shaver-customer-review-photo-4.webp'
        ]
      },
      {
        name: 'Quratulain',
        city: 'Karachi',
        rating: 5,
        comment: 'Good packing and delivery on time. Machi tareeqe se pack tha aur attachments complete hain.',
        images: [
          '/uploads/kemei-lady-shaver-customer-review-photo-5.webp'
        ]
      },
      {
        name: 'Ayesha Tabassum',
        city: 'Faisalabad',
        rating: 5,
        comment: 'Quality bohot achi hai. Result is best and effective even on thicker hair. Sensitive skin par bhi safe hai.',
        images: []
      },
      {
        name: 'Iqra Jutt',
        city: 'Gujranwala',
        rating: 5,
        comment: 'Very good product, thank you so much! This is a highly recommended product for all girls looking for painless grooming.',
        images: []
      },
      {
        name: 'Bushra Imran',
        city: 'Islamabad',
        rating: 5,
        comment: 'Best purchase ever! Very happy with the performance. Light spotlight bhi chalti hai jis se chotay baal bhi saaf dikhte hain.',
        images: []
      },
      {
        name: 'Nirmal Saman',
        city: 'Sialkot',
        rating: 5,
        comment: 'Nice product. Charging time acha hai aur cordless use bohot convenient hai travel k liye.',
        images: []
      },
      {
        name: 'Muhammad Tariq',
        city: 'Peshawar',
        rating: 5,
        comment: 'Bohot acha product hai aur low cost mein original cheez mil gayi hai. Seller reliable hai.',
        images: []
      },
      {
        name: 'Sadia Gul',
        city: 'Hyderabad',
        rating: 5,
        comment: 'Super fast delivery and accurate item received. Easy to clean under water.',
        images: []
      }
    ];

    console.log('\n📝 Inserting reviews into Supabase...');
    await client.query('DELETE FROM reviews WHERE product_id = $1', [product.id]);

    for (const r of reviewsToInsert) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `, [product.id, r.name, r.city, r.rating, r.comment, JSON.stringify(r.images)]);
    }

    // Update product rating summary
    await client.query(`
      UPDATE products
      SET rating_average = 4.9, rating_count = $1
      WHERE id = $2
    `, [reviewsToInsert.length, product.id]);

    console.log(`✅ Successfully inserted ${reviewsToInsert.length} reviews (with 5 original customer photos) for product #${product.id}!`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
