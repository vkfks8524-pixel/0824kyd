'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const batches=fs.readdirSync(__dirname).filter(name=>/^everyday-guides-\d{8}\.cjs$/.test(name)).sort().reverse().map(name=>require('./'+name));
const escape=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const library=read('posts/index.html'),home=read('index.html'),rss=read('rss.xml'),sitemap=read('sitemap.xml');
let count=0;
for(const batch of batches)for(const [slug,data] of Object.entries(batch.posts)){
 count++;
 const file='posts/'+slug+'/index.html',html=read(file),url='https://www.kyd.kr/posts/'+slug+'/';
 assert.equal(read('public/'+file),html);
 assert(html.includes('<h1>'+escape(data.title)+'</h1>'));
 assert(html.includes('rel="canonical" href="'+url+'"'));
 assert.equal((html.match(/<h1>/g)||[]).length,1);
 assert.equal((html.match(/<main /g)||[]).length,1);
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.equal(schema.datePublished,batch.checked);assert.equal(schema.dateModified,batch.checked);
 assert.equal(schema.headline,data.title);assert.equal(schema.image.width,data.photo.width);assert.equal(schema.image.height,data.photo.height);
 assert.equal(schema.image.license,data.photo.license);assert.equal(schema.inLanguage,'en');
 assert(html.includes(escape(data.photo.caption)) && html.includes(escape(data.photo.credit)) && html.includes(data.photo.license));
 for(const width of [480,1200]){
  const image='assets/editorial/'+data.photo.name+'-'+width+'.webp';
  assert(fs.readFileSync(path.join(root,image)).equals(fs.readFileSync(path.join(root,'public',image))));
  assert(html.includes(image));
 }
 for(const [source] of data.sources)assert(html.includes(escape(source)),slug+' missing source');
 for(const [,href] of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
  const relative=href.slice(1),target=relative.endsWith('/')?relative+'index.html':relative;
  assert(fs.existsSync(path.join(root,target)),slug+' broken internal URL '+href);
 }
 for(const [,id] of html.matchAll(/<h2 id="([^"]+)"/g))assert(html.includes('href="#'+id+'"'));
 assert(library.includes('href="/posts/'+slug+'/"'));
 if(batch===batches[0])assert(home.includes('href="/posts/'+slug+'/"'));
 assert(sitemap.includes('<loc>'+url+'</loc><lastmod>'+batch.checked+'</lastmod>'));
 assert(rss.includes('<link>'+url+'</link>') && rss.includes(data.photo.name+'-1200.webp'));
 assert(!/[가-힣]/.test(html));
 console.log(slug+': '+data.body.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length+' body words; metadata, source links, photo credit and discovery checked.');
}
assert(library.includes('Everyday decisions <span>'+count+'</span>'));
assert(library.includes('<span class="section-count">'+count+' articles</span>'));
assert.equal((library.match(/id="everyday"/g)||[]).length,1);
assert.equal((home.match(/id="everyday-title"/g)||[]).length,1);
assert(read('posts/gmail-storage-full-find-large-emails/index.html').includes('permanently delete only confirmed disposable items'));
assert(read('posts/canva-download-blurry-png-jpg-pdf/index.html').includes('Do not use cropping to hide sensitive material.'));
console.log('PASS: '+count+' illustrated everyday guides; prior batches remain discoverable with their original dates.');
