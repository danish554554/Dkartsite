import https from 'https';
import fs from 'fs';

const url = 'https://my.daraz.pk/pdp/review/getReviewList?itemId=944861291&pageSize=50&filter=0&sort=0&pageNo=1';
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const items = json.data?.reviewItems || json.model?.items || [];
      console.log('Total reviews fetched:', items.length);
      fs.writeFileSync('daraz_reviews_944861291.json', JSON.stringify(json, null, 2));
      items.forEach((r, i) => {
        console.log(`[${i+1}] Rating: ${r.rating} | User: ${r.buyerName} | Date: ${r.reviewTime || r.boughtDate}`);
        console.log(`     Comment: ${r.reviewContent}`);
        if (r.images && r.images.length > 0) {
          console.log(`     Images (${r.images.length}):`, r.images.map(img => img.url));
        }
      });
    } catch (e) {
      console.error('Error parsing:', e.message);
      console.log('Data head:', data.slice(0, 300));
    }
  });
}).on('error', err => console.error(err.message));
