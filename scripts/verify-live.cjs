'use strict';
// Read-only check of the published site against this build.
const fs = require('node:fs'), path = require('node:path');
const pub = path.resolve(__dirname, '../public'), origin = 'https://www.kyd.kr', m = JSON.parse(fs.readFileSync(path.join(pub, 'site-manifest.json')));
const fails = []; let n = 0;
const get = (u, o = {}) => fetch(origin + u, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'KYD-Deployment-Check' }, ...o });
const check = (v, msg) => { n++; if (!v) fails.push(msg); };
(async () => {
  for (const u of m.urls) { const r = await get(u), t = await r.text(); check(r.status === 200, `${u} ${r.status}`); check(t.includes(`rel="canonical" href="${origin + u}"`), u + ' canonical'); check(t.includes(fs.readFileSync(path.join(pub, u.slice(1), 'index.html'), 'utf8').match(/<title>.*?<\/title>/)[0]), u + ' title'); check(!/noindex/.test(r.headers.get('x-robots-tag') || ''), u + ' robots header'); if (u.startsWith('/tools/')) check((r.headers.get('content-security-policy') || '').includes("connect-src 'none'") && r.headers.get('content-security-policy').includes('blob:'), u + ' csp'); }
  for (const [a, b] of m.redirects) { const r = await get(a); check(r.status === 301 && new URL(r.headers.get('location'), origin).pathname === b, `${a} ${r.status}`); }
  for (const u of [...m.retired, '/posts/old-article/', '/no-such-page/']) { const r = await get(u); check(r.status === 404, `${u} ${r.status}`); }
  for (const u of ['/ads.txt', '/sitemap.xml', '/rss.xml', '/assets/ko/core.js', '/assets/ko/tools.js', '/assets/ko/ko.css', '/assets/evidence/photo-compress-20261124.json']) { const r = await get(u), b = Buffer.from(await r.arrayBuffer()); check(r.status === 200 && b.equals(fs.readFileSync(path.join(pub, u.slice(1)))), u); }
  console.log(JSON.stringify({ checks: n, pages: m.urls.length, fails }, null, 1)); if (fails.length) process.exitCode = 1;
})();
