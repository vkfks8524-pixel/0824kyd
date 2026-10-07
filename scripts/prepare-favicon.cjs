'use strict';
// Optional asset-generation dependency. The site build itself needs only Node.
const sharp=require('sharp'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const png=await sharp(path.join(root,'assets/favicon.svg')).resize(32,32).png().toBuffer();
 const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=32;header[7]=32;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
 fs.writeFileSync(path.join(root,'favicon.ico'),Buffer.concat([header,png]));
 console.log('Generated a 32px PNG-backed ICO from the existing SVG identity.');
})().catch(e=>{console.error(e);process.exitCode=1;});
