'use strict';
// Publish this dated batch without rerunning the pinned Korean-to-English migration.
// Idempotent generated blocks preserve the old cards, articles and operational tokens.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {checked,ranking,posts}=require('./global-search-guides.cjs');
const origin='https://www.kyd.kr';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const escape=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const link=(url,label)=>`<a href="${escape(url)}" rel="noopener noreferrer">${escape(label)}</a>`;
const mirror=(file,html)=>{for(const dir of [root,path.join(root,'public')]){const target=path.join(dir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);}};
const template=read('posts/phone-purchase-total-cost/index.html');
const header=template.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
const footer=template.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
const author=template.match(/<aside class="author-box"[\s\S]*?<\/aside>/)[0].replace('Writing and adaptation','Writing and source review');
function article(slug,data){
  const canonical=origin+'/posts/'+slug+'/';
  const headings=[];
  const body=data.body.replace(/<h2>(.*?)<\/h2>/g,(_,title)=>{const id='read-section-'+(headings.length+1);headings.push([id,title]);return `<h2 id="${id}">${title}</h2>`;});
  const toc=`<details class="reading-toc"><summary>In this article (${headings.length})</summary><nav aria-label="Article contents"><ol>${headings.map(([id,title])=>`<li><a href="#${id}">${title}</a></li>`).join('')}</ol></nav></details>`;
  const articleSchema={'@context':'https://schema.org','@type':'Article',headline:data.title,description:data.description,datePublished:checked,dateModified:checked,inLanguage:'en',mainEntityOfPage:canonical,author:{'@type':'Organization',name:'KYD Editorial',url:origin+'/about/'}};
  const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[['Home',origin+'/'],['Web & AI',origin+'/posts/#web-ai'],[data.title,canonical]].map(([name,item],index)=>({'@type':'ListItem',position:index+1,name,item}))};
  return `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escape(data.title)} | KYD Guides</title>
<meta name="description" content="${escape(data.description)}"><meta name="author" content="KYD Editorial">
<meta name="google-adsense-account" content="ca-pub-7587676721583907">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7587676721583907" crossorigin="anonymous"></script>
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="KYD Guides">
<meta property="og:title" content="${escape(data.title)}"><meta property="og:description" content="${escape(data.description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary">
<meta property="article:published_time" content="${checked}"><meta property="article:modified_time" content="${checked}">
<script type="application/ld+json">${json(articleSchema)}</script>
<script type="application/ld+json">${json(breadcrumb)}</script>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/style.css?v=20261005-en-1">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="alternate" type="application/rss+xml" title="KYD Guides RSS" href="${origin}/rss.xml">
</head><body><a class="skip-link" href="#main-content">Skip to content</a>
${header}
<main id="main-content" class="container article-layout"><article class="article">
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/posts/#web-ai">Web &amp; AI</a><span aria-hidden="true">/</span><span aria-current="page">${escape(data.title)}</span></nav>
<p class="category">${escape(data.category)}</p><h1>${escape(data.title)}</h1>
<p class="article-meta">By KYD Editorial · First published <time datetime="${checked}">${checked}</time> · Last editorial review <time datetime="${checked}">${checked}</time></p>
<p class="lead">${escape(data.lead)}</p>
<aside class="review-callout"><strong>Scope and evidence</strong><p>${escape(data.scope)}</p></aside>
${toc}${body}
<section class="sources" id="sources-${slug}"><h2>Sources and review scope</h2><ul>${data.sources.map(([url,label])=>'<li>'+link(url,label)+'</li>').join('')}</ul><p class="source-reviewed">Source information last checked: <time datetime="${checked}">${checked}</time>. Official instructions are distinguished from KYD’s fictional examples and editorial checklists. Features and menus can change; this article does not update automatically.</p><p><a href="/posts/#web-ai">Series selection and global search-ranking source</a>.</p></section>
${author}
<section class="next-reads"><h2>Continue reading</h2><ul>${data.related.map(other=>`<li><a href="/posts/${other}/">${escape(posts[other].title)}</a></li>`).join('')}</ul><a class="text-link" href="/posts/#web-ai">All Web &amp; AI guides →</a></section>
</article><aside class="sidebar"><h2>Explore KYD</h2><ul><li><a href="/posts/#web-ai">Web &amp; AI guides</a></li><li><a href="/tools/">Free local-only tools</a></li><li><a href="/editorial-policy/">Sources and corrections policy</a></li></ul></aside></main>
${footer}</body></html>\n`;
}
for(const [slug,data] of Object.entries(posts))mirror('posts/'+slug+'/index.html',article(slug,data));
const total=fs.readdirSync(path.join(root,'posts'),{withFileTypes:true}).filter(entry=>entry.isDirectory()&&fs.existsSync(path.join(root,'posts',entry.name,'index.html'))).length;
const card=(slug,heading='h3')=>{const data=posts[slug];return `<article class="post-card"><p class="category">${escape(data.category)}</p><${heading}><a href="/posts/${slug}/">${escape(data.title)}</a></${heading}><p>${escape(data.description)}</p><p class="article-meta">Published ${checked} · Sources checked ${checked}</p></article>`;};
const removeBlock=(html,name)=>html.replace(new RegExp('<!-- '+name+' START -->[\\s\\S]*?<!-- '+name+' END -->\\s*'),'');
function metadata(html,title,description){
 if(title){html=html.replace(/<title>.*?<\/title>/s,'<title>'+escape(title)+' | KYD Guides</title>').replace(/(<meta property="og:title" content=")[^"]*/,'$1'+escape(title));}
 if(description)html=html.replace(/(<meta name="description" content=")[^"]*/,'$1'+escape(description)).replace(/(<meta property="og:description" content=")[^"]*/,'$1'+escape(description));
 return html;
}
let library=removeBlock(read('posts/index.html'),'WEB AI LIBRARY');
library=library.replace(/<a href="#web-ai">[\s\S]*?<\/a>/,'').replace(/<a href="#all">All <span>\d+<\/span><\/a>/,`<a href="#all">All <span>${total}</span></a><a href="#web-ai">Web &amp; AI <span>${Object.keys(posts).length}</span></a>`).replace(/All \d+ articles/g,'All '+total+' articles').replace('Try: iPhone, backup, medals','Try: ChatGPT, WhatsApp, backup');
library=metadata(library,'All '+total+' articles: web, AI, phone choices and sport','Search KYD’s English guides about ChatGPT, WhatsApp Web, YouTube, translation, phone choices, photos, security and dated sports results.');
library=library.replace(/\/assets\/library\.js\?v=[^"]+/, '/assets/library.js?v=20261005-global-1');
const rankingDetails=`<details class="reading-toc" id="global-search-ranking"><summary>Why these five guides? Ranking source and limits</summary><p>Selection: ${link(ranking.url,'Ahrefs September 2026 global table')}, updated ${ranking.updated}; checked ${checked}. Figures are estimated monthly search volume, not today’s searches, unique people or visits to KYD.</p><div class="table-wrap"><table><caption>First five queries in the selected global table</caption><thead><tr><th>Rank</th><th>Query</th><th>Estimated searches / month</th></tr></thead><tbody>${ranking.rows.map(row=>`<tr><td>${row.rank}</td><td>${escape(row.query)}</td><td>${row.volume.toLocaleString('en-US')}</td></tr>`).join('')}</tbody></table></div><p>“chatgpt” and “chat gpt” are spelling variants of one service: five queries, four distinct topics. The two ChatGPT guides answer different questions. “translate” is broader than Google Translate; our guide chooses it as an example, not as the recipient of every search.</p><p>${link(ranking.methodology,'Ahrefs search-volume methodology')} explains the monthly estimate, based on a 12-month average. Providers can disagree; this is not a Google-issued real-time ranking. Topic selection is not a traffic or ranking guarantee.</p></details>`;
const librarySection=`<!-- WEB AI LIBRARY START --><section class="topic-section" id="web-ai"><div class="section-heading"><h2>Web &amp; AI</h2><span class="section-count">${Object.keys(posts).length} articles</span></div><p class="section-intro">Practical questions about everyday services. Separate useful instructions from assumptions about privacy or accuracy.</p>${rankingDetails}<div class="post-list">${ranking.rows.map(row=>card(row.slug)).join('')}</div></section><!-- WEB AI LIBRARY END -->`;
library=library.replace('<section class="topic-section" id="buying">',librarySection+'<section class="topic-section" id="buying">');
if(!library.includes('WEB AI LIBRARY START'))throw new Error('Library insertion anchor not found');
mirror('posts/index.html',library);
let home=removeBlock(read('index.html'),'WEB AI HOME').replace(/Browse all \d+ articles/g,'Browse all '+total+' articles');
const homeSection=`<!-- WEB AI HOME START --><section class="home-section" aria-labelledby="web-ai-title"><div class="section-heading"><div><p class="eyebrow">NEW · EVERYDAY WEB &amp; AI</p><h2 id="web-ai-title">Five useful guides, beyond the search box</h2></div><a class="text-link" href="/posts/#web-ai">Guides and selection source →</a></div><p class="section-intro">Better prompts, fewer unnecessary uploads, safer linked sessions, clearer recommendations and checked translations.</p><div class="post-list">${ranking.rows.map(row=>card(row.slug)).join('')}</div><p class="archive-note">A dated selection from a third-party global search table, not a live popularity feed or a promise of search traffic.</p></section><!-- WEB AI HOME END -->`;
home=home.replace('<section class="home-section" aria-labelledby="workflow-title">',homeSection+'<section class="home-section" aria-labelledby="workflow-title">');
if(!home.includes('WEB AI HOME START'))throw new Error('Home insertion anchor not found');
home=metadata(home,null,'Practical English guides for ChatGPT, everyday web services, phone choices, total costs and photo preservation, plus free tools and sourced sports records.');
mirror('index.html',home);
let updates=removeBlock(read('updates/index.html'),'WEB AI UPDATE');
const update=`<!-- WEB AI UPDATE START --><section class="update-entry"><p class="article-meta">October 5, 2026</p><h2>Five original English Web &amp; AI guides</h2><p>Published distinct guides to prompting and verification, WhatsApp linked sessions, YouTube history, pre-upload data minimization and translation review. Added ${link(ranking.url,'the dated query selection')} with provider, metric, alias and scope limits in the <a href="/posts/#web-ai">article library</a>. Fictional exercises and editorial checklists are labeled; no new hands-on tests, current-product photographs or measured traffic improvements are claimed.</p></section><!-- WEB AI UPDATE END -->`;
updates=updates.replace('<section class="update-entry">',update+'<section class="update-entry">');
mirror('updates/index.html',updates);
console.log('Published '+Object.keys(posts).length+' source-based English guides; library now lists '+total+' articles.');
