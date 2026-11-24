'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const C = require('../assets/ko/core.js'), F = require('./fixtures.cjs');
const root = path.resolve(__dirname, '..'), pub = path.join(root, 'public'), origin = 'https://www.kyd.kr';
let n = 0; const ok = (v, m) => { n++; assert.ok(v, m); }, eq = (a, b, m) => { n++; assert.deepEqual(a, b, m); };

(async () => {
  // Metadata parsing and removal
  for (const le of [true, false]) {
    const j = F.jpeg({ opts: { le } }), info = C.inspect(j);
    ok(Math.abs(info.gps.lat - 37.5665) < 1e-6 && Math.abs(info.gps.lon - 126.978) < 1e-6, 'gps decode');
    eq(info.exif.orientation, 6); eq(info.exif.date, '2026:11:24 10:20:30'); eq(info.exif.make, 'KYDTest');
    for (const keepDate of [false, true]) {
      const s = C.strip(j, { keepDate }), a = C.inspect(s);
      eq(a.gps, null); eq(a.locationHint, false); eq(a.exif.orientation, 6, 'orientation kept'); eq(a.exif.make, ''); eq(a.exif.date, keepDate ? '2026:11:24 10:20:30' : '');
      const text = Buffer.from(s).toString('latin1'); for (const w of ['KYDTest', 'GPSLatitude', 'Photoshop', 'secret', 'MPF']) ok(!text.includes(w), w + ' removed'); ok(text.includes('ICC_PROFILE'), 'colour profile kept');
      const scans = b => C.jpegSegments(b).segments.filter(x => x.scan).map(x => Buffer.from(b.slice(x.start, x.end)).toString('hex')); eq(scans(s), scans(j), 'pixel data untouched');
      eq(Buffer.from(C.strip(s, { keepDate })), Buffer.from(s), 'idempotent');
    }
  }
  const south = C.inspect(F.jpeg({ opts: { latRef: 'S', lonRef: 'W', orientation: 1 } })); ok(south.gps.lat < 0 && south.gps.lon < 0, 'hemisphere');
  eq(C.inspect(C.strip(F.jpeg({ opts: { orientation: 1 } }))).exif, null, 'no EXIF when nothing to keep');
  const tail = F.jpeg({ withMeta: false, tail: Buffer.concat([Buffer.from([0xff, 0xd8]), F.exif()]) }), ti = C.inspect(tail); ok(ti.trailing > 0 && ti.locationHint && !ti.gps, 'hidden secondary image'); eq(C.inspect(C.strip(tail)).trailing, 0);
  for (const bad of [F.jpeg().slice(0, -2), F.jpeg().slice(0, 60), new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff])]) assert.throws(() => C.strip(bad)), n++;
  assert.throws(() => C.inspect(Buffer.from('not an image at all'))); n++;
  assert.throws(() => C.inspect(Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypheic0000')])), /HEIC/); n++;
  for (let i = 0; i < 400; i++) { const b = F.jpeg(); for (let k = 0; k < 6; k++) b[2 + (i * 131 + k * 977) % (b.length - 2)] ^= 1 + (i + k) % 255; try { C.strip(b); } catch (e) { ok(/손상|형식|JPEG|파일/.test(e.message), 'clean failure: ' + e.message); } }
  const png = F.png([['eXIf', F.tiffWithGps()], ['tEXt', Buffer.from('Author\0me')], ['gAMA', Buffer.from([0, 0, 0, 1])]]), ps = C.strip(png), pt = Buffer.from(ps).toString('latin1');
  ok(C.inspect(png).gps && !C.inspect(ps).gps && C.inspect(ps).exif.orientation === 6, 'png'); ok(!pt.includes('tEXt') && pt.includes('gAMA')); assert.throws(() => C.strip(png.slice(0, -4))); n++;
  const vp8x = Buffer.alloc(10); vp8x[0] = 0x2c; const wp = F.webp([['VP8X', vp8x], ['ICCP', Buffer.from('abc')], ['VP8 ', Buffer.from('pixels!')], ['EXIF', F.tiffWithGps()], ['XMP ', Buffer.from('GPSLatitude')]]), ws = C.strip(wp);
  ok(C.inspect(wp).gps && !C.inspect(ws).locationHint && C.inspect(ws).exif.orientation === 6, 'webp'); eq(ws[20], 0x28, 'flags rewritten'); eq(new DataView(ws.buffer).getUint32(4, true), ws.length - 8, 'riff size');
  const evidence = JSON.parse(fs.readFileSync(path.join(root, 'assets/evidence/photo-compress-20261124.json'))); eq(evidence.photos.length, 4); for (const p of evidence.photos) { eq(p.table.length, 24); eq(p.stripDiff, 0); eq(p.afterFound, []); }
  eq(await F.experiments(), JSON.parse(fs.readFileSync(path.join(root, 'assets/evidence/folder-duplicate-20261124.json'))), 'published experiment reproduces');

  // Files
  const stop = new AbortController(); stop.abort(); await assert.rejects(C.findDuplicates([F.file('a/1', 'xx'), F.file('a/2', 'xx')], { signal: stop.signal })); n++;
  const big = new Uint8Array(9e6).fill(7), big2 = big.slice(); big2[8999999] = 8; eq(await C.sameContent(F.file('a/b', big), F.file('a/c', big.slice())), true); eq(await C.sameContent(F.file('a/b', big), F.file('a/c', big2)), false);
  const nf = await C.compareFolders([F.file('x/가나.jpg'.normalize('NFD'), '1')], [F.file('y/가나.jpg'.normalize('NFC'), '1')], { exact: true }); eq(nf.same.length, 1, 'NFC/NFD');
  const ig = await C.compareFolders([F.file('x/Thumbs.db', '1')], [F.file('y/z', '1')]); eq(ig.checked, 0);
  const broken = { name: 'q', size: 2, webkitRelativePath: 'x/q', slice: () => ({ arrayBuffer: () => Promise.reject(new Error('io')) }) }; eq((await C.compareFolders([broken], [F.file('y/q', 'ab')])).unreadable.length, 1);
  ok(C.csv([['=cmd', 'a"b']]).includes('"\'=cmd","a""b"'), 'csv safe');
  eq(C.uniqueNames(['a.jpg', 'A.jpg', 'a.jpg', 'x']), ['a.jpg', 'A (2).jpg', 'a (3).jpg', 'x']);
  eq(C.crc32(Buffer.from('123456789')), 0xcbf43926); eq(C.crc32(Buffer.from('abc')), zlib.crc32(Buffer.from('abc')));
  const z = Buffer.from(C.zip([{ name: '가.txt', bytes: new Uint8Array([1, 2, 3]) }, { name: 'b.txt', bytes: new Uint8Array(0) }])); eq(z.readUInt32LE(0), 0x04034b50); eq(z.readUInt32LE(z.length - 22), 0x06054b50); eq(z.readUInt16LE(z.length - 12), 2); eq(z.readUInt32LE(z.readUInt32LE(z.length - 6)), 0x02014b50);

  // Sizing
  eq(C.fitWithin(4000, 3000, 2048), { w: 2048, h: 1536 }); eq(C.fitWithin(100, 50, 2048), { w: 100, h: 50 }); eq(C.fitWithin(100, 50, 0), { w: 100, h: 50 });
  const enc = async q => ({ size: Math.round(q * 1000) }), found = await C.searchQuality(enc, 700); ok(found.blob.size <= 700 && found.blob.size > 680, 'target search'); eq(await C.searchQuality(enc, 100), null); eq((await C.searchQuality(enc, 5000)).quality, 0.95);
  const r = C.cropRect(1000, 1000, 413 / 531, 2, 1, 0); ok(Math.abs(r.w / r.h - 413 / 531) < 1e-9 && r.x + r.w <= 1000.0001 && r.y === 0, 'crop');
  const d = C.setJpegDpi(F.jpeg({ withMeta: false }), 300); eq([d[13], d[14] << 8 | d[15], d[16] << 8 | d[17]], [1, 300, 300]);
  const plan = C.storagePlan({ current: 120, growth: 4, months: 12, versions: 30, reserve: 20, free: 200 }); ok(Math.abs(plan.budget - 247.5) < 1e-9 && Math.abs(plan.stress - 307.5) < 1e-9 && Math.abs(plan.gap - 47.5) < 1e-9);
  for (const bad of [{ months: 1.5 }, { current: '' }, { reserve: 60 }, { free: 'x' }]) { assert.throws(() => C.storagePlan({ current: 1, growth: 1, months: 1, versions: 1, reserve: 1, free: 1, ...bad })); n++; }

  // Built pages
  const manifest = JSON.parse(fs.readFileSync(path.join(pub, 'site-manifest.json'))), sitemap = fs.readFileSync(path.join(pub, 'sitemap.xml'), 'utf8'); eq([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), manifest.urls.map(u => origin + u));
  const titles = new Set(), descs = new Set(), read = u => fs.readFileSync(path.join(pub, u.slice(1), 'index.html'), 'utf8');
  for (const u of manifest.urls) {
    const h = read(u), t = h.match(/<title>(.*?)<\/title>/)[1], ds = h.match(/name="description" content="(.*?)"/)[1];
    ok(!titles.has(t), 'unique title ' + u); titles.add(t); ok(!descs.has(ds), 'unique description ' + u); descs.add(ds);
    ok(h.includes(`rel="canonical" href="${origin + u}"`), u); eq((h.match(/<h1/g) || []).length, 1, 'one h1 ' + u); ok(h.includes('ca-pub-7587676721583907')); ok(!h.includes('noindex')); ok(h.includes(`<html lang="${u.startsWith('/en/') ? 'en' : 'ko'}">`));
    JSON.parse(h.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1]); n++;
    ok(!/undefined|NaN|\[object/.test(h.replace(/<script[\s\S]*?<\/script>/g, '')), 'no template leak ' + u);
    const ids = [...h.matchAll(/ id="([^"]+)"/g)].map(m => m[1]); eq(ids.length, new Set(ids).size, 'duplicate id ' + u);
    for (const [, href] of h.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      const [p, frag] = href.split('#'), clean = p.split('?')[0], target = path.join(pub, clean, clean.endsWith('/') ? 'index.html' : '');
      ok(fs.existsSync(target), `${u} -> ${href}`); if (frag) ok(fs.readFileSync(target, 'utf8').includes(`id="${frag}"`), `${u} -> ${href} anchor`);
    }
    for (const [, frag] of h.matchAll(/href="#([^"]+)"/g)) ok(frag === '' || ids.includes(frag), u + '#' + frag);
    for (const [, lang, link] of h.matchAll(/hreflang="(ko|en)" href="https:\/\/www\.kyd\.kr([^"]*)"/g)) { const other = read(link); ok(other.includes(`hreflang="${u.startsWith('/en/') ? 'en' : 'ko'}" href="${origin + u}"`), `reciprocal ${u} ${lang}`); }
    if (u.startsWith('/en/')) ok(!/href="\/(guides|tools|about|methods|contact|privacy|updates|editorial-policy)\//.test(h), 'English link leaves edition ' + u);
    if (/^\/(en\/)?tools\//.test(u)) ok(!/<script(?![^>]*(src="\/|ld\+json))/.test(h) && !/ style="/.test(h), 'CSP compatible ' + u);
  }
  for (const u of manifest.guides) { const h = read(u); ok(h.includes('id="faq"') && h.includes('class="summary"') && (h.includes('확인한 출처') || h.includes('확인 방법')), u); ok(h.match(/<article[\s\S]*<\/article>/)[0].replace(/<[^>]+>/g, '').length > 1300, 'depth ' + u); }
  for (const u of manifest.tools) { const js = fs.readFileSync(path.join(root, 'assets/ko/tools.js'), 'utf8'), h = read(u); ok(/<form id="/.test(h) && js.includes(`$('${h.match(/<form id="([^"]+)/)[1]}')`), u); }
  ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie/.test(['core', 'tools'].map(f => fs.readFileSync(path.join(root, `assets/ko/${f}.js`), 'utf8')).join('')), 'tools have no network or storage');
  const red = fs.readFileSync(path.join(pub, '_redirects'), 'utf8'); for (const [a, b] of manifest.redirects) { ok(red.includes(`${a} ${b} 301`)); ok(!fs.existsSync(path.join(pub, a.slice(1), 'index.html'))); ok(fs.existsSync(path.join(pub, b.slice(1), 'index.html'))); }
  const worker = (await import('data:text/javascript;base64,' + fs.readFileSync(path.join(pub, '_worker.js')).toString('base64'))).default, env = { ASSETS: { fetch: () => new Response('asset') } };
  for (const u of ['/posts/x/', ...manifest.retired]) { const res = await worker.fetch(new Request(origin + u), env); eq(res.status, 404); ok((await res.text()).includes('noindex')); }
  eq(await (await worker.fetch(new Request(origin + '/tools/photo-compress/'), env)).text(), 'asset'); eq(await (await worker.fetch(new Request(origin + '/posts/'), env)).text(), 'asset');
  ok(fs.readFileSync(path.join(pub, 'ads.txt'), 'utf8') === 'google.com, pub-7587676721583907, DIRECT, f08c47fec0942fa0\n');
  (function same(dir) { for (const f of fs.readdirSync(path.join(pub, dir), { withFileTypes: true })) { const p = path.join(dir, f.name); if (f.isDirectory()) same(p); else { n++; assert.ok(fs.readFileSync(path.join(pub, p)).equals(fs.readFileSync(path.join(root, p))), 'mirror ' + p); } } })('');
  console.log(`PASS ${n} assertions; ${manifest.urls.length} pages; ${manifest.guides.length} guides; ${manifest.tools.length} tools`);
})().catch(e => { console.error(e); process.exitCode = 1; });
