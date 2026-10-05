// Arithmetic, editorial boundaries, attribution and deployment-mirror regression checks.
// Official-source verification is documented in docs/asian-games-2026-final-verified-results.json.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const facts = JSON.parse(read('docs/asian-games-2026-final-verified-results.json'));
const slugs = ['asian-games-2026-10-03-results','asian-games-2026-10-04-results','asian-games-2026-final-medal-standings'];
assert.equal(facts.medals.length,40);
assert.equal(new Set(facts.medals.map(r=>r.noc)).size,40);
for (const row of facts.medals) assert.equal(row.gold+row.silver+row.bronze,row.total,row.noc);
assert.deepEqual(facts.medals.find(r=>r.noc==='KOR'),{rank:3,noc:'KOR',name:'대한민국',gold:39,silver:43,bronze:68,total:150});
assert.deepEqual(facts.oct3.womenArchery.regular,[5,5]);
assert.deepEqual(facts.oct3.womenArchery.shootOff,[8,10]);
assert.equal(facts.oct4.aKorea.result,12);
assert.equal(facts.oct4.aKorea.round2Penalties,4);
assert.equal(facts.oct4.bKorea.result,32);
assert.equal(facts.oct4.bKorea.round2Penalties,9);
assert.deepEqual(facts.oct4.bJumpOff.map(r=>r.penalties),[0,8,8]);
const library=read('posts/index.html'), home=read('index.html'), rss=read('rss.xml');
assert.match(library,/All 32 articles/);
assert.match(library,/Sport <span>6<\/span>/);
for (const slug of slugs) {
  const file=`posts/${slug}/index.html`, html=read(file);
  const url=`https://www.kyd.kr/posts/${slug}/`;
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert(html.includes(`rel="canonical" href="${url}"`));
  assert(html.includes('class="reading-toc"'));
  assert(html.includes('class="next-reads"'));
  assert(html.includes('class="sources"'));
  assert(html.includes('12:48 KST'));
  assert(html.includes('CC0 1.0'));
  assert(html.includes('Not a photograph')||html.includes('Not the 2026 Asian Games'));
  assert(library.includes(`/posts/${slug}/`));
  assert(home.includes(`/posts/${slug}/`));
  assert(rss.includes(url));
  assert(read('sitemap.xml').includes(url));
  assert.equal(read('public/'+file),html);
  const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const article=scripts.find(s=>s['@type']==='NewsArticle');
  assert.equal(article.datePublished,'2026-10-05T12:48:00+09:00');
  assert.equal(article.mainEntityOfPage,url);
  assert.equal(article.image.license,'https://creativecommons.org/publicdomain/zero/1.0/');
  assert.equal(article.image.width,1200);
  assert(scripts.some(s=>s['@type']==='BreadcrumbList'));
}
for (const stem of ['toyota-stadium-2010','jra-equestrian-gate-2017']) {
  const manifest=JSON.parse(read(`assets/editorial/${stem}-license.json`));
  assert.equal(manifest.license,'CC0 1.0');
  assert(manifest.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
  for(const file of manifest.files) {
    const p=`assets/editorial/${file.name}`;
    assert.deepEqual(fs.readFileSync(path.join(root,p)),fs.readFileSync(path.join(root,'public',p)));
  }
  assert(rss.includes(manifest.author));
}
console.log('PASS: 40 medal rows, Korea totals, shoot-off/round boundaries, three article schemas, source/photo credits, discovery links, feeds and public mirrors.');
