'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
require('./build-copy-fixtures.cjs').build();
const { guides, sources } = require('./ko-guides.cjs'), faq = require('./ko-faq.cjs'), { tools, trust } = require('./ko-pages.cjs');
const root = path.resolve(__dirname, '..'), origin = 'https://www.kyd.kr', DATE = '2026-11-24', DATE_KO = '2026년 11월 24일';
// Set to a public contact address once the owner provides one.
const CONTACT_EMAIL = '';
const esc = v => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = v => JSON.stringify(v).replaceAll('<', '\\u003c');
const hash = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex').slice(0, 12);
const asset = f => `/${f}?v=${hash(f)}`;
const pages = new Map();
const guideUrl = s => `/guides/${s}/`, toolUrl = s => `/tools/${s}/`, guideOf = s => guides.find(g => g.slug === s), toolOf = s => tools.find(t => t.slug === s);
for (const t of tools) for (const s of t.guide) if (!guideOf(s)) throw new Error('missing guide ' + s);
for (const g of guides) { if (!toolOf(g.tool)) throw new Error('missing tool ' + g.tool); if (!faq[g.slug]) throw new Error('missing faq ' + g.slug); }

// Korean <-> English equivalents that cover the same task.
const PAIRS = { '/': '/en/', '/guides/': '/en/guides/', '/tools/': '/en/tools/', '/about/': '/en/about/', '/methods/': '/en/methods/', '/contact/': '/en/contact/', '/privacy/': '/en/privacy/', '/editorial-policy/': '/en/editorial-policy/', '/updates/': '/en/updates/', '/tools/file-copy-check/': '/en/tools/file-copy-check/', '/tools/storage-planner/': '/en/tools/storage-planner/', '/tools/photo-backup-check/': '/en/tools/photo-backup-check/', '/guides/photo-sync-vs-backup/': '/en/guides/before-deleting-photos/', '/guides/verify-copied-photo/': '/en/guides/verify-a-file-copy/', '/guides/backup-space-plan/': '/en/guides/plan-photo-backup-space/', '/guides/photo-recovery-drill/': '/en/guides/photo-recovery-drill/', '/guides/google-takeout-photo-dates/': '/en/guides/google-photos-takeout-json-dates/', '/guides/live-photo-backup/': '/en/guides/back-up-live-photos/' };
const REVERSE = Object.fromEntries(Object.entries(PAIRS).map(([k, v]) => [v, k]));
const alternates = url => { const ko = REVERSE[url] || url, en = PAIRS[ko]; return en ? `<link rel="alternate" hreflang="ko" href="${origin + ko}"><link rel="alternate" hreflang="en" href="${origin + en}"><link rel="alternate" hreflang="x-default" href="${origin + ko}">` : ''; };

const NAV = [['/tools/', '무료 도구', 'tools'], ['/guides/', '가이드', 'guides'], ['/methods/', '실험 자료', 'methods'], ['/about/', '소개', 'about']];
const header = section => `<a class="skip-link" href="#main-content">본문 바로가기</a><header class="site-header"><div class="wrap header-row"><a class="brand" href="/" aria-label="KYD 홈"><span class="brand-mark">KYD</span><span><span class="brand-name">사진·파일 관리 도구</span><span class="brand-sub">업로드 없이 내 브라우저에서</span></span></a><nav class="main-nav" aria-label="주 메뉴">${NAV.map(n => `<a href="${n[0]}"${n[2] === section ? ' aria-current="page"' : ''}>${n[1]}</a>`).join('')}</nav></div></header>`;
const footer = url => `<footer class="site-footer"><div class="wrap"><div class="footer-row"><div><strong>KYD · 사진과 파일을 안전하게</strong><p class="footer-tagline">줄이고, 지우고, 비교하고, 보관하세요.</p></div><nav class="footer-links" aria-label="하단 메뉴"><a href="/about/">소개</a><a href="/contact/">문의</a><a href="/privacy/">개인정보 처리 안내</a><a href="/terms/">이용 안내</a><a href="/editorial-policy/">운영 원칙</a><a href="/updates/">변경 기록</a><a href="/rss.xml">RSS</a><a href="${PAIRS[url] || '/en/'}" lang="en" hreflang="en">English</a></nav></div><p class="micro">© 2026 KYD. Apple, Google, 외교부 등 본문에 나오는 기관·회사와 관련이 없습니다.</p></div></footer>`;

