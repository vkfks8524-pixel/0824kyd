'use strict';
// Deterministic synthetic inputs shared by the tests and the published experiments. No personal files.
const fs = require('node:fs'), path = require('node:path');
const C = require('../assets/ko/core.js');
const root = path.resolve(__dirname, '..');

function tiffWithGps({ le = true, orientation = 6, date = '2026:11:24 10:20:30', lat = [37, 33, 59.4], lon = [126, 58, 40.8], latRef = 'N', lonRef = 'E' } = {}) {
  const t = Buffer.alloc(400);
  const w16 = (o, v) => le ? t.writeUInt16LE(v, o) : t.writeUInt16BE(v, o), w32 = (o, v) => le ? t.writeUInt32LE(v, o) : t.writeUInt32BE(v, o);
  const entry = (o, tag, type, count) => { w16(o, tag); w16(o + 2, type); w32(o + 4, count); };
  t.write(le ? 'II' : 'MM', 0, 'latin1'); w16(2, 42); w32(4, 8);
  w16(8, 4);
  entry(10, 0x010f, 2, 8); w32(18, 200); t.write('KYDTest\0', 200, 'latin1');
  entry(22, 0x0112, 3, 1); w16(30, orientation);
  entry(34, 0x8769, 4, 1); w32(42, 100);
  entry(46, 0x8825, 4, 1); w32(54, 130);
  w16(100, 1); entry(102, 0x9003, 2, 20); w32(110, 220); t.write(date + '\0', 220, 'latin1');
  w16(130, 4);
  entry(132, 1, 2, 2); t.write(latRef + '\0', 140, 'latin1');
  entry(144, 2, 5, 3); w32(152, 260);
  entry(156, 3, 2, 2); t.write(lonRef + '\0', 164, 'latin1');
  entry(168, 4, 5, 3); w32(176, 300);
  lat.forEach((v, i) => { w32(260 + i * 8, Math.round(v * 100)); w32(264 + i * 8, 100); });
  lon.forEach((v, i) => { w32(300 + i * 8, Math.round(v * 100)); w32(304 + i * 8, 100); });
  return t;
}
const segment = (code, body) => { const len = body.length + 2; return Buffer.concat([Buffer.from([0xff, code, len >> 8, len & 255]), body]); };
const exif = (opts) => segment(0xe1, Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiffWithGps(opts)]));
// Structurally valid marker stream (not a decodable picture): JFIF, EXIF, XMP, IPTC, MPF, ICC, comment, two scans with stuffing and restart markers.
function jpeg({ withMeta = true, tail = Buffer.alloc(0), opts } = {}) {
  const s = n => Buffer.from(n, 'latin1'), parts = [Buffer.from([0xff, 0xd8]), segment(0xe0, Buffer.concat([s('JFIF\0'), Buffer.from([1, 1, 0, 0, 1, 0, 1, 0, 0])]))];
  if (withMeta) parts.push(exif(opts), segment(0xe1, s('http://ns.adobe.com/xap/1.0/\0<x exif:GPSLatitude="37,33.99N"/>')), segment(0xed, s('Photoshop 3.0\0city')), segment(0xe2, s('MPF\0data')), segment(0xfe, s('secret comment')));
  parts.push(segment(0xe2, s('ICC_PROFILE\x00\x01\x01profile')), segment(0xdb, Buffer.alloc(65, 3)), segment(0xda, Buffer.from([1, 1, 0, 0, 63, 0])), Buffer.from([1, 2, 0xff, 0, 3, 0xff, 0xd0, 4]), segment(0xda, Buffer.from([1, 1, 0, 0, 63, 0])), Buffer.from([9, 0xff, 0, 8]), Buffer.from([0xff, 0xd9]), tail);
  return new Uint8Array(Buffer.concat(parts));
}
function png(chunks) {
  const list = [['IHDR', Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0])], ...chunks, ['IDAT', Buffer.from([1, 2, 3])], ['IEND', Buffer.alloc(0)]], parts = [Buffer.from([0x89, 80, 78, 71, 13, 10, 26, 10])];
  for (const [type, body] of list) { const len = Buffer.alloc(4), crc = Buffer.alloc(4), tb = Buffer.concat([Buffer.from(type), body]); len.writeUInt32BE(body.length); crc.writeUInt32BE(C.crc32(tb)); parts.push(len, tb, crc); }
  return new Uint8Array(Buffer.concat(parts));
}
function webp(chunks) {
  const parts = []; for (const [type, body] of chunks) { const len = Buffer.alloc(4); len.writeUInt32LE(body.length); parts.push(Buffer.from(type), len, body); if (body.length & 1) parts.push(Buffer.alloc(1)); }
  const body = Buffer.concat([Buffer.from('WEBP'), ...parts]), len = Buffer.alloc(4); len.writeUInt32LE(body.length);
  return new Uint8Array(Buffer.concat([Buffer.from('RIFF'), len, body]));
}
const file = (p, data) => Object.assign(new File([data], p.split('/').pop()), { webkitRelativePath: p });

async function experiments() {
  const lab = n => fs.readFileSync(path.join(root, 'assets/file-copy-lab', n));
  const names = ['reference.svg', 'identical-copy.svg', 'metadata-change.svg', 'visible-change.svg', 'truncated.svg'], five = names.map(n => file('lab/' + n, lab(n)));
  const photo = jpeg(), clean = C.strip(photo);
  const dup = await C.findDuplicates([...five, file('lab/photo.jpg', photo), file('lab/photo (1).jpg', photo), file('lab/photo_정보삭제.jpg', clean), file('lab/empty-a.jpg', ''), file('lab/empty-b.jpg', '')]);
  const A = (p, s) => file('원본/' + p, s), B = (p, s) => file('백업/' + p, s);
  const source = [A('2024/여행/a.jpg', 'AAAA-1'), A('2024/여행/b.jpg', 'BBBB-2'), A('2024/가족/c.jpg', 'CCCC-3'), A('2025/d.jpg', 'DDDD-4'), A('2025/e.mp4', 'EEEE-5'), A('2025/f.jpg', 'FFFF-6')];
  const backup = [B('2024/여행/a.jpg', 'AAAA-1'), B('2024/여행/b.jpg', 'BBBB-X'), B('정리전/c.jpg', 'CCCC-3'), B('2025/d.jpg', 'DDD'), B('2025/f.jpg', 'FFFF-6'), B('옛날/z.jpg', 'ZZZZ-9')];
  const pick = r => ({ same: r.same.map(x => x.path), missing: r.missing.map(x => x.path), different: r.different.map(x => x.path), moved: r.moved.map(x => x.path + ' → ' + x.at), extra: r.extra });
  return { date: '2026-11-24', note: '합성 파일로 만든 재현 시험입니다. 실제 개인 사진 보관함을 시험한 결과가 아닙니다.', duplicate: { files: 10, groups: dup.groups.map(g => g.map(f => f.name)), extra: dup.extra, empty: dup.empty }, folder: { source: source.map(f => f.webkitRelativePath), backup: backup.map(f => f.webkitRelativePath), quick: pick(await C.compareFolders(source, backup, { exact: false })), exact: pick(await C.compareFolders(source, backup, { exact: true })) } };
}
module.exports = { tiffWithGps, jpeg, png, webp, file, exif, experiments };
if (require.main === module) experiments().then(r => { const out = path.join(root, 'assets/evidence/folder-duplicate-20261124.json'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(r, null, 1) + '\n'); console.log(JSON.stringify(r, null, 1)); });
