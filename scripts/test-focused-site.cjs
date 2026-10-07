'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),origin='https://www.kyd.kr';
const {steps,review,plan,gibToGb,validateSize,compareBytes,MAX_BYTES}=require('../assets/focus-tools.js');
const {guides}=require('./focused-content.cjs');
let checks=0;const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
async function test(){
 for(let mask=0;mask<64;mask++){
  const selected=steps.filter((_,i)=>mask&(1<<i)).map(([id])=>id),r=review(selected);
  assert.equal(r.completed,selected.length);assert.equal(r.remaining.length,6-selected.length);checks+=2;
 }
 assert.equal(review(['scope','scope','unknown']).completed,1);checks++;
 const base={current:120,growth:4,months:12,versions:30,reserve:20,free:200};
 let r=plan(base);assert.equal(r.budget,247.5);assert.equal(r.gap,47.5);assert.equal(r.stress,307.5);checks+=3;
 assert.equal(plan({...base,reserve:0}).budget,198);assert.equal(plan({...base,reserve:50}).budget,396);checks+=2;
 assert.equal(plan({...base,current:0,growth:0,versions:0,free:0}).budget,0);assert.equal(plan({...base,free:300}).headroom,52.5);checks+=2;
 for(const [key,bad]of [['current',''],['growth',-1],['months',1.2],['months',121],['versions',Infinity],['reserve',51],['free',NaN]]){assert.throws(()=>plan({...base,[key]:bad}));checks++;}
 assert.equal(gibToGb(1),1.073741824);assert.throws(()=>gibToGb(''));checks+=2;
 const e=new TextEncoder(),known='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
 const same=await compareBytes(e.encode('abc'),e.encode('abc'),crypto.webcrypto);ok(same.equal,'identical fixture');assert.equal(same.hashA,known);checks++;
 const different=await compareBytes(e.encode('abc'),e.encode('abd'),crypto.webcrypto);ok(!different.equal&&different.hashA!==different.hashB,'same-size differences');
 ok(!(await compareBytes(e.encode('a'),e.encode('ab'),crypto.webcrypto)).equal,'size mismatch');
 const empty=await compareBytes(new Uint8Array(),new Uint8Array(),crypto.webcrypto);ok(empty.equal,'empty files');assert.equal(empty.hashA,'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');checks++;
 validateSize(MAX_BYTES);assert.throws(()=>validateSize(MAX_BYTES+1));assert.throws(()=>validateSize(-1));await assert.rejects(()=>compareBytes(e.encode('a'),e.encode('a'),{}));checks+=4;
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'site-manifest.json'),'utf8'));
 const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),rss=fs.readFileSync(path.join(root,'rss.xml'),'utf8');
 assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]).sort(),manifest.urls.map(u=>origin+u).sort());checks++;
 assert.equal((rss.match(/<item>/g)||[]).length,guides.length);checks++;
 ok(!rss.includes('/posts/')&&!sitemap.includes('/posts/'),'retired articles excluded');
 const titles=new Set(),descriptions=new Set();
 const files=manifest.urls.map(u=>u.slice(1)+'index.html').concat('404.html');
 for(const file of files){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const regex of [/<title>(.*?)<\/title>/g,/<meta name="description" content="([^"]+)"/g,/<h1\b[^>]*>/g])ok([...html.matchAll(regex)].length===1,`${file} unique title, description and h1`);
  ok(html.includes('lang="en"')&&html.includes('class="skip-link"')&&html.includes('id="main-content"'),file+' basic accessibility');
  const title=html.match(/<title>(.*?)<\/title>/)[1],description=html.match(/<meta name="description" content="([^"]+)"/)[1];
  ok(!titles.has(title)&&!descriptions.has(description),file+' unique metadata');titles.add(title);descriptions.add(description);
  if(file==='404.html')ok(html.includes('noindex')&&!html.includes('rel="canonical"'),'404 not indexable');
  else {ok(!html.includes('noindex'),file+' index allowed');ok(html.includes(`rel="canonical" href="${origin}/${file.replace(/index\.html$/,'')}"`),file+' canonical');}
  for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){JSON.parse(m[1]);checks++;}
  ok(!/adsbygoogle|pagead2\.googlesyndication|gtag\(/.test(html),file+' no ad or tracking scripts in source');
  for(const m of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){
   const url=m[1],target=path.join(root,url.endsWith('/')?url.slice(1)+'index.html':url.slice(1));
   ok(fs.existsSync(target),`broken internal link ${file} -> ${url}`);
  }
  for(const m of html.matchAll(/href="#([^"]+)"/g))ok(html.includes(`id="${m[1]}"`),file+' valid fragment '+m[1]);
  ok(fs.readFileSync(path.join(root,'public',file)).equals(Buffer.from(html)),file+' mirror');
 }
 const listFiles=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?listFiles(path.join(dir,x.name)):[path.join(dir,x.name)]);
 const publicFiles=listFiles(path.join(root,'public'));
 const publicHtml=publicFiles.filter(p=>p.endsWith('.html')).map(p=>path.relative(path.join(root,'public'),p).split(path.sep).join('/'));
 assert.deepEqual(publicHtml.sort(),[...files,'google50fae352e2643cab.html'].sort());checks++;
 for(const p of publicFiles){const rel=path.relative(path.join(root,'public'),p);ok(!/(?:^|[\\/])(?:\.archive|scripts|docs)(?:[\\/])/.test(rel),'private material excluded');ok(fs.readFileSync(p).equals(fs.readFileSync(path.join(root,rel))),rel+' exact mirror');}
 ok(!fs.existsSync(path.join(root,'public/posts')),'no old article bodies served');
 const routes=JSON.parse(fs.readFileSync(path.join(root,'_routes.json'),'utf8'));
 const matches=(rule,url)=>rule.endsWith('*')?url.startsWith(rule.slice(0,-1)):url===rule;
 const invokes=url=>routes.include.some(rule=>matches(rule,url))&&!routes.exclude.some(rule=>matches(rule,url));
 for(const url of manifest.urls.concat('/posts/','/posts','/blog','/ads.txt','/sitemap.xml','/rss.xml','/assets/focus-tools.js','/assets/focus.css'))ok(!invokes(url),url+' uses static serving, not Functions quota');
 ok(routes.include.length+routes.exclude.length<=100&&routes.include.every(rule=>rule.length<=100),'Pages route limits');
 const workerSource=fs.readFileSync(path.join(root,'_worker.js'),'utf8');
 const worker=(await import('data:text/javascript;base64,'+Buffer.from(workerSource).toString('base64'))).default;
 const oldFiles=require('node:child_process').execFileSync('git',['ls-tree','-r','--name-only','12f6144','posts/','tools/'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(p=>/^(posts|tools)\/[^/]+\/index\.html$/.test(p));
 const retiredUrls=oldFiles.map(p=>'/'+p.replace(/index\.html$/,'')).filter(url=>!manifest.urls.includes(url));
 for(const url of retiredUrls){
  ok(invokes(url),url+' withdrawal route included');
  const response=await worker.fetch(new Request(origin+url),{ASSETS:{fetch(){throw Error('Retired route must not read a stale static asset');}}});
  ok(response.status===404&&response.headers.get('x-robots-tag').includes('noindex')&&response.headers.get('cache-control').includes('no-store'),url+' real non-cacheable 404');
  assert.equal(await response.text(),fs.readFileSync(path.join(root,'404.html'),'utf8'));checks++;
 }
 for(const method of ['HEAD','POST']){const response=await worker.fetch(new Request(origin+retiredUrls[0],{method}),{});assert.equal(response.status,method==='HEAD'?404:405);assert.equal(await response.text(),'');checks+=2;}
 const passthrough=await worker.fetch(new Request(origin+'/guides/'),{ASSETS:{fetch:()=>new Response('static passthrough')}});assert.equal(await passthrough.text(),'static passthrough');checks++;
 for(const url of ['/tools/account-security-check','/posts/withdrawn/index.html','/posts/withdrawn/?a=%3Cscript%3E']){const response=await worker.fetch(new Request(origin+url),{});assert.equal(response.status,404);checks++;}
 const home=fs.readFileSync(path.join(root,'index.html'),'utf8');ok(home.includes('eb364159212d145f765c1e6e519e267074bedf03'),'Naver verification');
 ok(home.includes('ca-pub-7587676721583907'),'AdSense metadata');
 assert.equal(fs.readFileSync(path.join(root,'ads.txt'),'utf8').trim(),'google.com, pub-7587676721583907, DIRECT, f08c47fec0942fa0');checks++;
 const headers=fs.readFileSync(path.join(root,'_headers'),'utf8');ok(headers.includes("connect-src 'none'")&&headers.includes("script-src 'self'"),'local tool CSP');
 const toolCode=fs.readFileSync(path.join(root,'assets/focus-tools.js'),'utf8');ok(!/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB)\b/.test(toolCode),'tool code has no network or persistent store');
 ok(fs.statSync(path.join(root,'favicon.ico')).size>22,'real ICO file');
 for(const file of ['favicon.ico','_headers','_redirects','ads.txt','robots.txt','sitemap.xml','rss.xml','site-manifest.json','google50fae352e2643cab.html'])ok(fs.readFileSync(path.join(root,file)).equals(fs.readFileSync(path.join(root,'public',file))),file+' required public artifact');
 console.log(`PASS: ${checks} assertions; 64 checklist states; file byte/hash fixtures; planner bounds; ${manifest.urls.length} canonical pages; ${guides.length} RSS guides; no withdrawn HTML; root/public parity.`);
}
test().catch(error=>{console.error(error);process.exitCode=1;});
