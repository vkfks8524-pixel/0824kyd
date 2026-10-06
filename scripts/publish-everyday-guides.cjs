'use strict';
// A repeatable, scoped publisher for the dated weather/shopping batch.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),origin='https://www.kyd.kr';
const {checked,ranking,posts}=require('./everyday-guides-20261006.cjs');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const escape=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const mirror=(file,value)=>{for(const dir of [root,path.join(root,'public')]){const target=path.join(dir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,value);}};
const template=read('posts/chatgpt-beginners-verify-answers/index.html');
const header=template.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
const footer=template.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
const author=template.match(/<aside class="author-box"[\s\S]*?<\/aside>/)[0];
const link=(url,label)=>`<a href="${escape(url)}" rel="noopener noreferrer">${escape(label)}</a>`;
function figure(photo,card=false){
 return `<figure class="${card?'card':'article'}-visual"><img src="/assets/editorial/${photo.name}-1200.webp" srcset="/assets/editorial/${photo.name}-480.webp 480w, /assets/editorial/${photo.name}-1200.webp 1200w" sizes="${card?'(max-width: 820px) calc(100vw - 48px), 520px':'(max-width: 820px) calc(100vw - 48px), 760px'}" width="${photo.width}" height="${photo.height}" alt="${escape(photo.alt)}" ${card?'loading="lazy"':'fetchpriority="high"'} decoding="async"><figcaption>${escape(photo.caption)} Photo: ${link(photo.source,photo.credit)} · ${link(photo.license,photo.licenseName)}. Resized and converted to WebP; composition retained.</figcaption></figure>`;
}
for(const [slug,data] of Object.entries(posts)){
 const canonical=origin+'/posts/'+slug+'/',imageUrl=origin+'/assets/editorial/'+data.photo.name+'-1200.webp';
 const headings=[];
 const body=data.body.replace(/<h2>(.*?)<\/h2>/g,(_,title)=>{const id='read-section-'+(headings.length+1);headings.push([id,title]);return `<h2 id="${id}">${title}</h2>`;});
 const toc=`<details class="reading-toc"><summary>In this article (${headings.length})</summary><nav aria-label="Article contents"><ol>${headings.map(([id,title])=>`<li><a href="#${id}">${title}</a></li>`).join('')}</ol></nav></details>`;
 const schema={'@context':'https://schema.org','@type':'Article',headline:data.title,description:data.description,datePublished:checked,dateModified:checked,inLanguage:'en',mainEntityOfPage:canonical,image:{'@type':'ImageObject',url:imageUrl,width:data.photo.width,height:data.photo.height,caption:data.photo.caption,creditText:data.photo.credit,license:data.photo.license},author:{'@type':'Organization',name:'KYD Editorial',url:origin+'/about/'}};
 const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[['Home',origin+'/'],['Everyday decisions',origin+'/posts/#everyday'],[data.title,canonical]].map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))};
 const html=`<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escape(data.title)} | KYD Guides</title>
<meta name="description" content="${escape(data.description)}"><meta name="author" content="KYD Editorial">
<meta name="google-adsense-account" content="ca-pub-7587676721583907">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7587676721583907" crossorigin="anonymous"></script>
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="KYD Guides">
<meta property="og:title" content="${escape(data.title)}"><meta property="og:description" content="${escape(data.description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${imageUrl}"><meta property="og:image:alt" content="${escape(data.photo.alt)}"><meta property="og:image:width" content="${data.photo.width}"><meta property="og:image:height" content="${data.photo.height}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${imageUrl}"><meta name="twitter:image:alt" content="${escape(data.photo.alt)}">
<meta property="article:published_time" content="${checked}"><meta property="article:modified_time" content="${checked}">
<script type="application/ld+json">${json(schema)}</script>
<script type="application/ld+json">${json(breadcrumb)}</script>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/style.css?v=20261005-en-1"><link rel="stylesheet" href="/assets/everyday-guides.css?v=20261006-1">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="alternate" type="application/rss+xml" title="KYD Guides RSS" href="${origin}/rss.xml">
</head><body class="everyday-article"><a class="skip-link" href="#main-content">Skip to content</a>
${header}
<main id="main-content" class="container article-layout"><article class="article">
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/posts/#everyday">Everyday decisions</a><span aria-hidden="true">/</span><span aria-current="page">${escape(data.title)}</span></nav>
<p class="category">${escape(data.category)}</p><h1>${escape(data.title)}</h1>
<p class="article-meta">By KYD Editorial · First published <time datetime="${checked}">${checked}</time> · Last editorial review <time datetime="${checked}">${checked}</time></p>
<p class="lead">${escape(data.lead)}</p>
${figure(data.photo)}
<aside class="review-callout"><strong>Scope and evidence</strong><p>${escape(data.scope)}</p></aside>
${toc}${body}
<section class="sources" id="sources-${slug}"><h2>Sources and review scope</h2><ul>${data.sources.map(([url,label])=>'<li>'+link(url,label)+'</li>').join('')}</ul><p class="source-reviewed">Source information last checked: <time datetime="${checked}">${checked}</time>. KYD’s worked examples, tables and message templates are original editorial aids, not recorded forecasts, customer cases or hands-on tests. Official guidance may change after this review.</p><p>Photo credit and reuse terms appear below the image. <a href="/posts/#everyday-selection">Topic selection and search-ranking source</a>.</p></section>
${author}
<section class="next-reads"><h2>Continue reading</h2><ul>${data.related.map(([other,title])=>`<li><a href="/posts/${other}/">${escape(title)}</a></li>`).join('')}</ul><a class="text-link" href="/posts/#everyday">Everyday decisions →</a></section>
</article><aside class="sidebar"><h2>Explore KYD</h2><ul><li><a href="/posts/#everyday">Everyday decisions</a></li><li><a href="/posts/#web-ai">Web &amp; AI guides</a></li><li><a href="/editorial-policy/">Sources and corrections policy</a></li></ul></aside></main>
${footer}</body></html>\n`;
 mirror('posts/'+slug+'/index.html',html);
}
const total=fs.readdirSync(path.join(root,'posts'),{withFileTypes:true}).filter(entry=>entry.isDirectory()&&fs.existsSync(path.join(root,'posts',entry.name,'index.html'))).length;
const card=([slug,data])=>`<article class="post-card">${figure(data.photo,true)}<p class="category">${escape(data.category)}</p><h3><a href="/posts/${slug}/">${escape(data.title)}</a></h3><p>${escape(data.description)}</p><p class="article-meta">Published ${checked} · Sources checked ${checked}</p></article>`;
const cards=Object.entries(posts).map(card).join('');
function block(html,name,replacement,anchor){
 const re=new RegExp('<!-- '+name+' START -->[\\s\\S]*?<!-- '+name+' END -->');
 const value='<!-- '+name+' START -->'+replacement+'<!-- '+name+' END -->';
 if(re.test(html))return html.replace(re,value);
 if(!html.includes(anchor))throw new Error('Missing insertion anchor: '+anchor);
 return html.replace(anchor,value+anchor);
}
function styles(html){return html.includes('/assets/everyday-guides.css')?html:html.replace('</head>','<link rel="stylesheet" href="/assets/everyday-guides.css?v=20261006-1">\n</head>');}
let home=read('index.html').replace(/Browse all \d+ articles/g,'Browse all '+total+' articles');
home=block(home,'EVERYDAY HOME','<section class="home-section everyday-features" aria-labelledby="everyday-title"><div class="section-heading"><div><p class="eyebrow">NEW · OCTOBER 6, 2026</p><h2 id="everyday-title">A clearer plan for rain and missing deliveries</h2></div><a class="text-link" href="/posts/#everyday">Everyday decisions →</a></div><p class="section-intro">Read a rain percentage correctly, or work out the next step when tracking and your doorstep disagree. Official guidance, practical examples and credited photographs.</p><div class="post-list">'+cards+'</div></section>','<!-- WEB AI HOME START -->');
mirror('index.html',styles(home));
let library=read('posts/index.html').replace(/All \d+ articles/g,'All '+total+' articles').replace(/<a href="#all">All <span>\d+<\/span><\/a>/,`<a href="#all">All <span>${total}</span></a>`);
if(!library.includes('href="#everyday"'))library=library.replace('<a href="#web-ai">','<a href="#everyday">Everyday decisions <span>2</span></a><a href="#web-ai">');
library=library.replace(/\/assets\/library\.js\?v=[^"]+/, '/assets/library.js?v=20261006-everyday-1');
const details=`<details class="reading-toc" id="everyday-selection"><summary>Why these topics? Search data and scope</summary><p>Selected from ${link(ranking.url,'Ahrefs’ September 2026 global Google-search table')}, updated ${ranking.updated}, checked ${checked}: <strong>weather</strong> is #6 (${ranking.rows[0].volume.toLocaleString('en-US')} estimated searches per month); <strong>amazon</strong> is #7 (${ranking.rows[1].volume.toLocaleString('en-US')}). These follow the five queries used in our <a href="/posts/#web-ai">October 5 series</a>.</p><p>These are broad-query estimates, not today’s live trends, visitor counts or measured demand for the exact article titles. The articles answer narrower practical questions. Amazon’s policies below are scoped to its US storefront; weather definitions are attributed to their providers.</p></details>`;
library=block(library,'EVERYDAY LIBRARY','<section class="topic-section" id="everyday"><div class="section-heading"><h2>Everyday decisions</h2><span class="section-count">2 articles</span></div><p class="section-intro">Weather, deliveries and the details that change your next step.</p>'+details+'<div class="post-list">'+cards+'</div></section>','<!-- WEB AI LIBRARY START -->');
library=library.replace('All '+total+' articles: web, AI, phone choices and sport','All '+total+' articles: everyday decisions, web, phones and sport');
library=library.replaceAll('Search KYD’s English guides about ChatGPT, WhatsApp Web, YouTube, translation, phone choices, photos, security and dated sports results.','Search English guides to weather, deliveries, everyday web services, phone choices, security and dated sports results.');
mirror('posts/index.html',styles(library));
let updates=read('updates/index.html');
updates=block(updates,'EVERYDAY UPDATE','<section class="update-entry"><p class="article-meta">October 6, 2026</p><h2>Two illustrated guides to weather and missing deliveries</h2><p>Added <a href="/posts/what-does-40-percent-chance-of-rain-mean/">rain-probability interpretation</a> with US/UK definitions and a fictional planning exercise, and <a href="/posts/amazon-delivered-but-not-received/">Amazon.com missing-delivery guidance</a> with a factual evidence log and support-message template. Both include licensed archive photographs, visible credits, review dates and <a href="/posts/#everyday-selection">topic-selection provenance</a>.</p></section>','<!-- WEB AI UPDATE START -->');
mirror('updates/index.html',updates);
mirror('assets/everyday-guides.css',read('assets/everyday-guides.css'));
mirror('assets/editorial/PHOTOS.md',read('assets/editorial/PHOTOS.md'));
console.log('Published 2 illustrated everyday guides; '+total+' articles in the library.');