function page(url, { title, description, body, section = '', schema = [], scripts = '', noindex = false, article = null }) {
  const graph = [{ '@type': article ? 'Article' : 'WebPage', name: title, headline: title, description, url: origin + url, inLanguage: 'ko', ...(article ? { datePublished: article, dateModified: article, author: { '@type': 'Organization', name: 'KYD', url: origin + '/about/' }, publisher: { '@type': 'Organization', name: 'KYD', url: origin + '/' }, mainEntityOfPage: origin + url } : {}) }, ...schema];
  const html = `<!doctype html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | KYD</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">${noindex ? '' : `<link rel="canonical" href="${origin + url}">${alternates(url)}`}<meta name="google-adsense-account" content="ca-pub-7587676721583907">${url === '/' ? '<meta name="naver-site-verification" content="eb364159212d145f765c1e6e519e267074bedf03">' : ''}<meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:site_name" content="KYD"><meta property="og:locale" content="ko_KR"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin + url}"><meta property="og:image" content="${origin}/assets/editorial/phone-storage-photo-1200.webp"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="alternate" type="application/rss+xml" title="KYD 가이드" href="${origin}/rss.xml"><link rel="stylesheet" href="${asset('assets/focus.css')}"><link rel="stylesheet" href="${asset('assets/ko/ko.css')}"><script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>${scripts}</head><body class="ko">${header(section)}<main id="main-content" class="wrap">${body}</main>${footer(url)}</body></html>
`;
  pages.set(url === '/404.html' ? '404.html' : url.slice(1) + 'index.html', { url, html, title, description, noindex, article, date: DATE, lang: 'ko' });
}
const crumbSchema = items => ({ '@type': 'BreadcrumbList', itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: origin + x[1] })) });
const head = (crumbs, tag, title, lead) => `<div class="page-head"><nav class="crumbs" aria-label="현재 위치">${crumbs.map(c => `<a href="${c[1]}">${c[0]}</a>`).join(' / ')}</nav><p class="eyebrow">${tag}</p><h1>${title}</h1><p class="lead">${lead}</p></div>`;
const toolCards = list => `<div class="cards">${list.map(t => `<article class="card"><span class="tool-icon" aria-hidden="true">${t.icon}</span><p class="eyebrow">${t.group}</p><h3><a href="${toolUrl(t.slug)}">${t.name}</a></h3><p>${t.short}</p></article>`).join('')}</div>`;
const guideList = list => `<div class="guide-list">${list.map(g => `<a class="guide-link" href="${guideUrl(g.slug)}"><span class="eyebrow">${g.tag}</span><h3>${g.title}</h3><p>${g.description}</p><p class="micro">${g.minutes}분 읽기 · ${DATE_KO} 확인</p></a>`).join('')}</div>`;

