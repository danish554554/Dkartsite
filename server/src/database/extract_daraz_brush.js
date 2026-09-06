import fs from 'fs';

const filePath = 'C:/Users/danis/.gemini/antigravity/brain/094c1c0c-1a2a-44e5-a09a-31bd3c94c95b/.system_generated/steps/3261/content.md';
const text = fs.readFileSync(filePath, 'utf8');

console.log('File length:', text.length);

const keywords = ['review', 'buyerFeedback', 'reviewTitle', 'rating', 'feedback'];
for (const kw of keywords) {
  let idx = 0;
  let count = 0;
  while ((idx = text.indexOf(kw, idx + 1)) !== -1 && count < 5) {
    console.log(`Found "${kw}" at ${idx}:`, text.slice(idx - 20, idx + 150).replace(/\n/g, ' '));
    count++;
  }
}
