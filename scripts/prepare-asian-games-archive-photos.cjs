// Mechanical resizing of CC0 archive photographs, without generative edits.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const sources = process.argv.slice(2);
const names = ['toyota-stadium-2010', 'jra-equestrian-gate-2017'];
if (sources.length !== names.length) throw new Error('Pass the Toyota and JRA original photo paths.');
(async () => {
  for (let i = 0; i < names.length; i++) {
    for (const width of [480, 1200]) {
      const destination = path.resolve(__dirname, '../assets/editorial', `${names[i]}-${width}.webp`);
      if (fs.existsSync(destination)) throw new Error(`Refusing to overwrite ${destination}`);
      const info = await sharp(sources[i]).rotate().resize({width, withoutEnlargement:true}).webp({quality:84}).toFile(destination);
      console.log(JSON.stringify({file:path.basename(destination),width:info.width,height:info.height,bytes:info.size}));
    }
  }
})().catch(error => {console.error(error); process.exitCode=1;});
