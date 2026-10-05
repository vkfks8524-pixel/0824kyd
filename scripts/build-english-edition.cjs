'use strict';
// One-off, reproducible English migration from the pinned Korean edition.
// Usage: node scripts/build-english-edition.cjs --write
// Article facts and licensed images come from 440df81, not a new source review.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const content=require('./english-edition.cjs');
const ui=require('./english-ui.cjs');
const baseline='440df81';
const date='2026-10-05';
const original=file=>cp.execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#183;/g,'·').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&#39;/g,"'");
const groups={buying:'Buying & costs',sports:'Sport',security:'Security & privacy',smartphone:'Phones & photos',computer:'Computers',website:'Website operations'};
const oldTitles={};
const sourceFiles={};
for(const [slug,data] of Object.entries(content)){
 const html=original('posts/'+slug+'/index.html');sourceFiles[slug]=html;
 const old=decode(html.match(/<h1[^>]*>(.*?)<\/h1>/s)[1]);oldTitles[old]=data.title;
}
const glossary={...ui.strings,...require('./english-tool-ui.cjs'),...oldTitles};
function textTranslation(value){
 const trimmed=value.trim();
 const decoded=decode(trimmed);
 const replacement=glossary[trimmed]??glossary[decoded];
 if(replacement!==undefined)return value.replace(trimmed,escape(replacement));
 return value;
}
function translateJson(value){
 if(typeof value==='string')return glossary[value]??value.replaceAll('KYD 디지털 가이드 편집팀','KYD Editorial').replaceAll('KYD 디지털 가이드','KYD Guides').replaceAll('ko-KR','en');
 if(Array.isArray(value))return value.map(translateJson);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,val])=>[key,translateJson(val)]));
 return value;
}
function translateMarkup(html){
 // Translate text nodes and reader-facing attributes, never URLs, IDs or numbers.
 html=html.replace(/<script type="application\/ld\+json">(.*?)<\/script>/gs,(_,json)=>'<script type="application/ld+json">'+JSON.stringify(translateJson(JSON.parse(json)))+'</script>');
 html=html.split(/(<[^>]+>)/g).map((part,i)=>i%2?part:textTranslation(part)).join('');
 html=html.replace(/\b(aria-label|aria-valuetext|title|alt|placeholder|data-action|data-sample)="([^"]*)"/g,(_,attr,value)=>attr+'="'+textTranslation(value)+'"');
 html=html.replace(/(<meta\b[^>]*\bcontent=")([^"]*)(")/g,(_,start,value,end)=>start+textTranslation(value)+end);
 return html.replaceAll('lang="ko"','lang="en"').replaceAll('content="ko_KR"','content="en_US"').replaceAll('"inLanguage":"ko-KR"','"inLanguage":"en"').replaceAll('KYD 디지털 가이드 편집팀','KYD Editorial').replaceAll('KYD 디지털 가이드','KYD Guides');
}
const header=current=>`<header class="site-header"><div class="header-inner"><a class="logo" href="/" aria-label="KYD Guides home"><span class="logo-mark">KYD</span><span class="logo-caption">Practical guides<br>Decisions made clearer</span></a><nav class="nav" aria-label="Main navigation"><a href="/"${current==='home'?' aria-current="page"':''}>Home</a><a href="/posts/#buying">Buying &amp; costs</a><a href="/posts/#sports">Sport</a><a href="/tools/"${current==='tools'?' aria-current="page"':''}>Free tools</a><a href="/posts/" class="nav-search"${current==='posts'?' aria-current="page"':''}>All articles &amp; search</a></nav></div></header>`;
const footer=`<footer class="site-footer"><div class="footer-inner"><span>© 2026 KYD Guides</span><div class="footer-links"><a href="/tools/">Free tools</a><a href="/about/">About</a><a href="/editorial-policy/">Editorial policy</a><a href="/updates/">Updates</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a></div></div></footer>`;
function metadata(html,title,description){
 html=html.replace(/<title>.*?<\/title>/s,'<title>'+escape(title)+' | KYD Guides</title>');
 html=html.replace(/(<meta name="description" content=")[^"]*/,'$1'+escape(description));
 for(const [key,value] of [['og:title',title],['og:description',description]])html=html.replace(new RegExp('(<meta property="'+key+'" content=")[^"]*'),'$1'+escape(value));
 return html;
}
function shell(html,current){return html.replace(/<header class="site-header">[\s\S]*?<\/header>/,header(current)).replace(/<footer class="site-footer">[\s\S]*?<\/footer>/,footer).replace(/<a class="skip-link"[^>]*>.*?<\/a>/,'<a class="skip-link" href="#main-content">Skip to content</a>');}
const photoMeta={
 choice:{alt:'Different generations of iPhone photographed on a table',caption:'Reference photograph of different iPhone generations, not an iPhone 18 comparison or KYD’s own product photograph.',credit:'Amanz / Unsplash',url:'https://unsplash.com/photos/two-iphones-displayed-with-colorful-blurred-background-tlJcIAfVgxw',license:'https://unsplash.com/license'},
 storage:{alt:'A hand browsing a collection of photographs on a smartphone',caption:'Reference photograph about photo storage, not a backup-status screen, capacity measurement or restore test.',credit:'Plann / Pexels',url:'https://www.pexels.com/photo/person-holding-smartphone-4549416/',license:'https://www.pexels.com/license/'},
 budget:{alt:'A person using a smartphone calculator beside paperwork',caption:'Reference photograph about cost planning; the screen numbers are unrelated to this article’s quotes or calculations.',credit:'Polina Tankilevitch / Pexels',url:'https://www.pexels.com/photo/a-person-holding-a-smartphone-6927547/',license:'https://www.pexels.com/license/'},
 an:{alt:'An Se-young beside the court at the 2019 Chinese Taipei Open',caption:'Archive photograph: An Se-young at the Chinese Taipei Open, September 7, 2019. Not a scene from the 2026 Asian Games.',credit:'De-Shao Liu (Terry850324) / Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/File:2019_Chinese_Taipei_Open_01.jpg',license:'https://creativecommons.org/licenses/by-sa/4.0/',licenseName:'CC BY-SA 4.0',changes:'Resized and converted to WebP; the adapted files retain the same license.'},
 aichi:{alt:'The entrance and roof structure of Aichi Sky Expo in a 2025 archive photograph',caption:'Archive photograph: Aichi Sky Expo entrance, July 27, 2025. Not a photograph of a 2026 match, medal ceremony or closing ceremony.',credit:'Tokumeigakarinoaoshima / Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/File:AICHI_SKY_EXPO.jpg',license:'https://creativecommons.org/publicdomain/zero/1.0/',licenseName:'CC0 1.0',changes:'Resized and converted to WebP; original composition retained.'},
 toyota:{alt:'Toyota Stadium stands and football pitch during a J.League match in 2010',caption:'Archive photograph: a J.League match at Toyota Stadium in 2010. Not the 2026 Asian Games final or medal ceremony.',credit:'Umako / Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/File:Nagoya_Grampus_game_in_Toyota_Stadium_100814.JPG',license:'https://creativecommons.org/publicdomain/zero/1.0/',licenseName:'CC0 1.0',changes:'Resized and converted to WebP; original composition retained.'},
 jra:{alt:'The stone entrance and iron gate of Tokyo JRA Equestrian Park in 2017',caption:'Archive photograph: Tokyo JRA Equestrian Park gate, August 4, 2017. Not a photograph of a 2026 match or medal ceremony.',credit:'Daderot / Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/File:Gate_-_JRA_Equestrian_Park_-_Setagya,_Tokyo,_Japan_-_DSC09654.jpg',license:'https://creativecommons.org/publicdomain/zero/1.0/',licenseName:'CC0 1.0',changes:'Resized and converted to WebP; original composition retained.'}
};
const link=(url,label)=>'<a href="'+url+'" rel="noopener noreferrer">'+escape(label)+'</a>';
function photo(slug,card=false){
 const data=content[slug],m=photoMeta[data.photo];if(!m)return '';
 let img=sourceFiles[slug].match(/<figure class="article-visual">[\s\S]*?(<img\b[^>]+>)/)?.[1];
 if(!img)throw new Error('Missing source image: '+slug);
 img=img.replace(/alt="[^"]*"/,'alt="'+m.alt+'"');
 if(card)img=img.replace(/loading="eager"/,'loading="lazy"').replace(/fetchpriority="high"/,'');
 const caption=m.caption+' Photo: '+link(m.url,m.credit)+' · '+link(m.license,m.licenseName||'Usage license')+(m.changes?' · '+m.changes:'');
 return '<figure class="'+(card?'card-visual':'article-visual')+'">'+img+'<figcaption>'+caption+'</figcaption></figure>';
}
function tableTranslation(table){
 const pairs=Object.entries(ui.tableStrings).sort((a,b)=>b[0].length-a[0].length);
 let result=table.split(/(<[^>]+>)/g).map((part,i)=>{
  if(i%2)return part;
  if(glossary[part.trim()]!==undefined)return textTranslation(part);
  for(const [from,to] of pairs)part=part.replaceAll(from,to);
  return part.replace(/에\s*$/, ' vs ');
 }).join('');
 if(/[가-힣]/.test(result))throw new Error('Untranslated sports table: '+result.match(/[^<>]*[가-힣][^<>]*/)?.[0]);
 return '<div class="table-wrap">'+result+'</div>';
}
function storageForm(){
 const labels=[['used','Current usage (GB)','0–10,000GB · read from device settings',0,10000,'0.1'],['growth','Monthly net growth (GB)','0–1,000GB · growth after regular cleanup',0,1000,'0.1'],['months','Planned use (months)','1–120 months · whole number',1,120,'1'],['temporary','Temporary storage (GB)','0–10,000GB · travel videos and offline files',0,10000,'0.1'],['reserve','Additional reserve (GB)','0–10,000GB · your allowance for unexpected growth',0,10000,'0.1']];
 return `<section class="storage-calculator" id="storage-calculator" aria-labelledby="storage-calculator-title"><h2 id="storage-calculator-title">Calculate using your own assumptions</h2><p>Include existing apps and system use in current usage. Compare smaller and larger growth assumptions if unknown. Reserve is your planning choice, not an Apple requirement. This code does not save or transmit inputs.</p><form id="storage-choice-form" aria-busy="true">${labels.map(([id,label,help,min,max,step])=>`<div class="form-row"><label for="choice-${id}">${label}</label><input id="choice-${id}" type="number" min="${min}" max="${max}" step="${step}" required disabled aria-describedby="choice-${id}-help"><p class="form-help" id="choice-${id}-help">${help}</p></div>`).join('')}<div class="tool-actions"><button type="submit" disabled>Calculate capacity</button><button id="storage-choice-example" type="button" class="secondary-action" disabled>Load hypothetical example A</button><button type="reset" class="secondary-action" disabled>Reset</button></div></form><p id="storage-choice-error" class="form-error" role="alert" tabindex="-1" hidden>Enter every value within the displayed limits. Months must be a whole number; GB values may use one decimal place.</p><noscript><p>Automatic calculation requires JavaScript. The formula and worked examples remain readable without it.</p></noscript><section id="storage-choice-result" class="tool-result" tabindex="-1" aria-live="polite" hidden><h3>Capacity planned from your assumptions: <span id="storage-choice-total"></span></h3><p id="storage-choice-equation"></p><p id="storage-choice-sensitivity"></p><p id="storage-choice-interpretation"></p></section><p class="editor-note">This does not read usable device space, predict device life or automatically recommend a purchase. Negative growth is not supported; review a declining trend separately.</p></section>`;
}
const rendered=new Map();
for(const [slug,data] of Object.entries(content)){
 const source=sourceFiles[slug];
 const published=source.match(/property="article:published_time" content="([^"]+)"/)[1];
 const priorModified=source.match(/property="article:modified_time" content="([^"]+)"/)[1];
 const sourceDate=data.sourceTime||(['iphone-18-pro-buying-guide','iphone-storage-choice','phone-purchase-total-cost'].includes(slug)?'2026-09-26':priorModified);
 const sourceSection=source.match(/<section class="sources"[^>]*>([\s\S]*?)<\/section>/)[1];
 const citations=[...(sourceSection.match(/<ul>([\s\S]*?)<\/ul>/)?.[1]||sourceSection).matchAll(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/gs)];
 if(citations.length!==data.sources.length)throw new Error('Source label count '+slug+': '+citations.length+' != '+data.sources.length);
 const tables=[...source.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/g)].map(x=>x[0]);
 let body=data.body.replaceAll('{{STORAGE_FORM}}',storageForm()).replace(/\{\{TABLE(\d+)\}\}/g,(_,n)=>tableTranslation(tables[Number(n)]));
 if(data.group==='sports'&&tables.length!==[...data.body.matchAll(/\{\{TABLE\d+\}\}/g)].length)throw new Error('Dropped a sports table: '+slug);
 const relatedTools=[...new Set([...source.matchAll(/href="(\/tools\/[^"#]+\/)(?:#[^"]*)?"/g)].map(x=>x[1]))].filter(url=>ui.toolMeta[url.slice(1)+'index.html']&&!body.includes('href="'+url+'"'));
 if(relatedTools.length)body+='<section class="related-tools"><h2>Related tools</h2><ul>'+relatedTools.map(url=>'<li><a href="'+url+'">'+escape(ui.toolMeta[url.slice(1)+'index.html'].title)+'</a></li>').join('')+'</ul></section>';
 let headingCount=0;
 body=body.replace(/<h2(?![^>]*\bid=)([^>]*)>/g,(_,attrs)=>'<h2 id="read-section-'+(++headingCount)+'"'+attrs+'>');
 const headings=[...body.matchAll(/<h2\b[^>]*id="([^"]+)"[^>]*>(.*?)<\/h2>/g)];
 const toc='<details class="reading-toc"><summary>In this article ('+headings.length+')</summary><nav aria-label="Article contents"><ol>'+headings.map(x=>'<li><a href="#'+x[1]+'">'+x[2]+'</a></li>').join('')+'</ol></nav></details>';
 const sources='<section class="sources" id="sources-'+slug+'"><h2>Sources and review scope</h2><ul>'+citations.map((c,i)=>'<li>'+link(c[1],data.sources[i])+'</li>').join('')+'</ul><p class="source-reviewed">Source information last checked: <time datetime="'+sourceDate.slice(0,10)+'">'+sourceDate+'</time>. English adaptation: '+date+'. Translation does not renew the source check. Official records, hypothetical examples and KYD calculations are distinguished above. Linked documentation may be in Korean.</p>'+(data.photoNote?'<p>'+data.photoNote+'</p>':'')+(data.group==='sports'?'<p>Archive photographs are not current match or ceremony images. Original credits and reuse licenses are retained; resizing and WebP conversion do not imply endorsement by athletes, photographers or venues. No unlicensed press or broadcast photographs are added.</p>':'')+'</section>';
 const author='<aside class="author-box" aria-label="Author and editorial approach"><p class="author-label">Writing and adaptation</p><h2>KYD Editorial</h2><p>KYD Editorial is the site’s publishing name, not a claim of multiple expert reviewers. Automation-assisted drafting and editing are disclosed in our <a href="/editorial-policy/">editorial policy</a>. This article does not claim hands-on testing unless explicitly stated. Report changed instructions or factual errors through <a href="/contact/">corrections</a>. <a href="https://github.com/vkfks8524-pixel/0824kyd" rel="noopener noreferrer">Public site code</a>.</p></aside>';
 const related=[...new Set([...source.matchAll(/href="(\/posts\/[^"#]+\/)(?:#[^"]*)?"/g)].map(x=>x[1]))].filter(url=>url!='/posts/'+slug+'/').slice(0,4);
 const next='<section class="next-reads"><h2>Continue reading</h2><ul>'+related.map(url=>'<li><a href="'+url+'">'+escape(content[url.split('/')[2]]?.title||'All articles')+'</a></li>').join('')+'</ul><a class="text-link" href="/posts/">Browse all articles →</a></section>';
 const article='<article class="article"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/posts/#'+data.group+'">'+groups[data.group]+'</a><span aria-hidden="true">/</span><span aria-current="page">'+escape(data.title)+'</span></nav><p class="category">'+escape(data.category)+'</p><h1>'+escape(data.title)+'</h1><p class="article-meta">By KYD Editorial · First published <time datetime="'+published+'">'+published+'</time> · Last editorial review <time datetime="'+date+'">'+date+'</time></p><p class="editor-note">English edition adapted on '+date+'. The original source-check date is retained below; this is not a fresh product or match investigation.</p><p class="lead">'+data.lead+'</p>'+photo(slug)+toc+body+sources+author+next+'</article>';
 let html=shell(source,'');
 html=html.replace(/<article class="article">[\s\S]*?<\/article>/,article).replace(/<aside class="sidebar">[\s\S]*?<\/aside>/,'<aside class="sidebar"><h2>Explore KYD</h2><ul><li><a href="/posts/#'+data.group+'">'+groups[data.group]+'</a></li><li><a href="/tools/">Free local-only tools</a></li><li><a href="/editorial-policy/">Sources and corrections policy</a></li></ul></aside>');
 html=metadata(html,data.title,data.description).replace(/(property="article:modified_time" content=")[^"]+/,'$1'+date);
 html=html.replace(/<script type="application\/ld\+json">(.*?)<\/script>/gs,(_,json)=>{
  const structured=translateJson(JSON.parse(json));
  if(['Article','NewsArticle'].includes(structured['@type'])){structured.headline=data.title;structured.description=data.description;structured.inLanguage='en';structured.dateModified=date;structured.author.name='KYD Editorial';if(structured.image?.caption&&data.photo)structured.image.caption=photoMeta[data.photo].caption;}
  return '<script type="application/ld+json">'+JSON.stringify(structured)+'</script>';
 });
 if(data.photo)html=html.replace(/(property="og:image:alt" content=")[^"]*/,'$1'+photoMeta[data.photo].alt);
 rendered.set('posts/'+slug+'/index.html',translateMarkup(html));
}
function card(slug){const data=content[slug];return '<article class="post-card">'+photo(slug,true)+'<p class="category">'+escape(data.category)+'</p><h3><a href="/posts/'+slug+'/">'+escape(data.title)+'</a></h3><p>'+escape(data.description)+'</p><p class="article-meta">English edition: '+date+' · See article for source-check date</p></article>';}
for(const [file,data] of Object.entries(ui.pages||{})){
 let html=shell(original(file),file==='index.html'?'home':file==='posts/index.html'?'posts':file.startsWith('tools/')?'tools':'');
 let main=typeof data.body==='function'?data.body({card,content,groups}):data.body;
 if(main)html=html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,'<main id="main-content" class="container'+(file==='posts/index.html'?' library-page':'')+'">'+main+'</main>');
 html=html.replace(/<script type="application\/ld\+json">(.*?)<\/script>/gs,(_,json)=>{const schema=translateJson(JSON.parse(json));if(['WebSite','CollectionPage','WebPage','AboutPage'].includes(schema['@type'])){schema.name=data.title;schema.description=data.description;schema.inLanguage='en';}return '<script type="application/ld+json">'+JSON.stringify(schema)+'</script>';});
 html=html.replace(/(property="og:image:alt" content=")[^"]*/,'$1'+photoMeta.choice.alt);
 rendered.set(file,translateMarkup(metadata(html,data.title,data.description)));
}
for(const file of ui.preservePages||[]){
 const data=ui.toolMeta[file];
 let html=shell(original(file),'tools');
 html=translateMarkup(metadata(html,data.title,data.description));
 html=html.replace(/<script type="application\/ld\+json">(.*?)<\/script>/gs,(_,json)=>{const app=JSON.parse(json);if(app['@type']==='WebApplication'){app.name=data.title;app.description=data.description;app.inLanguage='en';}return '<script type="application/ld+json">'+JSON.stringify(app)+'</script>';});
 rendered.set(file,html);
}
for(const file of ['assets/tools.js','assets/phone-cost.js','assets/storage-choice.js','assets/backup-check.js','assets/library.js']){
 let js=original(file);
 for(const [from,to] of Object.entries(ui.jsStrings).sort((a,b)=>b[0].length-a[0].length))js=js.replaceAll(from,to);
 rendered.set(file,js.replaceAll("'ko-KR'","'en'"));
}
const fixture=JSON.parse(original('tools/test-cases.json'));
fixture.version=date;
fixture.scope='String analysis and calculation checks for KYD tools. Not malware-detection, real-device inspection or account-compromise verification. Korean filename inputs intentionally test Unicode handling.';
const fixtureLabels={'HTTPS 형식':'HTTPS format','@ 앞의 사용자 정보':'User information before @','비표준 포트':'Nonstandard port','퓨니코드':'Punycode','프로토콜이 생략됨':'Protocol omitted','이중 확장자':'double-extension','바로가기':'Shortcut','오래된 Office':'Legacy Office','매크로 사용 문서':'Macro-enabled document','확장자 없음':'No extension','파일명 끝의 점':'Trailing dot','문자 표시 방향':'Text-direction','추가 정리 불필요':'No extra cleanup for this target'};
for(const cases of [fixture.url,fixture.file,fixture.storage])for(const item of cases)for(const key of ['contains','absent','extension','cleanup'])if(fixtureLabels[item[key]])item[key]=fixtureLabels[item[key]];
rendered.set('tools/test-cases.json',JSON.stringify(fixture,null,2)+'\n');
const pending=[];
// New versions avoid serving cached Korean labels with English pages.
for(const [file,value] of rendered)if(file.endsWith('.html'))rendered.set(file,value.replace(/((?:src|href)="\/assets\/(?:style\.css|tools\.js|phone-cost\.js|storage-choice\.js|library\.js|backup-check\.(?:js|css)))(?:\?[^"\s]*)?("?)/g,'$1?v=20261005-en-1$2'));
for(const [file,html] of rendered)if(file!=='tools/test-cases.json'&&/[가-힣]/.test(html)){
 const nodes=html.match(/[^<>\r\n]*[가-힣][^<>\r\n]*/g)||[];
 for(const value of new Set(nodes))pending.push({file,value:value.trim()});
}
if(process.argv.includes('--pending')){const filter=process.argv[process.argv.indexOf('--pending')+1];console.log(JSON.stringify(pending.filter(item=>!filter||item.file.includes(filter)),null,2));process.exit(0);}
if(pending.length)throw new Error('English migration incomplete: '+pending.length+' untranslated segments. Use --pending to inspect.');
if(!process.argv.includes('--write')){console.log('Dry run: '+rendered.size+' English files. Add --write to apply.');process.exit(0);}
for(const [file,value] of rendered){
 fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),value.trimEnd()+'\n');
 fs.mkdirSync(path.dirname(path.join(root,'public',file)),{recursive:true});fs.writeFileSync(path.join(root,'public',file),value.trimEnd()+'\n');
}
console.log('Applied English edition: '+Object.keys(content).length+' articles, '+rendered.size+' files; canonical paths and first-publication dates retained.');
