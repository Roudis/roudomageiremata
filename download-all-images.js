const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const { URL } = require('url');

function download(urlStr, dest) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    
    lib.get(parsedUrl, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle relative redirects
        const redirectUrl = new URL(response.headers.location, urlStr).toString();
        return resolve(download(redirectUrl, dest));
      }
      
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const total = 30;
  for (let i = 1; i <= total; i++) {
    const dest = path.join(__dirname, 'public', 'images', 'recipes', `placeholder-${i}.jpg`);
    console.log(`Downloading ${i}/${total}...`);
    try {
      // Use loremflickr to get unique food images
      await download(`https://loremflickr.com/800/600/food,recipe,dish?lock=${i + 100}`, dest);
    } catch (e) {
      console.error(`Failed to download image ${i}:`, e);
    }
  }
  
  // Now update recipes
  const recipesDir = path.join(__dirname, 'data', 'recipes');
  const files = fs.readdirSync(recipesDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  jsonFiles.forEach((file, index) => {
    const filePath = path.join(recipesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.imageUrl = `/images/recipes/placeholder-${(index % total) + 1}.jpg`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  });
  
  console.log('Done downloading 30 unique images and updating recipes.');
}

run();
