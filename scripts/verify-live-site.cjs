'use strict';
// Read-only production checks. Own audit requests will appear in hosting analytics.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),origin='https://www.kyd.kr';
const auditDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replaceAll('-','');
const worksheet='/assets/worksheets/takeout-review.txt';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'site-manifest.json'),'utf8'));
const old=execFileSync('git',['ls-tree','-r','--name-only','12f6144','posts/','tools/'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(p=>/^(posts|tools)\/[^/]+\/index\.html$/.test(p)).map(p=>'/'+p.replace(/index\.html$/,''));
const withdrawn=old.filter(p=>!manifest.urls.includes(p));
const jobs=[...manifest.urls.map(url=>({url,expected:200,canonical:true})),...withdrawn.map(url=>({url,expected:404,withdrawal:true})),...['/favicon.ico','/ads.txt','/sitemap.xml','/rss.xml','/robots.txt','/google50fae352e2643cab','/assets/focus-tools.js','/assets/focus.css'].map(url=>({url,expected:200})),{url:'/google50fae352e2643cab.html',expected:308,location:'/google50fae352e2643cab'},{url:'/blog',expected:301,location:'/guides/'},{url:'/posts/',expected:301,location:'/guides/'},{url:'/public/',expected:301,location:'/'},{url:'/kyd-nonexistent-audit-20261007/',expected:404},{url:'/.archive/site-before-focus-12f6144.zip',expected:404}];
const rows=[];let cursor=0;
jobs.push({url:worksheet,expected:200});
async function run(){
 await Promise.all(Array.from({length:4},async()=>{while(cursor<jobs.length){const job=jobs[cursor++];let observed={};try{
  const response=await fetch(origin+job.url,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'KYD-Publisher-Deployment-Audit/1.0'}}),text=await response.text();
  observed={status:response.status,edge:response.headers.get('cf-ray')?.split('-').pop(),cache:response.headers.get('cf-cache-status'),age:response.headers.get('age')};
  assert.equal(response.status,job.expected,job.url+' HTTP');
  if(job.canonical){assert.ok(text.includes(`rel="canonical" href="${origin+job.url}"`),job.url+' canonical');assert.ok(!/name="robots"[^>]+noindex/.test(text),job.url+' robots');assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'));assert.ok(text.includes('Keep your digital memories.'),'new edition');assert.ok(!text.includes('adsbygoogle.js'),'no ad script');}
  if(job.expected===404){assert.ok(text.includes('This page is not available.'),'custom 404');assert.ok(text.includes('noindex'),'404 noindex');}
  if(job.withdrawal){assert.equal(response.headers.get('x-kyd-withdrawal'),'focused-20261007','withdrawal guard');assert.ok(response.headers.get('cache-control')?.includes('no-store'),'withdrawal must not be cached');}
  if(job.location)assert.equal(new URL(response.headers.get('location'),origin).href,origin+job.location);
  if(job.url.startsWith('/tools/')&&job.canonical){const csp=response.headers.get('content-security-policy')||'';assert.ok(csp.includes("connect-src 'none'")&&csp.includes("script-src 'self'"),'tool CSP served');}
  if(['/ads.txt','/sitemap.xml','/rss.xml','/assets/focus-tools.js','/assets/focus.css',worksheet].includes(job.url))assert.ok(text===fs.readFileSync(path.join(root,job.url.slice(1)),'utf8'),'live source differs from local');
  if(job.url==='/google50fae352e2643cab')assert.equal(text,fs.readFileSync(path.join(root,'google50fae352e2643cab.html'),'utf8'),'Google verification final response');
  if(job.url==='/robots.txt')assert.ok(text.includes('Sitemap: '+origin+'/sitemap.xml')&&/User-agent: \*\s+Allow: \//.test(text),'general robots allow and sitemap');
  rows.push({url:job.url,...observed,pass:true});
 }catch(error){rows.push({url:job.url,...observed,pass:false,error:error.message});}}}));
 rows.sort((a,b)=>a.url.localeCompare(b.url));fs.mkdirSync(path.join(root,'.audit'),{recursive:true});fs.writeFileSync(path.join(root,`.audit/live-focused-${auditDate}.json`),JSON.stringify({checkedAt:new Date().toISOString(),rows},null,2));
 const failed=rows.filter(r=>!r.pass);console.log(JSON.stringify({checked:rows.length,indexable:manifest.urls.length,withdrawn:withdrawn.length,failed},null,2));if(failed.length)process.exitCode=1;
}
run().catch(e=>{console.error(e);process.exitCode=1;});
