/* KYD local tools UI. Files chosen here are read in this page only: no upload, no storage. */
(function () {
  'use strict';
  const C = window.KYDCore, $ = id => document.getElementById(id);
  const make = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
  const say = (id, text) => { $(id).textContent = text; };
  const read = async f => new Uint8Array(await f.arrayBuffer());
  const list = input => Array.from(input.files || []);
  let links = [];
  const url = blob => { const u = URL.createObjectURL(blob); links.push(u); return u; };
  const release = () => { links.forEach(u => URL.revokeObjectURL(u)); links = []; };
  function save(blob, name) { const a = make('a'); const u = URL.createObjectURL(blob); a.href = u; a.download = name; a.hidden = true; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); }
  function row(cells) { const tr = make('tr'); cells.forEach(c => { const td = make('td'); if (c instanceof Node) td.append(c); else td.textContent = c; tr.append(td); }); return tr; }
  function link(blob, name, text) { const a = make('a', text || '저장'); a.href = url(blob); a.download = name; return a; }
  function dropzone(zone, input) {
    if (!zone) return;
    ['dragover', 'dragenter'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(t => zone.addEventListener(t, () => zone.classList.remove('over')));
    zone.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; input.dispatchEvent(new Event('change')); } });
  }
  async function decode(file) {
    if (/heic|heif/i.test(file.type) || C.kind(new Uint8Array(await file.slice(0, 16).arrayBuffer())) === 'heif') {
      try { return await createImageBitmap(file); } catch (e) { throw new Error('이 브라우저는 HEIC를 열지 못합니다. 아이폰 사파리에서 열거나 JPG 사본을 사용해 주세요.'); }
    }
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { throw new Error('이미지로 열 수 없는 파일입니다.'); }
  }
  function paint(source, rect, w, h) {
    // Halve repeatedly before the final draw so strong reductions stay sharp.
    let cur = document.createElement('canvas'); cur.width = Math.max(1, Math.round(rect.w)); cur.height = Math.max(1, Math.round(rect.h));
    let x = cur.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cur.width, cur.height); x.drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, cur.width, cur.height);
    while (cur.width > w * 2 && cur.height > h * 2) { const n = document.createElement('canvas'); n.width = Math.ceil(cur.width / 2); n.height = Math.ceil(cur.height / 2); const nx = n.getContext('2d'); nx.imageSmoothingQuality = 'high'; nx.drawImage(cur, 0, 0, n.width, n.height); cur = n; }
    if (cur.width === w && cur.height === h) return cur;
    const out = document.createElement('canvas'); out.width = w; out.height = h; x = out.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(cur, 0, 0, w, h); return out;
  }
  const encode = (canvas, type, q) => new Promise((ok, no) => canvas.toBlob(b => b && b.type === type ? ok(b) : no(new Error('이 브라우저에서 선택한 형식으로 저장할 수 없습니다.')), type, q));
  const rename = (name, ext, tail) => name.replace(/\.[^.]+$/, '') + (tail || '') + '.' + ext;
  const guard = (form, work) => { let busy = false; return async e => { if (e) e.preventDefault(); if (busy) return; busy = true; const b = form.querySelector('[type=submit]'); b.disabled = true; try { await work(); } finally { busy = false; b.disabled = false; } }; };

  // ---- 사진 용량 줄이기 -----------------------------------------------------
  if ($('compress-form')) {
    const form = $('compress-form'), input = $('compress-files'); let results = [];
    dropzone($('compress-drop'), input);
    const mode = () => form.elements.mode.value;
    const sync = () => { $('quality-box').hidden = mode() !== 'quality'; $('target-box').hidden = mode() !== 'target'; say('quality-value', $('compress-quality').value); };
    form.addEventListener('input', sync); sync();
    const clear = () => { release(); results = []; $('compress-result').hidden = true; $('compress-body').replaceChildren(); };
    input.addEventListener('change', () => { clear(); say('compress-status', input.files.length ? `${input.files.length}개 선택했습니다. 설정을 확인하고 줄이기를 누르세요.` : '사진을 선택해 주세요.'); });
    form.addEventListener('submit', guard(form, async () => {
      clear(); const files = list(input);
      if (!files.length) return say('compress-status', '사진을 먼저 선택해 주세요.');
      if (files.length > 50) return say('compress-status', '한 번에 50장까지 처리할 수 있습니다. 나눠서 선택해 주세요.');
      const type = $('compress-type').value, ext = type === 'image/webp' ? 'webp' : 'jpg', max = Number($('compress-max').value), target = Number($('compress-target').value) * 1000;
      if (mode() === 'target' && !(target >= 10000 && target <= 2e7)) return say('compress-status', '목표 용량은 10~20,000KB 사이로 입력해 주세요.');
      let before = 0, after = 0;
      for (let i = 0; i < files.length; i++) {
        const f = files[i]; say('compress-status', `${i + 1}/${files.length} 처리 중: ${f.name}`);
        try {
          const bmp = await decode(f), full = { x: 0, y: 0, w: bmp.width, h: bmp.height }; let size = C.fitWithin(bmp.width, bmp.height, max), blob, note = '';
          if (mode() === 'quality') { const q = Number($('compress-quality').value) / 100; blob = await encode(paint(bmp, full, size.w, size.h), type, q); note = `화질 ${Math.round(q * 100)}`; }
          else {
            let found = null;
            for (let t = 0; t < 14 && !found; t++) { const canvas = paint(bmp, full, size.w, size.h); found = await C.searchQuality(q => encode(canvas, type, q), target); if (!found) { if (Math.min(size.w, size.h) < 60) break; size = { w: Math.round(size.w * 0.85), h: Math.round(size.h * 0.85) }; } }
            if (!found) throw new Error('이 용량까지는 줄일 수 없습니다. 목표를 높여 주세요.');
            blob = found.blob; note = `화질 ${Math.round(found.quality * 100)}`;
          }
          bmp.close(); const bigger = blob.size >= f.size, name = rename(f.name, ext, '_줄임');
          const kept = bigger && mode() === 'quality';
          before += f.size; after += kept ? f.size : blob.size;
          if (!kept) results.push({ name, bytes: await read(blob) });
          $('compress-body').append(row([f.name, C.bytes(f.size), kept ? '원본이 더 작음' : C.bytes(blob.size), kept ? '-' : `${size.w}×${size.h}, ${note}`, kept ? '원본을 쓰세요' : link(blob, name)]));
        } catch (err) { $('compress-body').append(row([f.name, C.bytes(f.size), '처리 못 함', err.message, '-'])); }
        $('compress-result').hidden = false;
      }
      say('compress-status', before ? `완료: ${C.bytes(before)} → ${C.bytes(after)} (${Math.max(0, Math.round((1 - after / before) * 100))}% 감소). 원본 파일은 바뀌지 않았습니다.` : '처리한 사진이 없습니다. 표의 이유를 확인해 주세요.');
      $('compress-zip').hidden = results.length < 2;
    }));
    $('compress-zip').addEventListener('click', () => save(new Blob([C.zip(results)], { type: 'application/zip' }), 'kyd-photos.zip'));
    form.addEventListener('reset', () => setTimeout(() => { clear(); sync(); say('compress-status', '사진을 선택해 주세요.'); }, 0));
  }

  // ---- 사진 위치정보 확인·삭제 ----------------------------------------------
  if ($('location-form')) {
    const form = $('location-form'), input = $('location-files'); let results = [];
    dropzone($('location-drop'), input);
    const clear = () => { release(); results = []; $('location-result').hidden = true; $('location-list').replaceChildren(); };
    const detail = (k, v) => { const d = make('div'); d.append(make('dt', k), make('dd', v)); return d; };
    const show = async () => {
      clear(); const files = list(input); if (!files.length) return say('location-status', '사진을 선택해 주세요.');
      if (files.length > 50) return say('location-status', '한 번에 50장까지 처리할 수 있습니다.');
      let hits = 0, cleaned = 0;
      for (const f of files) {
        const card = make('article', undefined, 'photo-card'); card.append(make('h3', f.name)); $('location-list').append(card);
        try {
          const b = await read(f), info = C.inspect(b), dl = make('dl', undefined, 'facts'), located = info.gps || info.locationHint; if (located) hits++;
          const badge = make('p', located ? '위치정보 있음' : '위치정보 없음', located ? 'badge warn' : 'badge ok'); card.append(badge);
          if (info.gps) dl.append(detail('좌표', `${info.gps.lat.toFixed(5)}, ${info.gps.lon.toFixed(5)}`)); else if (located) dl.append(detail('위치', '좌표가 다른 형식이나 부가 이미지에 기록되어 있습니다'));
          if (info.exif) { if (info.exif.date) dl.append(detail('촬영 시각', info.exif.date)); const cam = [info.exif.make, info.exif.model].filter(Boolean).join(' '); if (cam) dl.append(detail('기기', cam)); if (info.exif.software) dl.append(detail('소프트웨어', info.exif.software)); }
          dl.append(detail('정보 영역', info.found.length ? info.found.map(x => `${x.name} ${C.bytes(x.bytes)}`).join(', ') : '없음'));
          if (info.trailing) dl.append(detail('덧붙은 데이터', `${C.bytes(info.trailing)} (움직이는 사진·부가 이미지일 수 있음)`));
          card.append(dl);
          if (info.found.length || info.trailing) {
            const out = C.strip(b, { keepDate: $('location-date').checked }), check = C.inspect(out);
            if (check.gps || check.locationHint || check.trailing) throw new Error('결과를 다시 확인하니 정보가 남아 있어 저장을 막았습니다.');
            const name = f.name.replace(/(\.[^.]+)?$/, '_정보삭제$1'), blob = new Blob([out], { type: f.type || 'application/octet-stream' });
            results.push({ name, bytes: out }); cleaned++;
            const p = make('p'); p.append(link(blob, name, '정보를 지운 사본 저장')); p.append(` · ${C.bytes(b.length)} → ${C.bytes(out.length)}, 재검사 통과`); card.append(p);
          } else card.append(make('p', '지울 정보가 없습니다. 이 파일을 그대로 쓰면 됩니다.'));
        } catch (err) { card.append(make('p', err.message, 'badge warn')); }
      }
      $('location-result').hidden = false; $('location-zip').hidden = results.length < 2;
      say('location-status', `${files.length}장 중 위치정보가 있는 사진 ${hits}장, 정보를 지운 사본 ${cleaned}장을 만들었습니다. 원본은 바뀌지 않았습니다.`);
    };
    form.addEventListener('submit', guard(form, show));
    input.addEventListener('change', () => { clear(); say('location-status', input.files.length ? `${input.files.length}개 선택했습니다. 확인하기를 누르세요.` : '사진을 선택해 주세요.'); });
    $('location-date').addEventListener('change', clear);
    $('location-zip').addEventListener('click', () => save(new Blob([C.zip(results)], { type: 'application/zip' }), 'kyd-clean-photos.zip'));
    form.addEventListener('reset', () => setTimeout(() => { clear(); say('location-status', '사진을 선택해 주세요.'); }, 0));
  }

  // ---- 중복 파일 찾기 -------------------------------------------------------
  if ($('dup-form')) {
    const form = $('dup-form'), input = $('dup-files'), more = $('dup-more'); let abort = null, rows = null;
    const clear = () => { rows = null; $('dup-result').hidden = true; $('dup-list').replaceChildren(); };
    const picked = () => list(input).concat(list(more));
    [input, more].forEach(i => i.addEventListener('change', () => { clear(); say('dup-status', `${picked().length.toLocaleString()}개 파일을 선택했습니다.`); }));
    form.addEventListener('submit', guard(form, async () => {
      clear(); let files = picked(); if ($('dup-photo').checked) files = files.filter(f => /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp|tiff?|dng|cr2|cr3|nef|arw|raf|orf|rw2|mp4|mov|m4v|avi|mkv|3gp)$/i.test(f.name));
      if (!files.length) return say('dup-status', '폴더나 파일을 먼저 선택해 주세요.');
      abort = new AbortController(); $('dup-stop').hidden = false;
      try {
        const r = await C.findDuplicates(files, { signal: abort.signal, progress: (d, t) => { if (d === t || d % 20 === 0) say('dup-status', `같은 크기 파일 ${t.toLocaleString()}개 중 ${d.toLocaleString()}개 비교`); } });
        rows = [['묶음', '경로', '크기(바이트)']]; r.groups.forEach((g, i) => g.forEach(f => rows.push([i + 1, f.webkitRelativePath || f.name, f.size])));
        r.groups.slice(0, 200).forEach((g, i) => { const card = make('article', undefined, 'photo-card'); card.append(make('h3', `${i + 1}. 같은 파일 ${g.length}개 · 개당 ${C.bytes(g[0].size)}`)); const ul = make('ul', undefined, 'paths'); g.forEach(f => ul.append(make('li', f.webkitRelativePath || f.name))); card.append(ul); $('dup-list').append(card); });
        $('dup-result').hidden = false; $('dup-csv').disabled = !r.groups.length;
        say('dup-status', `검사 완료: 파일 ${files.length.toLocaleString()}개 중 완전히 같은 묶음 ${r.groups.length.toLocaleString()}개, 여분 ${r.extra.toLocaleString()}개(${C.bytes(r.wasted)}).` + (r.empty ? ` 0바이트 파일 ${r.empty}개는 제외했습니다.` : '') + (r.unreadable.length ? ` 읽지 못한 파일 ${r.unreadable.length}개는 확인하지 못했습니다.` : '') + (r.groups.length > 200 ? ' 화면에는 200묶음까지 표시하고 나머지는 CSV에 담았습니다.' : ''));
      } catch (e) { say('dup-status', e.message); } finally { $('dup-stop').hidden = true; abort = null; }
    }));
    $('dup-stop').addEventListener('click', () => abort && abort.abort());
    $('dup-csv').addEventListener('click', () => rows && save(new Blob([C.csv(rows)], { type: 'text/csv;charset=utf-8' }), 'kyd-duplicates.csv'));
    form.addEventListener('reset', () => setTimeout(() => { if (abort) abort.abort(); clear(); say('dup-status', '폴더를 선택해 주세요.'); }, 0));
  }

  // ---- 폴더 비교 ------------------------------------------------------------
  if ($('folder-form')) {
    const form = $('folder-form'), a = $('folder-a'), b = $('folder-b'); let abort = null, rows = null;
    const clear = () => { rows = null; $('folder-result').hidden = true; $('folder-list').replaceChildren(); };
    [a, b].forEach(i => i.addEventListener('change', () => { clear(); say('folder-status', `원본 ${list(a).length.toLocaleString()}개, 백업 ${list(b).length.toLocaleString()}개 파일을 읽었습니다.`); }));
    form.addEventListener('submit', guard(form, async () => {
      clear(); if (!list(a).length || !list(b).length) return say('folder-status', '원본 폴더와 백업 폴더를 모두 선택해 주세요. 빈 폴더는 비교할 수 없습니다.');
      abort = new AbortController(); $('folder-stop').hidden = false; const exact = form.elements.depth.value === 'exact';
      try {
        const r = await C.compareFolders(list(a), list(b), { exact, signal: abort.signal, progress: (d, t) => { if (d === t || d % 20 === 0) say('folder-status', `${t.toLocaleString()}개 중 ${d.toLocaleString()}개 확인`); } });
        const kinds = [['missing', '백업에 없음'], ['different', '이름은 같지만 내용이 다름'], ['unreadable', '읽지 못함'], ['moved', '백업의 다른 위치에 있음']];
        rows = [['상태', '원본 경로', '크기(바이트)', '백업 위치']];
        for (const [k, label] of kinds) {
          r[k].forEach(x => rows.push([label, x.path, x.size, x.at || '']));
          const box = make('section'); box.append(make('h3', `${label} ${r[k].length.toLocaleString()}개`));
          if (r[k].length) { const ul = make('ul', undefined, 'paths'); r[k].slice(0, 100).forEach(x => ul.append(make('li', x.path + (x.at ? ' → ' + x.at : '') + ` (${C.bytes(x.size)})`))); if (r[k].length > 100) ul.append(make('li', `외 ${r[k].length - 100}개는 CSV에서 확인하세요.`)); box.append(ul); }
          $('folder-list').append(box);
        }
        r.same.forEach(x => rows.push([exact ? '내용까지 같음' : '이름과 크기가 같음', x.path, x.size, x.path]));
        $('folder-result').hidden = false;
        const bad = r.missing.length + r.different.length + r.unreadable.length;
        say('folder-status', `원본 ${r.checked.toLocaleString()}개 중 ${exact ? '내용까지 같은' : '이름과 크기가 같은'} 파일 ${r.same.length.toLocaleString()}개. ` + (bad ? `확인이 필요한 파일 ${bad.toLocaleString()}개가 있습니다.` : '빠진 파일을 찾지 못했습니다.') + ` 백업 폴더에만 있는 파일 ${r.extra.toLocaleString()}개.`);
      } catch (e) { say('folder-status', e.message); } finally { $('folder-stop').hidden = true; abort = null; }
    }));
    $('folder-stop').addEventListener('click', () => abort && abort.abort());
    $('folder-csv').addEventListener('click', () => rows && save(new Blob([C.csv(rows)], { type: 'text/csv;charset=utf-8' }), 'kyd-folder-check.csv'));
    form.addEventListener('reset', () => setTimeout(() => { if (abort) abort.abort(); clear(); say('folder-status', '두 폴더를 선택해 주세요.'); }, 0));
  }

  // ---- 증명사진 크기 맞추기 -------------------------------------------------
  if ($('id-form')) {
    const form = $('id-form'), input = $('id-file'), view = $('id-view'), x = view.getContext('2d'); let bmp = null;
    const PRESET = { passport: [413, 531], half: [354, 472], full: [591, 827] };
    dropzone($('id-drop'), input);
    const size = () => { const p = PRESET[$('id-preset').value]; return p || [Number($('id-w').value), Number($('id-h').value)]; };
    const valid = ([w, h]) => Number.isInteger(w) && Number.isInteger(h) && w >= 50 && h >= 50 && w <= 4000 && h <= 4000;
    const num = id => Number($(id).value);
    const rect = () => { const [w, h] = size(); return C.cropRect(bmp.width, bmp.height, w / h, num('id-zoom') / 100, num('id-x') / 100, num('id-y') / 100); };
    function draw() {
      $('id-custom').hidden = $('id-preset').value !== 'custom'; $('id-out').hidden = true;
      const s = size(); if (!valid(s)) return; const [w, h] = s, k = 420 / h; view.height = 420; view.width = Math.max(1, Math.round(w * k));
      x.fillStyle = '#e6eee3'; x.fillRect(0, 0, view.width, view.height); if (!bmp) return;
      const r = rect(); x.imageSmoothingQuality = 'high'; x.drawImage(bmp, r.x, r.y, r.w, r.h, 0, 0, view.width, view.height);
      say('id-info', r.w < w ? `잘라낸 영역이 ${Math.round(r.w)}×${Math.round(r.h)}픽셀이라 목표(${w}×${h})보다 작습니다. 확대되어 흐려질 수 있습니다.` : `잘라낸 영역 ${Math.round(r.w)}×${Math.round(r.h)}픽셀 → ${w}×${h}픽셀`);
      if ($('id-preset').value === 'passport' && $('id-guide').checked) {
        const min = 3.2 / 4.5 * view.height, maxH = 3.6 / 4.5 * view.height, top = (view.height - maxH) / 2 * 0.6;
        x.strokeStyle = '#d5472b'; x.setLineDash([6, 5]); x.lineWidth = 2; [top, top + min, top + maxH].forEach(y => { x.beginPath(); x.moveTo(0, y); x.lineTo(view.width, y); x.stroke(); }); x.setLineDash([]);
      }
    }
    async function load() { const f = input.files[0]; if (bmp) bmp.close(); bmp = null; if (!f) return draw(); try { bmp = await decode(f); $('id-zoom').value = 100; $('id-x').value = $('id-y').value = 50; say('id-status', `${bmp.width}×${bmp.height}픽셀 사진을 열었습니다.`); } catch (e) { say('id-status', e.message); } draw(); }
    input.addEventListener('change', load); form.addEventListener('input', e => { if (e.target !== input) draw(); });
    let drag = null;
    view.addEventListener('pointerdown', e => { if (!bmp) return; drag = { px: e.clientX, py: e.clientY, x: num('id-x'), y: num('id-y') }; view.setPointerCapture(e.pointerId); });
    view.addEventListener('pointermove', e => { if (!drag) return; const r = rect(), box = view.getBoundingClientRect(), sx = bmp.width - r.w, sy = bmp.height - r.h, clamp = v => Math.min(100, Math.max(0, v)); if (sx > 0) $('id-x').value = clamp(drag.x - (e.clientX - drag.px) / box.width * r.w / sx * 100); if (sy > 0) $('id-y').value = clamp(drag.y - (e.clientY - drag.py) / box.height * r.h / sy * 100); draw(); });
    ['pointerup', 'pointercancel'].forEach(t => view.addEventListener(t, () => { drag = null; }));
    form.addEventListener('submit', guard(form, async () => {
      if (!bmp) return say('id-status', '사진을 먼저 선택해 주세요.'); const s = size(); if (!valid(s)) return say('id-status', '가로와 세로는 50~4000픽셀 정수로 입력해 주세요.');
      const limit = $('id-kb').value.trim() === '' ? 0 : Number($('id-kb').value) * 1000; if (limit && !(limit >= 5000)) return say('id-status', '최대 용량은 5KB 이상으로 입력하거나 비워 두세요.');
      const [w, h] = s, canvas = paint(bmp, rect(), w, h); let found;
      if (limit) { found = await C.searchQuality(q => encode(canvas, 'image/jpeg', q), limit); if (!found) return say('id-status', '이 픽셀 크기로는 해당 용량까지 줄일 수 없습니다.'); } else found = { blob: await encode(canvas, 'image/jpeg', 0.95), quality: 0.95 };
      const out = C.setJpegDpi(await read(found.blob), 300), blob = new Blob([out], { type: 'image/jpeg' }); release();
      const a = $('id-link'); a.href = url(blob); a.download = `kyd-photo-${w}x${h}.jpg`; $('id-out').hidden = false; say('id-status', `${w}×${h}픽셀, 300DPI, ${C.bytes(out.length)}로 만들었습니다. 원본은 바뀌지 않았습니다.`);
    }));
    draw();
  }

  // ---- 백업 자가점검 --------------------------------------------------------
  if ($('check-form')) {
    const boxes = Array.from(document.querySelectorAll('#check-form input'));
    const render = () => { const left = boxes.filter(b => !b.checked); say('check-status', left.length ? `${boxes.length}개 중 ${boxes.length - left.length}개를 확인했습니다. 남은 일 ${left.length}개.` : '여섯 항목을 모두 직접 확인했다고 표시했습니다. 이 화면이 파일을 검사한 것은 아닙니다.'); $('check-next').replaceChildren(...left.map(b => make('li', b.dataset.next))); };
    $('check-form').addEventListener('change', render); $('check-form').addEventListener('reset', () => setTimeout(render, 0));
    $('check-save').addEventListener('click', () => save(new Blob([`사진 백업 자가점검 ${new Date().toISOString().slice(0, 10)}\r\n${$('check-status').textContent}\r\n\r\n${boxes.map(b => (b.checked ? '[확인] ' : '[남음] ') + (b.checked ? b.dataset.label : b.dataset.next)).join('\r\n')}\r\n\r\n직접 표시한 점검표이며 복구를 보장하지 않습니다.\r\n`], { type: 'text/plain;charset=utf-8' }), 'kyd-backup-check.txt'));
    render();
  }

  // ---- 저장공간 계산 --------------------------------------------------------
  if ($('plan-form')) {
    const f = $('plan-form'), ids = ['current', 'growth', 'months', 'versions', 'reserve', 'free'], n = v => v.toLocaleString('ko-KR', { maximumFractionDigits: 1 });
    const run = e => {
      if (e) e.preventDefault();
      try { const r = C.storagePlan(Object.fromEntries(ids.map(i => [i, $('plan-' + i).value]))); $('plan-result').hidden = false; say('plan-status', ''); say('plan-total', `필요한 공간 ${n(r.budget)}GB`); say('plan-formula', `(${n(r.current)} + ${n(r.growth)} × ${r.months} + ${n(r.versions)}) ÷ (1 − ${r.reserve}/100) = ${n(r.budget)}GB, 윈도우 표시로 약 ${n(r.gib)}GB(GiB)`); say('plan-gap', r.gap > 0 ? `지금 남은 공간보다 ${n(r.gap)}GB 더 필요합니다.` : `지금 남은 공간 안에 들어가며 ${n(-r.gap)}GB가 남습니다.`); say('plan-stress', `사진이 예상보다 두 배로 늘면 ${n(r.stress)}GB가 필요합니다.`); }
      catch (err) { $('plan-result').hidden = true; say('plan-status', err.message); }
    };
    f.addEventListener('submit', run); f.addEventListener('input', () => { $('plan-result').hidden = true; say('plan-status', '값이 바뀌었습니다. 다시 계산해 주세요.'); });
  }

  // ---- 두 파일 비교 ---------------------------------------------------------
  if ($('pair-form')) {
    const form = $('pair-form'), clear = () => { $('pair-result').hidden = true; };
    [$('pair-a'), $('pair-b')].forEach(i => i.addEventListener('change', () => { clear(); say('pair-status', '선택이 바뀌었습니다. 비교하기를 누르세요.'); }));
    form.addEventListener('submit', guard(form, async () => {
      clear(); const a = $('pair-a').files[0], b = $('pair-b').files[0]; if (!a || !b) return say('pair-status', '두 파일을 모두 선택해 주세요.');
      say('pair-status', '내용을 비교하는 중입니다.');
      try {
        const same = await C.sameContent(a, b); say('pair-verdict', same ? '두 파일의 내용이 완전히 같습니다' : '두 파일의 내용이 다릅니다');
        say('pair-detail', `${a.size.toLocaleString()}바이트 / ${b.size.toLocaleString()}바이트. ` + (!a.size && !b.size ? '둘 다 0바이트라 백업으로 볼 수 없습니다.' : same ? '이제 사본을 직접 열어 보이는지 확인하세요.' : a.size === b.size ? '크기는 같지만 내용이 다릅니다. 편집·회전·위치정보 변경 여부를 확인하세요.' : '크기가 다릅니다. 압축되어 전송됐거나 복사가 끝나지 않았을 수 있습니다.'));
        $('pair-result').hidden = false; say('pair-status', '비교를 마쳤습니다.');
      } catch (e) { say('pair-status', '파일을 읽지 못했습니다. 비교가 끝나지 않았습니다.'); }
    }));
    form.addEventListener('reset', () => setTimeout(() => { clear(); say('pair-status', '두 파일을 선택해 주세요.'); }, 0));
  }
})();
