'use strict';
// Generate the public RSS feed from canonical, already-published article HTML.
// Source date-only values have day precision; midnight KST is their RSS serialization.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://www.kyd.kr';
const escapeXml = value => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const cdata = value => '<![CDATA[' + value.replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
function rssDate(value) {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T00:00:00+09:00' : value);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid source date: ' + value);
  return date.toUTCString();
}
function extract(html, regex, label) {
  const value = html.match(regex)?.[1];
  if (!value) throw new Error('Missing ' + label);
  return value;
}
const posts = fs.readdirSync(path.join(root, 'posts'), {withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=> {
  const html = fs.readFileSync(path.join(root, 'posts', entry.name, 'index.html'), 'utf8');
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)"/, 'canonical');
  if (new URL(canonical).origin !== origin || !canonical.startsWith(origin + '/posts/')) throw new Error('Noncanonical feed URL');
  const published = extract(html, /<meta property="article:published_time" content="([^"]+)"/, 'publication date');
  const modified = extract(html, /<meta property="article:modified_time" content="([^"]+)"/, 'modification date');
  const title = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/, 'heading').replace(/<[^>]*>/g, '');
  let body = extract(html, /<article class="article">([\s\S]*?)<\/article>/, 'complete article');
  body = body.replace(/<details class="reading-toc">[\s\S]*?<\/details>/g,'')
    .replace(/<nav\b[\s\S]*?<\/nav>/g,'')
    .replace(/<section class="next-reads">[\s\S]*?<\/section>/g,'')
    .replace(/<script\b[\s\S]*?<\/script>/g,'')
    .replace(/[ \t]+$/gm,'')
    .replace(/\b(href|src)="\/(?!\/)/g, '$1="' + origin + '/')
    .replace(/\bhref="#([^"]+)"/g, (_,id)=>'href="' + canonical + '#' + id + '"')
    .replace(/srcset="([^"]+)"/g, (_,set)=>'srcset="' + set.split(',').map(part=>part.trim().replace(/^\//,origin + '/')).join(', ') + '"');
  return {canonical, published, modified, title, body};
}).sort((a,b)=>b.published.localeCompare(a.published) || b.modified.localeCompare(a.modified) || a.canonical.localeCompare(b.canonical));
if (!posts.length) throw new Error('Refusing to publish an empty feed');
const latest = posts.map(post=>post.modified).sort().at(-1);
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>\n' +
  '<title>KYD 디지털 가이드</title><link>' + origin + '/</link>\n' +
  '<description>공식 기록으로 읽는 스포츠 소식과 내 조건으로 비교하는 구매·생활 정보</description>\n' +
  '<language>ko-KR</language><atom:link href="' + origin + '/rss.xml" rel="self" type="application/rss+xml"/>\n' +
  '<lastBuildDate>' + rssDate(latest) + '</lastBuildDate>\n' +
  posts.map(post=>'<item><title>' + escapeXml(post.title) + '</title><link>' + escapeXml(post.canonical) + '</link>' +
    '<guid isPermaLink="true">' + escapeXml(post.canonical) + '</guid><pubDate>' + rssDate(post.published) + '</pubDate>' +
    '<description>' + cdata(post.body) + '</description></item>').join('\n') + '\n</channel></rss>\n';
if (Buffer.byteLength(xml) >= 10 * 1024 * 1024) throw new Error('RSS exceeds Naver submission limit');
for (const directory of [root, path.join(root, 'public')]) fs.writeFileSync(path.join(directory, 'rss.xml'), xml);
console.log('Generated full-content RSS: ' + posts.length + ' articles, ' + Buffer.byteLength(xml) + ' bytes.');
