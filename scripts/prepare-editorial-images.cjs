// Encoding/resizing only: preserve the complete generated composition.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const names = ['phone-choice', 'phone-storage', 'phone-budget'];
const sources = process.argv.slice(2);
if (sources.length !== 3) throw new Error('Pass three source PNG paths: choice, storage, budget');
const target = path.resolve(__dirname, '../assets/editorial');
fs.mkdirSync(target, {recursive: true});
(async () => {
  for (let i=0; i<names.length; i++) {
    for (const width of [480,1200]) {
      const destination = path.join(target, names[i]+'-'+width+'.webp');
      if (fs.existsSync(destination)) throw new Error('Will not overwrite: '+destination);
      const info = await sharp(sources[i]).resize({width,withoutEnlargement:true}).webp({quality:82}).toFile(destination);
      console.log(JSON.stringify({file:path.basename(destination),width:info.width,height:info.height,bytes:info.size}));
    }
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