page('/', { title: '사진 용량 줄이기·위치정보 삭제·백업 확인 도구', description: '사진을 서버에 올리지 않고 브라우저에서 용량 줄이기, 위치정보 삭제, 중복 찾기, 백업 폴더 비교를 할 수 있는 무료 도구와 직접 측정한 가이드.', schema: [{ '@type': 'WebSite', name: 'KYD', url: origin + '/', inLanguage: 'ko' }], body: `
<section class="hero ko-hero"><div><p class="eyebrow">업로드 없는 사진·파일 도구</p><h1>소중한 사진,<br>내 기기 안에서<br>안전하게 정리하세요.</h1><p class="lead">용량을 줄이고, 위치정보를 지우고, 백업에서 빠진 파일을 찾습니다. 파일은 브라우저 밖으로 나가지 않습니다.</p><div class="actions"><a class="button" href="/tools/photo-compress/">사진 용량 줄이기</a><a class="button secondary" href="/tools/photo-location/">위치정보 확인하기</a></div><p class="micro">무료 · 회원 가입 없음 · 설치 없음</p></div><div class="hero-visual"><figure class="photo"><img src="/assets/editorial/phone-storage-photo-1200.webp" srcset="/assets/editorial/phone-storage-photo-480.webp 480w, /assets/editorial/phone-storage-photo-1200.webp 1200w" sizes="(max-width:720px) 90vw, 480px" width="1200" height="800" alt="휴대폰으로 사진을 보는 사람"><figcaption>참고 사진: Plann / <a href="https://www.pexels.com/photo/person-holding-smartphone-4549416/" rel="noopener noreferrer">Pexels</a></figcaption></figure></div></section>
<section class="section"><div class="section-heading"><div><p class="eyebrow">바로 쓰는 도구</p><h2>무엇을 하고 싶으세요?</h2></div><p>모든 도구는 원본을 바꾸거나 지우지 않습니다.</p></div>${toolCards(tools)}</section>
<section class="feature-band"><div><p class="eyebrow">직접 측정했습니다</p><h2>화질 95로 다시 저장했더니 4장 중 3장이 커졌습니다.</h2><p>사진 4장을 96가지 결과로 저장해 비교했습니다. 같은 사진에서 정보만 지웠을 때 달라진 픽셀은 0개였습니다.</p><a href="/guides/photo-size-quality-test/">측정 결과 보기</a></div><ol class="evidence-list"><li><strong>원자료를 공개합니다.</strong> 바이트 수와 조건을 그대로 내려받을 수 있습니다.</li><li><strong>공식 안내를 확인합니다.</strong> Apple, Google, 외교부 문서와 확인 날짜를 적습니다.</li><li><strong>한계를 적습니다.</strong> 도구가 확인하지 못하는 것을 함께 알려 드립니다.</li></ol></section>
<section class="section"><div class="section-heading"><div><p class="eyebrow">가이드</p><h2>지우기 전에, 보내기 전에</h2></div><p>실수하면 되돌리기 어려운 일부터 정리했습니다.</p></div>${guideList(guides.slice(0, 8))}<p><a href="/guides/">가이드 ${guides.length}편 모두 보기</a></p></section>` });

const GROUPS = [['사진 줄이기와 제출', ['photo-size-quality-test', 'heic-to-jpg', 'passport-photo-file']], ['개인정보와 정리', ['remove-photo-location', 'exact-duplicate-photos', 'google-takeout-photo-dates']], ['백업과 복구', ['photo-sync-vs-backup', 'check-missing-backup-files', 'verify-copied-photo', 'live-photo-backup', 'backup-space-plan', 'photo-recovery-drill']]];
if (GROUPS.flatMap(g => g[1]).length !== guides.length) throw new Error('guide groups incomplete');
page('/guides/', { title: '사진·파일 관리 가이드', section: 'guides', description: '사진 용량, 위치정보, 중복, 백업, 여권사진까지 직접 측정하고 공식 안내를 확인한 한국어 가이드 모음입니다.', body: head([['홈', '/']], '가이드', '사진·파일 관리 가이드', '글마다 바로 확인할 수 있는 도구가 연결되어 있습니다.') + GROUPS.map(g => `<section class="section"><h2>${g[0]}</h2>${guideList(g[1].map(guideOf))}</section>`).join('') });

