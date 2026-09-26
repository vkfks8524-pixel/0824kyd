// Resize/crop licensed photographs for web delivery; no generated or retouched content.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const names = ['phone-choice-photo', 'phone-storage-photo', 'phone-budget-photo'];
const sources = process.argv.slice(2);
if (sources.length !== 3) throw new Error('Pass three photo paths: choice, storage, budget');
const target = path.resolve(__dirname, '../assets/editorial');
(async () => {
  for (let i = 0; i < names.length; i++) {
    const metadata = await sharp(sources[i]).metadata();
    for (const width of [480, 1200]) {
      const destination = path.join(target, names[i] + '-' + width + '.webp');
      if (fs.existsSync(destination)) throw new Error('Will not overwrite: ' + destination);
      let photo = sharp(sources[i]);
      // This portrait has empty space above the handset. Keep the entire screen in the crop.
      if (i === 1) photo = photo.extract({left:0, top:Math.round(metadata.height * 5 / 18), width:metadata.width, height:Math.round(metadata.width * 2 / 3)});
      const info = await photo.resize(width, Math.round(width * 2 / 3), {fit:'cover', position:'centre'}).webp({quality:84}).toFile(destination);
      console.log(JSON.stringify({file:path.basename(destination), width:info.width, height:info.height, bytes:info.size}));
    }
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
