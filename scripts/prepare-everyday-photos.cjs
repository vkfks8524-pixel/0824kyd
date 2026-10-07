'use strict';
// Technical resizing only. Keep composition and record the source license in captions.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),args=process.argv.slice(2);
const custom=args[0]==='--named';
const names=custom?[args[1],args[3]]:['rain-umbrella','amazon-parcel'];
const sources=custom?[args[2],args[4]]:args;
if((custom?args.length!==5:args.length!==2)||names.some(name=>!name||!/^[a-z][a-z0-9-]*$/.test(name)))throw new Error('Pass two source paths, or --named name source name source');
(async()=>{
 for(const [index,name] of names.entries()){
  for(const width of [480,1200]){
   const file=path.join(root,'assets/editorial',name+'-'+width+'.webp');
   if(fs.existsSync(file))throw new Error('Refusing to overwrite '+file);
   const result=await sharp(sources[index]).rotate().resize({width,withoutEnlargement:true}).webp({quality:84}).toFile(file);
   fs.copyFileSync(file,path.join(root,'public/assets/editorial',path.basename(file)));
   console.log(JSON.stringify({file:path.basename(file),width:result.width,height:result.height,bytes:result.size}));
  }
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
