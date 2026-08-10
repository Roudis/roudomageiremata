const fs = require('fs');
const https = require('https');
const path = require('path');

const foodImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484723091791-c0e7e147c09e?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473093295043-cdd814d0e601?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528625245642-12595fb0739c?w=800&auto=format&fit=crop"
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return resolve(download(response.headers.location, dest));
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
  for (let i = 0; i < foodImages.length; i++) {
    const dest = path.join(__dirname, 'public', 'images', 'recipes', `placeholder-${i + 1}.jpg`);
    console.log(`Downloading ${i+1}/${foodImages.length}...`);
    try {
      await download(foodImages[i], dest);
    } catch (e) {
      console.error(e);
    }
  }
  console.log('Done downloading images.');
}

run();