for (const g of guides) {
  const url = guideUrl(g.slug), t = toolOf(g.tool), related = guides.filter(x => x !== g && (x.tool === g.tool || GROUPS.find(k => k[1].includes(g.slug))[1].includes(x.slug))).slice(0, 3), qs = faq[g.slug];
  const toc = [...g.body.map(b => [b[0], b[1]]), ['faq', '자주 묻는 질문']];
  page(url, { title: g.title, description: g.description, section: 'guides', article: DATE, schema: [crumbSchema([['홈', '/'], ['가이드', '/guides/'], [g.title, url]])], body: head([['홈', '/'], ['가이드', '/guides/']], g.tag, g.title, g.description) + `<p class="meta">작성·확인 <time datetime="${DATE}">${DATE_KO}</time> · KYD · ${g.minutes}분 읽기</p><aside class="summary"><strong>핵심 요약</strong><ul>${g.summary.map(s => `<li>${s}</li>`).join('')}</ul></aside><div class="reading-layout"><nav class="toc" aria-label="목차"><strong>목차</strong><ol>${toc.map(x => `<li><a href="#${x[0]}">${x[1]}</a></li>`).join('')}</ol></nav><article class="prose">${g.body.map(b => `<section id="${b[0]}"><h2>${b[1]}</h2>${b[2]}</section>`).join('')}<section id="faq"><h2>자주 묻는 질문</h2>${qs.map(q => `<h3>${q[0]}</h3><p>${q[1]}</p>`).join('')}</section><aside class="tool-callout"><p class="eyebrow">바로 확인하기</p><h2><a href="${toolUrl(t.slug)}">${t.name}</a></h2><p>${t.short}</p></aside>${g.sources.length ? `<section class="sources"><h2>확인한 출처</h2><p>${DATE_KO}에 아래 문서를 읽고 정리했습니다. 앱과 신청 화면은 이후 바뀔 수 있습니다.</p><ul>${g.sources.map(s => `<li><a href="${esc(sources[s][1])}" rel="noopener noreferrer">${sources[s][0]}</a></li>`).join('')}</ul></section>` : `<section class="sources"><h2>확인 방법</h2><p>공개한 시험 파일과 코드로 확인했습니다. <a href="/methods/">실험과 검증 방법</a>에서 자료와 한계를 볼 수 있습니다.</p></section>`}<section><h2>이어서 읽기</h2><ul>${related.map(r => `<li><a href="${guideUrl(r.slug)}">${r.title}</a></li>`).join('')}</ul></section><p class="micro">KYD가 작성했습니다. <a href="/editorial-policy/">운영 원칙</a> · <a href="/contact/">정정 요청</a></p></article></div>` });
}

