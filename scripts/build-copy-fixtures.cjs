'use strict';
// Original, code-native SVG fixtures. No personal photographs or external resources.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const source=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
<title>KYD synthetic copy-check chart</title>
<metadata>KYD-record=A</metadata>
<rect width="640" height="400" fill="#f6f5ef"/>
<rect x="32" y="32" width="576" height="336" rx="18" fill="#155746"/>
<circle cx="170" cy="170" r="72" fill="#e5b964"/>
<path d="M300 285 L400 105 L520 285 Z" fill="#ffffff"/>
<path d="M70 320 H570" stroke="#ffffff" stroke-width="4"/>
</svg>
`;
const definitions=[
 ['reference.svg',source,'Original geometric test chart.'],
 ['identical-copy.svg',source,'Exact copy; only the filename is different.'],
 ['metadata-change.svg',source.replace('record=A','record=B'),'One metadata byte changed. Drawing instructions unchanged.'],
 ['visible-change.svg',source.replace('#155746','#955746'),'One color byte changed; same byte count, different drawing.'],
 ['truncated.svg',source.slice(0,200),'Only the first 200 bytes retained; deliberately incomplete XML.']
];
const cases=[
 {id:'identical',a:'reference.svg',b:'identical-copy.svg',equal:true,label:'Identical copy',lesson:'A new filename did not change the contents. Opening the image is still a separate check.'},
 {id:'metadata',a:'reference.svg',b:'metadata-change.svg',equal:false,label:'Metadata-only change',lesson:'The drawing commands are unchanged, but one metadata byte differs. A mismatch alone is not a corruption diagnosis.'},
 {id:'visible',a:'reference.svg',b:'visible-change.svg',equal:false,label:'Same size, different drawing',lesson:'One color byte differs. Equal file sizes did not establish identical contents.'},
 {id:'truncated',a:'reference.svg',b:'truncated.svg',equal:false,label:'Truncated file',lesson:'The comparison detects different contents, not the cause. This supplied fixture is deliberately incomplete.'},
 {id:'broken-match',a:'truncated.svg',b:'truncated.svg',equal:true,label:'Two identical broken inputs',lesson:'Identical contents can still be invalid image data. A match is not an image-health check.'}
];
const files=definitions.map(([name,text,note])=>({name,text,note,size:Buffer.byteLength(text),sha256:crypto.createHash('sha256').update(text).digest('hex')}));
const fixtureSet={version:'2026-10-15',kind:'Synthetic SVG software fixtures, not camera photographs',files,cases};
function build(){
 const dir=path.join(__dirname,'../assets/file-copy-lab');fs.mkdirSync(dir,{recursive:true});
 for(const file of files)fs.writeFileSync(path.join(dir,file.name),file.text);
 const manifest={...fixtureSet,files:files.map(({text,...file})=>file)};
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'SHA256SUMS.txt'),files.map(f=>f.sha256+'  '+f.name).join('\n')+'\n');
 fs.writeFileSync(path.join(__dirname,'../assets/copy-fixtures.js'),'// Generated public synthetic fixtures. No personal data.\nwindow.KYDCopyFixtures='+JSON.stringify(fixtureSet)+';\n');
 console.log('Built 5 deterministic image fixtures and independent Node SHA-256 manifest.');
}
if(require.main===module)build();
module.exports={files,cases,build};
