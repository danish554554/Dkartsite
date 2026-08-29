async function checkDkart() {
  const res = await fetch('https://www.dkart.pk/shop');
  const html = await res.text();
  console.log('HTML length:', html.length);
  const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  console.log('JS Bundle on dkart.pk:', match ? match[1] : 'not found');
  if (match) {
    const jsRes = await fetch('https://www.dkart.pk' + match[1]);
    const js = await jsRes.text();
    console.log('Contains localhost:', js.includes('localhost:5000'));
    console.log('Contains dkartsite.onrender.com:', js.includes('dkartsite.onrender.com'));
    
    // Find what API_BASE_URL evaluates to
    const apiMatches = js.match(/https:\/\/[a-zA-Z0-9\.\-_]+\/api/g);
    console.log('API URLs found in JS bundle:', apiMatches);
  }
}
checkDkart().catch(console.error);
