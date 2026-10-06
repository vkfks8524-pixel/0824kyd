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
function replaceCalculator(body, canonical) {
  const start=body.indexOf('<section class="storage-calculator"');
  if(start<0)return body;
  const tokens=/<\/?section\b[^>]*>/g;tokens.lastIndex=start;
  let depth=0,token;
  while((token=tokens.exec(body))){
    depth+=token[0].startsWith('</')?-1:1;
    if(depth===0)return body.slice(0,start)+'<p>The personal-use calculator is available <a href="'+canonical+'#storage-calculator">in the original article</a>. The formula and hypothetical examples remain in this feed.</p>'+body.slice(tokens.lastIndex);
  }
  throw new Error('Unclosed calculator section: '+canonical);
}
const posts = fs.readdirSync(path.join(root, 'posts'), {withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=> {
  const html = fs.readFileSync(path.join(root, 'posts', entry.name, 'index.html'), 'utf8');
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)"/, 'canonical');
  if (new URL(canonical).origin !== origin || !canonical.startsWith(origin + '/posts/')) throw new Error('Noncanonical feed URL');
  const published = extract(html, /<meta property="article:published_time" content="([^"]+)"/, 'publication date');
  const modified = extract(html, /<meta property="article:modified_time" content="([^"]+)"/, 'modification date');
  const title = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/, 'heading').replace(/<[^>]*>/g, '');
  let body = extract(html, /<article class="article">([\s\S]*?)<\/article>/, 'complete article');
  body = replaceCalculator(body,canonical).replace(/<details class="reading-toc">[\s\S]*?<\/details>/g,'')
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
// A day-precision adaptation date must not place the feed before a timed publication.
const latest = posts.flatMap(post=>[post.modified,post.published]).sort().at(-1);
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>\n' +
  '<title>KYD Guides</title><link>' + origin + '/</link>\n' +
  '<description>Practical guides to weather, deliveries, web and AI, phone choices, costs, photo preservation and dated official-record sports reports</description>\n' +
  '<language>en</language><atom:link href="' + origin + '/rss.xml" rel="self" type="application/rss+xml"/>\n' +
  '<lastBuildDate>' + rssDate(latest) + '</lastBuildDate>\n' +
  posts.map(post=>'<item><title>' + escapeXml(post.title) + '</title><link>' + escapeXml(post.canonical) + '</link>' +
    '<guid isPermaLink="true">' + escapeXml(post.canonical) + '</guid><pubDate>' + rssDate(post.published) + '</pubDate>' +
    '<description>' + cdata(post.body) + '</description></item>').join('\n') + '\n</channel></rss>\n';
if (Buffer.byteLength(xml) >= 10 * 1024 * 1024) throw new Error('RSS exceeds Naver submission limit');
for (const directory of [root, path.join(root, 'public')]) fs.writeFileSync(path.join(directory, 'rss.xml'), xml);
console.log('Generated full-content RSS: ' + posts.length + ' articles, ' + Buffer.byteLength(xml) + ' bytes.');
