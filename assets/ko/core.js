/* KYD core: pure functions shared by the local tools and by scripts/test-site.cjs.
   No network, no storage. Every function takes bytes or plain objects and returns new values. */
(function (root) {
  'use strict';
  const u16 = (b, o, le) => le ? b[o] | b[o + 1] << 8 : b[o] << 8 | b[o + 1];
  const u32 = (b, o, le) => (le ? (b[o] | b[o + 1] << 8 | b[o + 2] << 16 | b[o + 3] << 24) : (b[o] << 24 | b[o + 1] << 16 | b[o + 2] << 8 | b[o + 3])) >>> 0;
  const ascii = (b, o, n) => { let s = ''; for (let i = o; i < o + n && i < b.length; i++) s += String.fromCharCode(b[i]); return s; };
  const concat = parts => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; };
  const EXIF_ID = 'Exif' + String.fromCharCode(0);

  function kind(b) {
    if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
    if (b.length > 8 && b[0] === 0x89 && ascii(b, 1, 3) === 'PNG') return 'png';
    if (b.length > 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return 'webp';
    if (b.length > 12 && ascii(b, 4, 4) === 'ftyp' && /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1|avif)/.test(ascii(b, 8, 4))) return 'heif';
    return 'unknown';
  }

  // ---- JPEG structure -------------------------------------------------------
  // Walks every marker up to the primary image's EOI, including progressive scans.
  const BROKEN = '파일 구조가 손상되었거나 잘려 있어 안전하게 처리할 수 없습니다.';
  function jpegSegments(b) {
    if (kind(b) !== 'jpeg') throw new Error('JPEG 파일이 아닙니다.');
    const segments = []; let o = 2;
    while (o < b.length - 1) {
      if (b[o] !== 0xff) throw new Error(BROKEN);
      let m = o; while (b[m + 1] === 0xff) m++;
      const code = b[m + 1]; o = m;
      if (code === 0xd9) return { segments, end: o + 2 };
      if (code >= 0xd0 && code <= 0xd7 || code === 0x01) { segments.push({ code, start: o, end: o + 2 }); o += 2; continue; }
      if (o + 4 > b.length) break;
      const len = u16(b, o + 2, false), stop = o + 2 + len;
      if (len < 2 || stop > b.length) throw new Error(BROKEN);
      if (code !== 0xda) { segments.push({ code, start: o, end: stop }); o = stop; continue; }
      let p = stop;
      while (p < b.length - 1 && !(b[p] === 0xff && b[p + 1] !== 0 && b[p + 1] !== 0xff && !(b[p + 1] >= 0xd0 && b[p + 1] <= 0xd7))) p++;
      if (p >= b.length - 1) throw new Error(BROKEN);
      segments.push({ code, start: o, end: p, scan: true }); o = p;
    }
    throw new Error(BROKEN);
  }
  function segName(b, s) {
    const id = ascii(b, s.start + 4, 40);
    if (s.code === 0xe1 && id.startsWith(EXIF_ID)) return 'EXIF';
    if (s.code === 0xe1 && id.startsWith('http://ns.adobe.com/xap')) return 'XMP';
    if (s.code === 0xe1 && id.startsWith('http://ns.adobe.com/xmp/extension')) return 'XMP 확장';
    if (s.code === 0xe2 && id.startsWith('ICC_PROFILE')) return 'ICC';
    if (s.code === 0xe2 && id.startsWith('MPF')) return 'MPF(다중 이미지)';
    if (s.code === 0xed) return 'IPTC';
    if (s.code === 0xee && id.startsWith('Adobe')) return 'Adobe';
    if (s.code === 0xe0 && id.startsWith('JFIF')) return 'JFIF';
    if (s.code === 0xfe) return '주석';
    if (s.code >= 0xe0 && s.code <= 0xef) return 'APP' + (s.code - 0xe0);
    return '';
  }
  const KEEP = ['ICC', 'JFIF', 'Adobe'];

  // ---- EXIF -----------------------------------------------------------------
  const SIZES = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  function readIfd(t, at, le) {
    const tags = new Map(); if (at <= 0 || at + 2 > t.length) return tags;
    const n = u16(t, at, le); if (n > 400) return tags;
    for (let i = 0; i < n; i++) {
      const e = at + 2 + i * 12; if (e + 12 > t.length) break;
      const tag = u16(t, e, le), type = u16(t, e + 2, le), count = u32(t, e + 4, le), size = (SIZES[type] || 0) * count;
      if (!size || size > t.length) continue;
      const p = size <= 4 ? e + 8 : u32(t, e + 8, le); if (p + size > t.length) continue;
      let value;
      if (type === 2) { value = ascii(t, p, count); const z = value.indexOf(String.fromCharCode(0)); if (z >= 0) value = value.slice(0, z); value = value.trim(); }
      else if (type === 3) value = Array.from({ length: count }, (_, k) => u16(t, p + k * 2, le));
      else if (type === 4) value = Array.from({ length: count }, (_, k) => u32(t, p + k * 4, le));
      else if (type === 5) value = Array.from({ length: count }, (_, k) => { const d = u32(t, p + k * 8 + 4, le); return d ? u32(t, p + k * 8, le) / d : NaN; });
      else value = t.subarray(p, p + size);
      tags.set(tag, value);
    }
    return tags;
  }
  function parseTiff(t) {
    const order = ascii(t, 0, 2), le = order === 'II';
    if ((!le && order !== 'MM') || u16(t, 2, le) !== 42) return null;
    const first = v => Array.isArray(v) ? v[0] : undefined, main = readIfd(t, u32(t, 4, le), le);
    const exif = readIfd(t, first(main.get(0x8769)) || 0, le), gps = readIfd(t, first(main.get(0x8825)) || 0, le);
    const out = { make: main.get(0x010f) || '', model: main.get(0x0110) || '', software: main.get(0x0131) || '', orientation: first(main.get(0x0112)) || 1, date: exif.get(0x9003) || main.get(0x0132) || '', gps: null, gpsTags: gps.size };
    const dms = (v, ref) => { if (!Array.isArray(v) || v.length < 3 || v.some(x => !Number.isFinite(x))) return null; const d = v[0] + v[1] / 60 + v[2] / 3600; return /^[SW]/i.test(ref || '') ? -d : d; };
    const lat = dms(gps.get(2), gps.get(1)), lon = dms(gps.get(4), gps.get(3));
    if (lat !== null && lon !== null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) out.gps = { lat, lon };
    return out;
  }
  const latin = b => { let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return s; };
  const hasXmpGps = b => /GPSLatitude|GPSLongitude/.test(latin(b));

  function pngChunks(b) {
    const list = []; let o = 8;
    while (o + 12 <= b.length) {
      const len = u32(b, o, false), type = ascii(b, o + 4, 4), end = o + 12 + len;
      if (end > b.length) throw new Error(BROKEN);
      list.push({ type, start: o, end }); o = end; if (type === 'IEND') break;
    }
    if (!list.length || list[list.length - 1].type !== 'IEND') throw new Error(BROKEN);
    return { list, end: o };
  }
  function webpChunks(b) {
    const list = [], stop = u32(b, 4, true) + 8; if (stop > b.length) throw new Error(BROKEN);
    let o = 12;
    while (o + 8 <= stop) {
      const len = u32(b, o + 4, true), end = o + 8 + len + (len & 1);
      if (o + 8 + len > stop) throw new Error(BROKEN);
      list.push({ type: ascii(b, o, 4), start: o, end: Math.min(end, stop) }); o = end;
    }
    return { list, end: stop };
  }
  const PNG_META = ['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME'];

  // Multi-picture JPEGs can hide a second EXIF block after the primary image.
  function tailHasGps(t) {
    for (let i = 0; i + 14 < t.length; i++) if (t[i] === 0xff && t[i + 1] === 0xe1 && ascii(t, i + 4, 5) === EXIF_ID) {
      const e = parseTiff(t.subarray(i + 10, i + 2 + u16(t, i + 2, false))); if (e && e.gpsTags > 0) return true;
    }
    return false;
  }
  // Describes the privacy-relevant information found in one image.
  function inspect(b) {
    const type = kind(b), r = { type, exif: null, gps: null, found: [], trailing: 0, locationHint: false };
    if (type === 'jpeg') {
      const { segments, end } = jpegSegments(b);
      for (const s of segments) {
        const name = segName(b, s); if (!name || KEEP.includes(name)) continue;
        r.found.push({ name, bytes: s.end - s.start });
        if (name === 'EXIF' && !r.exif) r.exif = parseTiff(b.subarray(s.start + 10, s.end));
        if (name.startsWith('XMP') && hasXmpGps(b.subarray(s.start, s.end))) r.locationHint = true;
      }
      r.trailing = b.length - end;
      if (r.trailing && tailHasGps(b.subarray(end))) r.locationHint = true;
    } else if (type === 'png') {
      const { list, end } = pngChunks(b);
      for (const c of list) if (PNG_META.includes(c.type)) {
        r.found.push({ name: c.type, bytes: c.end - c.start });
        if (c.type === 'eXIf') r.exif = parseTiff(b.subarray(c.start + 8, c.end - 4));
        if (c.type === 'iTXt' && hasXmpGps(b.subarray(c.start, c.end))) r.locationHint = true;
      }
      r.trailing = b.length - end;
    } else if (type === 'webp') {
      const { list, end } = webpChunks(b);
      for (const c of list) if (c.type === 'EXIF' || c.type === 'XMP ') {
        r.found.push({ name: c.type.trim(), bytes: c.end - c.start });
        if (c.type === 'EXIF') { const t = b.subarray(c.start + 8, c.end); r.exif = parseTiff(ascii(t, 0, 4) === 'Exif' ? t.subarray(6) : t); }
        else if (hasXmpGps(b.subarray(c.start, c.end))) r.locationHint = true;
      }
      r.trailing = b.length - end;
    } else throw new Error(type === 'heif' ? 'HEIC·AVIF 파일은 아직 지원하지 않습니다. JPG로 저장한 사본을 선택해 주세요.' : 'JPG, PNG, WebP 파일만 처리할 수 있습니다.');
    if (r.exif && r.exif.gps) r.gps = r.exif.gps;
    if (r.exif && r.exif.gpsTags) r.locationHint = true;
    return r;
  }

  // Minimal EXIF: orientation (so the picture does not rotate) and, if asked, the capture date.
  function minimalExif(orientation, date) {
    const keepDate = /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(date || '');
    const entries = keepDate ? 2 : 1, base = 8 + 2 + entries * 12 + 4, t = new Uint8Array(keepDate ? base + 18 + 20 : base);
    const p16 = (o, v) => { t[o] = v >> 8; t[o + 1] = v & 255; }, p32 = (o, v) => { p16(o, v >>> 16); p16(o + 2, v & 65535); };
    t[0] = t[1] = 0x4d; p16(2, 42); p32(4, 8); p16(8, entries);
    p16(10, 0x0112); p16(12, 3); p32(14, 1); p16(18, orientation);
    if (keepDate) {
      p16(22, 0x8769); p16(24, 4); p32(26, 1); p32(30, base);
      p16(base, 1); p16(base + 2, 0x9003); p16(base + 4, 2); p32(base + 6, 20); p32(base + 10, base + 18);
      for (let i = 0; i < 19; i++) t[base + 18 + i] = date.charCodeAt(i);
    }
    return t;
  }
  const be32 = v => new Uint8Array([v >>> 24, v >>> 16 & 255, v >>> 8 & 255, v & 255]);
  const le32 = v => new Uint8Array([v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24]);

  // Removes metadata without re-encoding pixels. Returns new bytes.
  function strip(b, options = {}) {
    const info = inspect(b), orientation = info.exif ? info.exif.orientation : 1, date = options.keepDate && info.exif ? info.exif.date : '';
    const tiff = orientation > 1 && orientation < 9 || date ? minimalExif(orientation >= 1 && orientation < 9 ? orientation : 1, date) : null;
    if (info.type === 'jpeg') {
      const { segments, end } = jpegSegments(b), parts = [b.subarray(0, 2)];
      let pending = tiff;
      for (const s of segments) {
        const name = segName(b, s);
        if (pending && name !== 'JFIF') { const len = pending.length + 8; parts.push(new Uint8Array([0xff, 0xe1, len >> 8, len & 255, 69, 120, 105, 102, 0, 0]), pending); pending = null; }
        if (!name || KEEP.includes(name)) parts.push(b.subarray(s.start, s.end));
      }
      parts.push(b.subarray(end - 2, end));
      return concat(parts);
    }
    if (info.type === 'png') {
      const parts = [b.subarray(0, 8)];
      for (const c of pngChunks(b).list) {
        if (PNG_META.includes(c.type)) continue;
        parts.push(b.subarray(c.start, c.end));
        if (c.type === 'IHDR' && tiff) { const body = concat([new Uint8Array([101, 88, 73, 102]), tiff]); parts.push(be32(tiff.length), body, be32(crc32(body))); }
      }
      return concat(parts);
    }
    const parts = []; let vp8x = null;
    for (const c of webpChunks(b).list) {
      if (c.type === 'EXIF' || c.type === 'XMP ') continue;
      const chunk = b.slice(c.start, c.end);
      if (c.type === 'VP8X') { chunk[8] &= 0xf3; vp8x = chunk; }
      parts.push(chunk);
    }
    if (tiff && vp8x) { vp8x[8] |= 0x08; parts.push(new Uint8Array([69, 88, 73, 70]), le32(tiff.length), tiff); if (tiff.length & 1) parts.push(new Uint8Array(1)); }
    const body = concat(parts);
    return concat([b.slice(0, 4), le32(body.length + 4), b.slice(8, 12), body]);
  }

  // Sets JFIF density so print software reads the intended DPI. Pixels are untouched.
  function setJpegDpi(b, dpi) {
    const out = b.slice();
    if (out[2] === 0xff && out[3] === 0xe0 && ascii(out, 6, 4) === 'JFIF') { out[13] = 1; out[14] = out[16] = dpi >> 8; out[15] = out[17] = dpi & 255; }
    return out;
  }

  // ---- ZIP (stored, no compression: photos are already compressed) ----------
  let table = null;
  function crc32(b) {
    if (!table) { table = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1; table[n] = c >>> 0; } }
    let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = table[(c ^ b[i]) & 255] ^ c >>> 8; return (c ^ 0xffffffff) >>> 0;
  }
  function uniqueNames(names) {
    const used = new Set();
    return names.map(name => {
      const dot = name.lastIndexOf('.'), stem = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : '';
      let out = name, n = 2; while (used.has(out.toLowerCase())) out = `${stem} (${n++})${ext}`;
      used.add(out.toLowerCase()); return out;
    });
  }
  function zip(files) {
    const enc = new TextEncoder(), names = uniqueNames(files.map(f => f.name)), parts = [], central = []; let offset = 0;
    files.forEach((f, i) => {
      const name = enc.encode(names[i]), crc = crc32(f.bytes), h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, f.bytes.length, true); h.setUint32(22, f.bytes.length, true); h.setUint16(26, name.length, true);
      parts.push(new Uint8Array(h.buffer), name, f.bytes);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true); c.setUint32(20, f.bytes.length, true); c.setUint32(24, f.bytes.length, true); c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name); offset += 30 + name.length + f.bytes.length;
    });
    const dir = concat(central), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, dir.length, true); e.setUint32(16, offset, true);
    return concat([...parts, dir, new Uint8Array(e.buffer)]);
  }

  // ---- Comparing files ------------------------------------------------------
  const CHUNK = 4 * 1024 * 1024;
  const slice = async (file, from, to) => new Uint8Array(await file.slice(from, to).arrayBuffer());
  async function sameContent(a, b, signal) {
    if (a.size !== b.size) return false;
    for (let o = 0; o < a.size; o += CHUNK) {
      if (signal && signal.aborted) throw new Error('중단했습니다.');
      const [x, y] = await Promise.all([slice(a, o, o + CHUNK), slice(b, o, o + CHUNK)]);
      if (x.length !== y.length) return false;
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
    }
    return true;
  }
  const groupBySize = files => { const m = new Map(); for (const f of files) { if (!m.has(f.size)) m.set(f.size, []); m.get(f.size).push(f); } return m; };
  // Exact duplicates only: same size, then every byte compared against a representative.
  async function findDuplicates(files, { signal, progress } = {}) {
    const real = files.filter(f => f.size > 0), todo = [...groupBySize(real).values()].filter(l => l.length > 1), total = todo.reduce((n, l) => n + l.length, 0);
    const groups = [], unreadable = []; let done = 0;
    for (const list of todo) {
      const classes = [];
      for (const f of list) {
        try { let home = null; for (const c of classes) if (await sameContent(c[0], f, signal)) { home = c; break; } if (home) home.push(f); else classes.push([f]); }
        catch (e) { if (signal && signal.aborted) throw e; unreadable.push(f); }
        if (progress) progress(++done, total);
      }
      for (const c of classes) if (c.length > 1) groups.push(c);
    }
    groups.sort((x, y) => y[0].size * (y.length - 1) - x[0].size * (x.length - 1));
    return { groups, empty: files.length - real.length, unreadable, wasted: groups.reduce((n, g) => n + g[0].size * (g.length - 1), 0), extra: groups.reduce((n, g) => n + g.length - 1, 0) };
  }
  const relative = f => { const p = f.webkitRelativePath || f.name, i = p.indexOf('/'); return i < 0 ? p : p.slice(i + 1); };
  const ignorable = p => /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini|\._[^/]*)$/i.test(p);
  async function compareFolders(source, backup, { exact = true, signal, progress } = {}) {
    const key = f => relative(f).normalize('NFC'), src = source.filter(f => !ignorable(relative(f))), dst = backup.filter(f => !ignorable(relative(f)));
    const at = new Map(dst.map(f => [key(f), f])), bySize = groupBySize(dst), seen = new Set();
    const r = { same: [], missing: [], different: [], moved: [], unreadable: [], extra: 0, checked: src.length, exact }; let done = 0;
    for (const f of src) {
      const path = key(f), other = at.get(path);
      try {
        if (other) { seen.add(path); const ok = f.size === other.size && (!exact || await sameContent(f, other, signal)); (ok ? r.same : r.different).push({ path, size: f.size, other: other.size }); }
        else {
          let hit = null; if (exact && f.size) for (const c of bySize.get(f.size) || []) if (await sameContent(f, c, signal)) { hit = c; break; }
          if (hit) r.moved.push({ path, size: f.size, at: key(hit) }); else r.missing.push({ path, size: f.size });
        }
      } catch (e) { if (signal && signal.aborted) throw e; r.unreadable.push({ path, size: f.size }); }
      if (progress) progress(++done, src.length);
    }
    r.extra = dst.filter(f => !seen.has(key(f))).length;
    return r;
  }
  // Spreadsheet-safe CSV: quotes escaped and leading formula characters neutralised.
  const csv = rows => String.fromCharCode(0xfeff) + rows.map(row => row.map(v => { let s = String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }).join(',')).join('\r\n') + '\r\n';

  // ---- Image sizing ---------------------------------------------------------
  function fitWithin(w, h, max) { if (!max || Math.max(w, h) <= max) return { w, h }; const k = max / Math.max(w, h); return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) }; }
  // encode(quality) resolves to a blob. Returns the best result at or under the target, else null.
  async function searchQuality(encode, targetBytes, lo = 0.4, hi = 0.95, steps = 7) {
    const top = await encode(hi); if (top.size <= targetBytes) return { blob: top, quality: hi };
    const bottom = await encode(lo); if (bottom.size > targetBytes) return null;
    let best = { blob: bottom, quality: lo };
    for (let i = 0; i < steps; i++) { const q = (lo + hi) / 2, blob = await encode(q); if (blob.size <= targetBytes) { best = { blob, quality: q }; lo = q; } else hi = q; }
    return best;
  }
  function cropRect(iw, ih, ratio, zoom, cx, cy) {
    let w = iw, h = iw / ratio; if (h > ih) { h = ih; w = ih * ratio; }
    w /= zoom; h /= zoom;
    return { x: (iw - w) * cx, y: (ih - h) * cy, w, h };
  }
  const bytes = n => n < 1000 ? n + 'B' : n < 1e6 ? (n / 1e3).toFixed(n < 1e5 ? 1 : 0) + 'KB' : n < 1e9 ? (n / 1e6).toFixed(n < 1e8 ? 2 : 0) + 'MB' : (n / 1e9).toFixed(2) + 'GB';

  function storagePlan(v) {
    const limits = { current: [0, 1e6], growth: [0, 1e5], months: [1, 120], versions: [0, 1e6], reserve: [0, 50], free: [0, 1e7] }, n = {};
    for (const k in limits) {
      const raw = String(v[k] === undefined || v[k] === null ? '' : v[k]).trim(), x = Number(raw);
      if (raw === '' || !Number.isFinite(x) || x < limits[k][0] || x > limits[k][1] || k === 'months' && !Number.isInteger(x)) throw new Error('입력값을 확인해 주세요. 빈칸이거나 허용 범위를 벗어난 값이 있습니다.');
      n[k] = x;
    }
    const total = g => (n.current + g * n.months + n.versions) / (1 - n.reserve / 100), budget = total(n.growth);
    return Object.assign({}, n, { budget, gap: budget - n.free, stress: total(n.growth * 2), gib: budget * 1e9 / 1073741824 });
  }

  const api = { kind, jpegSegments, parseTiff, inspect, strip, minimalExif, setJpegDpi, crc32, zip, uniqueNames, sameContent, findDuplicates, compareFolders, relative, csv, fitWithin, searchQuality, cropRect, bytes, storagePlan, concat };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KYDCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
