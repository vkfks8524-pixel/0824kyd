'use strict';
// Technical resizing only. Keep composition and record the source license in captions.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),sources=process.argv.slice(2);
if(sources.length!==2)throw new Error('Pass rain.jpg and amazon.jpg source paths');
(async()=>{
 for(const [index,name] of ['rain-umbrella','amazon-parcel'].entries()){
  for(const width of [480,1200]){
   const file=path.join(root,'assets/editorial',name+'-'+width+'.webp');
   if(fs.existsSync(file))throw new Error('Refusing to overwrite '+file);
   const result=await sharp(sources[index]).rotate().resize({width,withoutEnlargement:true}).webp({quality:84}).toFile(file);
   fs.copyFileSync(file,path.join(root,'public/assets/editorial',path.basename(file)));
   console.log(JSON.stringify({file:path.basename(file),width:result.width,height:result.height,bytes:result.size}));
  }
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
