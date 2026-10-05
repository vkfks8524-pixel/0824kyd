'use strict';
// Read-only content inventory used while adapting the English edition.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tables = process.argv[2] === '--tables';
const selected = process.argv.slice(tables ? 3 : 2);
const files = selected.length ? selected : fs.readdirSync(path.join(root, 'posts'), {withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>'posts/'+x.name+'/index.html');
for (const file of files) {
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const body=html.match(/<article class="article">([\s\S]*?)<\/article>/)?.[1] || html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || html;
  if (tables) {
    const cells=[...body.matchAll(/<(?:caption|th|td)\b[^>]*>([\s\S]*?)<\/(?:caption|th|td)>/g)].map(x=>x[1]);
    console.log('\nFILE '+file+'\n'+[...new Set(cells)].filter(x=>/[가-힣]/.test(x)).join('\n')); continue;
  }
  console.log('\nFILE '+file+'\nTITLE '+(html.match(/<title>(.*?)<\/title>/)?.[1]||''));
  console.log(body.replace(/<details class="reading-toc">[\s\S]*?<\/details>|<nav\b[\s\S]*?<\/nav>|<section class="next-reads">[\s\S]*?<\/section>/g,'').replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,'$2 [$1]').replace(/<\/(?:p|h[1-6]|li|tr|figcaption|summary|div|section)>/g,'\n').replace(/<\/(?:td|th)>/g,' | ').replace(/<[^>]+>/g,'').replace(/^[ \t]+/gm,'').replace(/\n\s*\n/g,'\n').trim());
}
