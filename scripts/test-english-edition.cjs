'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),content=require('./english-edition.cjs');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const original=file=>cp.execFileSync('git',['show','440df81:'+file],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const paths=[...read('sitemap.xml').matchAll(/<loc>https:\/\/www\.kyd\.kr\/([^<]*)<\/loc>/g)].map(m=>m[1]+'index.html');
const newPosts=require('./global-search-guides.cjs').posts;
const baselinePaths=[...original('sitemap.xml').matchAll(/<loc>https:\/\/www\.kyd\.kr\/([^<]*)<\/loc>/g)].map(m=>m[1]+'index.html');
assert.equal(paths.length,baselinePaths.length+Object.keys(newPosts).length);
for(const file of baselinePaths)assert(paths.includes(file),file+' original canonical page remains');
const published=html=>html.match(/property="article:published_time" content="([^"]+)"/)[1];
const tables=html=>[...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/g)].map(m=>m[0]);
const numericCells=html=>[...html.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(m=>(m[1].replace(/<[^>]+>/g,' ').replace(/September\s+/g,'9/').replace(/October\s+/g,'10/').replace(/\bfive-set/g,'5-set').match(/\d+(?:[.,]\d+)?/g)||[]));
const sourceUrls=html=>[...new Set([...html.match(/<section class="sources"[^>]*>([\s\S]*?)<\/section>/)[1].matchAll(/href="([^"]+)"/g)].map(m=>m[1]))];
for(const file of [...paths,'404.html']){
 const html=read(file);
 assert(html.includes('<html lang="en">'),file+' English document language');
 assert(!/[가-힣]/.test(html),file+' untranslated copy');
 assert.equal(read('public/'+file),html,file+' deployment mirror');
 const isNew=newPosts[file.split('/')[1]] && /^posts\/[^/]+\/index\.html$/.test(file);
 const before=isNew?null:original(file);
 const expectedCanonical=isNew?'https://www.kyd.kr/'+file.replace(/index\.html$/,''):before.match(/rel="canonical" href="([^"]+)"/)?.[1];
 assert.equal(html.match(/rel="canonical" href="([^"]+)"/)?.[1],expectedCanonical,file+' canonical retained or correctly created');
 for(const [,json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){
  const schema=JSON.parse(json);if(schema.inLanguage)assert.equal(schema.inLanguage,'en',file+' schema language');
 }
 if(/^posts\/[^/]+\/index\.html$/.test(file)){
  if(isNew){assert.equal(published(html),'2026-10-05');assert(html.includes('Source information last checked:'));continue;}
  const slug=file.split('/')[1];assert.equal(published(html),published(before),file+' original publication date');
  assert.equal(html.match(/property="article:modified_time" content="([^"]+)"/)[1],'2026-10-05');
  assert.deepEqual(sourceUrls(html),sourceUrls(before),file+' source URLs');
  assert(html.includes('Translation does not renew the source check'));
  assert(html.includes(content[slug].title.replace(/&/g,'&amp;')));
  for(const [,url] of before.matchAll(/href="(\/tools\/[^"#]+\/)(?:#[^"]*)?"/g))assert(html.includes('href="'+url+'"'),file+' related tool retained');
  if(content[slug].group==='sports'){
   const oldTables=tables(before),newTables=tables(html);assert.equal(newTables.length,oldTables.length);
   for(let i=0;i<oldTables.length;i++)assert.deepEqual(numericCells(newTables[i]),numericCells(oldTables[i]),file+' table '+i+' numeric records');
  }
  for(const [,tag] of before.matchAll(/(<img\b[^>]+>)/g)){
   const src=tag.match(/src="([^"]+)"/)?.[1];assert(html.includes('src="'+src+'"'),file+' original image');
  }
  for(const [,license] of before.matchAll(/href="(https:\/\/(?:creativecommons\.org|www\.pexels\.com\/license|unsplash\.com\/license)[^"]*)"/g))assert(html.includes(license),file+' photo license');
 }
}
for(const file of ['assets/tools.js','assets/phone-cost.js','assets/storage-choice.js','assets/backup-check.js','assets/library.js']){
 const js=read(file);assert(!/[가-힣]/.test(js),file+' output language');assert.equal(read('public/'+file),js);new Function(js);
}
assert(read('rss.xml').includes('<language>en</language>'));
assert(!/[가-힣]/.test(read('rss.xml')));
for(const token of original('index.html').match(/<meta name="naver-site-verification"[^>]*>/g)||[])assert(read('index.html').includes(token));
for(const file of ['ads.txt','robots.txt','google50fae352e2643cab.html','_redirects'])assert.equal(read(file).replace(/\r\n/g,'\n'),original(file).replace(/\r\n/g,'\n'),file+' operational file unchanged');
assert(read('index.html').includes('South Korean won (KRW)'));
console.log('PASS: '+Object.keys(content).length+' original English adaptations retained and '+Object.keys(newPosts).length+' new articles; '+paths.length+' canonical pages, utility page, original dates/URLs/sources/photos/licenses, sports-table numbers, related tools, English scripts, RSS and verification files.');