page('/tools/', { title: '무료 사진·파일 도구 모음', section: 'tools', description: '사진 용량 줄이기, 위치정보 삭제, 중복 찾기, 폴더 비교, 증명사진 크기 등 업로드와 설치 없이 쓰는 무료 도구 8가지입니다.', body: head([['홈', '/']], '무료 도구', '사진·파일 도구', '파일을 서버로 보내지 않고 브라우저 안에서 처리합니다.') + toolCards(tools) + `<section class="prose section"><h2>업로드하지 않는다는 뜻</h2><p>도구를 실행하면 선택한 파일을 브라우저가 읽어 화면 안에서 계산합니다. 도구 페이지에는 외부 연결을 막는 보안 정책이 있어 페이지의 코드가 파일을 다른 곳으로 보낼 수 없습니다. 페이지를 연 뒤 인터넷을 끊어도 대부분의 기능이 작동합니다.</p><h2>어떤 도구부터 써야 할까요</h2><ul><li>사진을 제출하거나 보내야 할 때: <a href="/tools/photo-compress/">용량 줄이기</a>, <a href="/tools/id-photo/">증명사진 크기</a></li><li>사진을 공개해야 할 때: <a href="/tools/photo-location/">위치정보 확인</a></li><li>휴대폰이나 PC를 비우고 싶을 때: <a href="/tools/photo-backup-check/">백업 자가점검</a>, <a href="/tools/folder-compare/">폴더 비교</a></li><li>저장공간이 부족할 때: <a href="/tools/duplicate-finder/">중복 찾기</a>, <a href="/tools/storage-planner/">용량 계산</a></li></ul></section>` });
for (const t of tools) {
  const url = toolUrl(t.slug);
  page(url, { title: t.title, description: t.description, section: 'tools', scripts: `<script defer src="${asset('assets/ko/core.js')}"></script><script defer src="${asset('assets/ko/tools.js')}"></script>`, schema: [{ '@type': 'WebApplication', name: t.title, url: origin + url, description: t.description, applicationCategory: 'UtilitiesApplication', operatingSystem: '최신 브라우저', inLanguage: 'ko', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' } }, crumbSchema([['홈', '/'], ['무료 도구', '/tools/'], [t.name, url]])], body: head([['홈', '/'], ['무료 도구', '/tools/']], t.group, t.name, t.short) + `<noscript><p class="notice">이 도구를 쓰려면 자바스크립트를 켜야 합니다.</p></noscript><section class="tool-panel" aria-label="${t.name}">${t.ui}</section><p class="privacy-line">선택한 파일은 이 화면 안에서만 읽으며 서버로 전송되지 않습니다.</p><article class="prose tool-doc">${t.body}<h2>함께 읽기</h2><ul>${t.guide.map(s => `<li><a href="${guideUrl(s)}">${guideOf(s).title}</a></li>`).join('')}</ul></article>` });
}
for (const [url, title, description, body] of trust) page(url, { title, description, section: url === '/methods/' ? 'methods' : url === '/about/' ? 'about' : '', body: `<article class="text-page prose"><p class="eyebrow">KYD</p><h1>${title}</h1><p class="lead">${description}</p>${body.replace('<!--CONTACT_EMAIL-->', CONTACT_EMAIL ? `<p>이메일: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>` : '')}</article>` });
page('/404.html', { title: '페이지를 찾을 수 없습니다', description: '주소가 바뀌었거나 공개하지 않는 페이지입니다.', noindex: true, body: `<article class="text-page"><p class="eyebrow">404</p><h1>페이지를 찾을 수 없습니다</h1><p class="lead">주소가 바뀌었거나 공개하지 않는 페이지입니다.</p><p><a href="/tools/">무료 도구</a>나 <a href="/guides/">가이드</a>에서 찾아보세요. 사이트 안의 링크가 잘못됐다면 <a href="/contact/">알려 주세요</a>.</p></article>` });

// ---- English edition: preserved content, moved under /en/ -------------------
const EN = path.join(root, 'content/en'), SECTIONS = '(?:guides|tools|methods|about|editorial-policy|contact|privacy|updates)';
const enFiles = []; (function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) f.isDirectory() ? walk(path.join(d, f.name)) : f.name === 'index.html' && enFiles.push(path.relative(EN, path.join(d, f.name)).replaceAll('\\', '/')); })(EN);
for (const file of enFiles.sort()) {
  const old = '/' + file.replace(/index\.html$/, ''), url = '/en' + old;
  let h = fs.readFileSync(path.join(EN, file), 'utf8');
  h = h.replace(new RegExp(`href="/(${SECTIONS}/)`, 'g'), 'href="/en/$1').replace(/href="\/"/g, 'href="/en/"').replace(new RegExp(`${origin.replaceAll('.', '\\.')}/(${SECTIONS}/)`, 'g'), `${origin}/en/$1`).replaceAll(`"${origin}/"`, `"${origin}/en/"`)
    .replace(/<link rel="alternate" type="application\/rss\+xml"[^>]*>/, '').replace('<a href="/rss.xml">RSS</a>', '<a href="/" lang="ko" hreflang="ko">한국어</a>').replace(/<meta name="naver-site-verification"[^>]*>/, '')
    .replace(/\/assets\/(focus\.css|focus-tools\.js|copy-fixtures\.js)\?v=[0-9a-f]+/g, (_, f) => asset('assets/' + f)).replace('</head>', alternates(url) + '</head>');
  if (!h.includes(`rel="canonical" href="${origin + url}"`)) throw new Error('canonical ' + url);
  pages.set(url.slice(1) + 'index.html', { url, html: h, title: h.match(/<title>(.*?)<\/title>/)[1], noindex: false, date: url === '/en/' || /\/updates\/$/.test(url) ? '2026-10-15' : (h.match(/article:modified_time" content="([^"]+)/) || [])[1] || '2026-10-15', lang: 'en' });
}

// ---- Output -----------------------------------------------------------------
function write(relative, content) { for (const base of [root, path.join(root, 'public')]) { const target = path.resolve(base, relative); if (!target.startsWith(base + path.sep)) throw new Error('outside root'); fs.mkdirSync(path.dirname(target), { recursive: true }); const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content); if (!(fs.existsSync(target) && fs.readFileSync(target).equals(bytes))) fs.writeFileSync(target, bytes); } }
for (const base of [root, path.join(root, 'public')]) for (const d of ['guides', 'tools', 'methods', 'about', 'editorial-policy', 'contact', 'privacy', 'updates', 'terms', 'en']) fs.rmSync(path.join(base, d), { recursive: true, force: true });
for (const [f, p] of pages) write(f, p.html);
const live = [...pages.values()].filter(p => !p.noindex);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${live.map(p => `<url><loc>${origin + p.url}</loc><lastmod>${p.date}</lastmod></url>`).join('\n')}\n</urlset>\n`);
const pub = new Date(DATE + 'T00:00:00+09:00').toUTCString(), cdata = s => '<![CDATA[' + s.replaceAll(']]>', ']]]]><![CDATA[>') + ']]>', abs = s => s.replace(/(href|src)="\//g, `$1="${origin}/`);
write('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>KYD 사진·파일 관리 가이드</title><link>${origin}/</link><description>직접 측정하고 공식 안내를 확인한 사진·파일 관리 가이드</description><language>ko</language><atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml"/><lastBuildDate>${pub}</lastBuildDate>${guides.map(g => `<item><title>${esc(g.title)}</title><link>${origin + guideUrl(g.slug)}</link><guid isPermaLink="true">${origin + guideUrl(g.slug)}</guid><pubDate>${pub}</pubDate><description>${cdata(abs(`<p>${g.description}</p>` + g.body.map(b => `<h2>${b[1]}</h2>${b[2]}`).join('')))}</description></item>`).join('')}</channel></rss>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
write('ads.txt', 'google.com, pub-7587676721583907, DIRECT, f08c47fec0942fa0\n');
const OLD_EN = ['before-deleting-photos', 'verify-a-file-copy', 'plan-photo-backup-space', 'google-photos-takeout-json-dates', 'back-up-live-photos'];
write('_redirects', ['/public / 301', '/public/* /:splat 301', '/blog /guides/ 301', '/blog/ /guides/ 301', '/posts /guides/ 301', '/posts/ /guides/ 301', ...OLD_EN.flatMap(s => [`/guides/${s} /en/guides/${s}/ 301`, `/guides/${s}/ /en/guides/${s}/ 301`])].join('\n') + '\n');
const CSP = img => `default-src 'self'; script-src 'self'; connect-src 'none'; img-src ${img}; style-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`;
write('_headers', `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n/tools/*\n  Content-Security-Policy: ${CSP("'self' data: blob:")}\n/en/tools/*\n  Content-Security-Policy: ${CSP("'self' data:")}\n/404.html\n  X-Robots-Tag: noindex\n`);
const retired = ['account-security-check', 'file-extension-check', 'phone-cost-comparator', 'url-structure-check'].map(s => '/tools/' + s);
write('_routes.json', JSON.stringify({ version: 1, include: ['/posts/*', ...retired.flatMap(u => [u, u + '/*'])], exclude: ['/posts/'] }, null, 2) + '\n');
write('_worker.js', `// Generated by scripts/build-site.cjs. Do not edit by hand.
const retiredTools=${JSON.stringify(retired)};
const unavailable=${JSON.stringify(pages.get('404.html').html)};
export default {
 async fetch(request,env){
  const pathname=new URL(request.url).pathname;
  const retired=(pathname.startsWith('/posts/')&&pathname!=='/posts/')||retiredTools.some(p=>pathname===p||pathname.startsWith(p+'/'));
  if(!retired)return env.ASSETS.fetch(request);
  const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, max-age=0','CDN-Cache-Control':'no-store','X-Robots-Tag':'noindex, follow','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','X-KYD-Withdrawal':'focused-20261007'};
  if(request.method!=='GET'&&request.method!=='HEAD')return new Response(null,{status:405,headers:{...headers,Allow:'GET, HEAD'}});
  return new Response(request.method==='HEAD'?null:unavailable,{status:404,headers});
 }
};
`);
for (const f of ['google50fae352e2643cab.html', 'favicon.ico']) write(f, fs.readFileSync(path.join(root, f)));
(function mirror(dir) { for (const f of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) { const r = dir + '/' + f.name; if (f.isDirectory()) mirror(r); else if (!f.name.endsWith('.md')) write(r, fs.readFileSync(path.join(root, r))); } })('assets');
write('site-manifest.json', JSON.stringify({ edition: 'ko-photo-file-tools', date: DATE, urls: live.map(p => p.url), guides: guides.map(g => guideUrl(g.slug)), tools: tools.map(t => toolUrl(t.slug)), redirects: OLD_EN.map(s => [`/guides/${s}/`, `/en/guides/${s}/`]), retired: retired.map(u => u + '/') }, null, 2) + '\n');
console.log(`Built ${live.length} pages: ko ${live.filter(p => p.lang === 'ko').length}, en ${live.filter(p => p.lang === 'en').length}`);
