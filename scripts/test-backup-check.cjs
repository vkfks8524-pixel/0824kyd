'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {review,checks}=require('../assets/backup-check.js');
let combinations=0;
for(let mask=0;mask<64;mask++){
 const ids=checks.filter((_,i)=>mask&(1<<i)).map(([id])=>id);
 const result=review(ids);
 assert.equal(result.checked,ids.length);
 assert.deepEqual(result.remaining.map(r=>r.id),checks.filter(([id])=>!ids.includes(id)).map(([id])=>id));
 assert.equal(result.checked+result.remaining.length,6);
 assert(!('safe' in result));
 assert(!('verified' in result));
 assert(!/백업 성공|복구 가능합니다|삭제해도/.test(result.message));
 if(mask===63) assert(result.message.includes('복구 보증이 아닙니다'));
 combinations++;
}
assert.equal(review(['account','account','unknown']).checked,1);
assert.equal(review('<img src=x onerror=alert(1)>').checked,0);
assert.equal(review(null).checked,0);
assert.equal(review(undefined).checked,0);
// DOM doubles verify initialization/change/reset without automating a browser.
function node(){return {disabled:true,checked:false,value:'',textContent:'',hidden:false,children:[],events:{},attributes:{},
 addEventListener(name,fn){this.events[name]=fn;},setAttribute(name,v){this.attributes[name]=v;},
 replaceChildren(){this.children=[];},appendChild(child){this.children.push(child);},focus(){this.focused=true;}};}
const boxes=checks.map(([id])=>Object.assign(node(),{value:id}));
const button=node(),reset=node(),status=node(),list=node(),result=node();
const form=node();
form.querySelectorAll=()=>boxes;
form.querySelector=selector=>({'#backup-review':button,'#backup-reset':reset})[selector];
const nodes={'#backup-check-form':form,'#backup-status':status,'#backup-next':list,'#backup-result':result};
vm.runInNewContext(read('assets/backup-check.js'),{document:{querySelector:selector=>nodes[selector],createElement:()=>node()}});
assert(boxes.every(b=>!b.disabled));
assert.equal(button.disabled,false);assert.equal(reset.disabled,false);
assert.equal(form.attributes['aria-busy'],'false');
button.events.click();
assert(status.textContent.includes('0/6'));assert.equal(list.children.length,6);
boxes[0].checked=true;boxes[0].events.change();
assert(status.textContent.includes('1/6'));assert.equal(list.children.length,5);
for(const box of boxes)box.checked=true;
button.events.click();assert.equal(list.children.length,0);
boxes[0].checked=false;boxes[0].events.change();assert.equal(list.children.length,1);
reset.events.click();assert(boxes.every(b=>!b.checked));assert.equal(list.children.length,6);assert.equal(boxes[0].focused,true);
let prevented=false;form.events.submit({preventDefault(){prevented=true;}});assert(prevented);
const html=read('tools/photo-backup-check/index.html');
assert.equal((html.match(/type="checkbox"[^>]*disabled/g)||[]).length,6);
assert(html.includes('aria-busy="true"'));assert(html.includes('<noscript>'));
assert(!html.includes('pagead2.googlesyndication.com'));
assert(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie|innerHTML/.test(read('assets/backup-check.js')));
for(const slug of ['smartphone-photo-backup','used-phone-reset-check','cloud-storage-cleanup']){
 const h=read('posts/'+slug+'/index.html');
 assert(h.includes('"dateModified":"2026-10-05"'));
 assert(h.includes('자료')&&h.includes('가상'));
 assert(h.includes('공식 자료 최종 확인'));
 assert(h.includes('/tools/photo-backup-check/'));
 assert.equal((h.match(/<h1>/g)||[]).length,1);
 const toc=h.match(/<details class="reading-toc">([\s\S]*?)<\/details>/)[1];
 for(const [,id] of toc.matchAll(/href="#([^"]+)"/g))assert(h.includes('id="'+id+'"'));
 assert.equal(read('public/posts/'+slug+'/index.html'),h);
}
for(const p of ['assets/backup-check.js','assets/backup-check.css','tools/photo-backup-check/index.html']){
 assert.equal(read('public/'+p),read(p));
}
assert(read('sitemap.xml').includes('https://www.kyd.kr/tools/photo-backup-check/'));
assert(read('tools/index.html').includes('/tools/photo-backup-check/'));
console.log('PASS: '+combinations+' checklist combinations, duplicate/invalid input, initialization, change invalidation, submit/reset, no transmission/ad code, article metadata/anchors and deployment mirrors.');
