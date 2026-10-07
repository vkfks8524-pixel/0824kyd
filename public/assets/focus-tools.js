(function () {
  'use strict';
  const MAX_BYTES = 32 * 1024 * 1024;
  const steps = [
    ['scope', 'Identify the folders and original formats you intend to preserve.'],
    ['status', 'Check the intended account and completed upload or copy status.'],
    ['export', 'Retrieve a sample into a separate, non-synchronized location.'],
    ['open', 'Open the retrieved photos; play video samples and check needed components.'],
    ['independent', 'Confirm a second copy is protected from the working library’s deletion path.'],
    ['access', 'Check how you would access the copy without the original phone.']
  ];
  function review(selected) {
    const chosen = new Set(selected);
    return {completed:steps.filter(([id]) => chosen.has(id)).length, remaining:steps.filter(([id]) => !chosen.has(id)).map(([,label]) => label)};
  }
  function number(value, min, max, integer = false) {
    if (String(value).trim() === '') throw new Error('Complete every field. Use 0 where appropriate.');
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw new Error('Check the ranges shown beside each field. Months must be a whole number.');
    return n;
  }
  function plan(values) {
    const current = number(values.current,0,1000000), growth = number(values.growth,0,100000), months = number(values.months,1,120,true);
    const versions = number(values.versions,0,1000000), reserve = number(values.reserve,0,50), free = number(values.free,0,10000000);
    const data = current + growth * months + versions;
    const budget = data / (1 - reserve / 100);
    return {current,growth,months,versions,reserve,free,data,budget,gib:budget*1e9/2**30,gap:Math.max(0,budget-free),headroom:Math.max(0,free-budget),stress:(current+2*growth*months+versions)/(1-reserve/100)};
  }
  function gibToGb(value) { return number(value,0,10000000)*2**30/1e9; }
  function validateSize(size) { if (!Number.isInteger(size) || size < 0 || size > MAX_BYTES) throw new Error('Choose files no larger than 32 MiB each. No comparison completed.'); }
  async function compareBytes(a,b,cryptoApi) {
    validateSize(a.byteLength); validateSize(b.byteLength);
    if (!cryptoApi?.subtle) throw new Error('This browser needs Web Crypto on HTTPS (or localhost). No comparison completed.');
    const hash = async bytes => Array.from(new Uint8Array(await cryptoApi.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
    let equal = a.length === b.length;
    if (equal) for (let i=0;i<a.length;i++) if (a[i]!==b[i]) { equal=false; break; }
    const hashA = await hash(a), hashB = await hash(b);
    return {equal,sizeA:a.byteLength,sizeB:b.byteLength,hashA,hashB};
  }
  if (typeof module !== 'undefined') module.exports = {MAX_BYTES,steps,review,plan,gibToGb,validateSize,compareBytes};
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  const format = n => n.toLocaleString('en-US',{maximumFractionDigits:2});
  function report(id,text) { $(id).textContent=text; }
  function clearReportPreview() { if($('report-preview'))$('report-preview').remove(); }
  function download(text,name) {
    clearReportPreview();
    // An on-page fallback remains usable in browsers that suppress blob downloads.
    const box=document.createElement('section');box.id='report-preview';box.className='tool-panel report-panel';
    const heading=document.createElement('h2');heading.textContent='Your text report';
    const message=document.createElement('p');message.className='micro';message.textContent='If a download does not start, select and copy the text below. Keep this report private.';
    const label=document.createElement('label');label.htmlFor='report-text';label.textContent='Report text';
    const textarea=document.createElement('textarea');textarea.id='report-text';textarea.readOnly=true;textarea.rows=12;textarea.value=text;
    box.append(heading,message,label,textarea);$('main-content').append(box);
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url;a.download=name;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    textarea.focus();
  }
  if ($('backup-form')) {
    let currentReport='';
    function renderReview() {
      clearReportPreview();
      const result=review(Array.from($('backup-form').querySelectorAll('input:checked'),i=>i.value));
      const headline=result.remaining.length ? `${result.completed} of 6 checks marked. ${result.remaining.length} still need evidence.` : 'All 6 checks marked by you. This is not a verification of your files.';
      report('backup-status',headline);
      $('backup-next').replaceChildren(...result.remaining.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
      currentReport=`KYD photo backup self-check\n${new Date().toISOString().slice(0,10)}\n${headline}\n\n${result.remaining.map(t=>'- '+t).join('\n')}\n\nSelf-reported checklist only. Not a recovery guarantee or permission to delete. https://www.kyd.kr/tools/photo-backup-check/`;
    }
    $('backup-form').addEventListener('submit',e=>{e.preventDefault();renderReview();});
    $('backup-form').addEventListener('change',renderReview);
    $('backup-form').addEventListener('reset',()=>setTimeout(renderReview,0));
    $('backup-save').addEventListener('click',()=>download(currentReport,'kyd-backup-check.txt'));
    renderReview();
  }
  if ($('space-form')) {
    let currentReport='';
    const ids=['current','growth','months','versions','reserve','free'];
    function calculate() {
      clearReportPreview();
      try {
        const r=plan(Object.fromEntries(ids.map(id=>[id,$('space-'+id).value])));
        report('space-error',''); $('space-result').hidden=false; $('space-save').disabled=false;
        report('space-total',`${format(r.budget)} GB`);
        report('space-equation',`(${format(r.current)} + ${format(r.growth)} × ${r.months} + ${format(r.versions)}) ÷ (1 − ${r.reserve}/100) = ${format(r.budget)} GB`);
        report('space-gap',r.gap>0?`Your entered free space is ${format(r.gap)} GB below this budget.`:`Your entered free space meets this budget, with ${format(r.headroom)} GB beyond it.`);
        report('space-units',`Same byte amount: ${format(r.gib)} GiB. With double monthly growth: ${format(r.stress)} GB.`);
        currentReport=`KYD new-copy space plan\n${new Date().toISOString().slice(0,10)}\n${$('space-equation').textContent}\nEntered free space: ${r.free} GB\n${$('space-gap').textContent}\n${$('space-units').textContent}\n\nEstimate for one new full copy. Not a device recommendation or backup guarantee. https://www.kyd.kr/tools/storage-planner/`;
      } catch(error) { report('space-error',error.message); $('space-result').hidden=true; $('space-save').disabled=true; currentReport=''; }
    }
    $('space-form').addEventListener('submit',e=>{e.preventDefault();calculate();});
    $('space-form').addEventListener('input',()=>{ clearReportPreview(); $('space-result').hidden=true; $('space-save').disabled=true; report('space-error','Inputs changed. Calculate again for an updated result.'); });
    $('space-example').addEventListener('click',()=>{ [120,4,12,30,20,200].forEach((v,i)=>$('space-'+ids[i]).value=v);calculate(); });
    $('space-save').addEventListener('click',()=>{if(currentReport)download(currentReport,'kyd-space-plan.txt');});
    $('unit-form').addEventListener('submit',e=>{e.preventDefault();try{report('unit-result',`${format(gibToGb($('unit-gib').value))} GB`);}catch{report('unit-result','Enter a GiB value from 0 to 10,000,000.');}});
  }
  if ($('file-form')) {
    let busy=false, currentReport='';
    const buttons=['file-run','file-demo','file-clear'];
    const invalidate=()=>{clearReportPreview();currentReport='';$('file-output').hidden=true;$('file-save').disabled=true;report('file-status','Selection changed. Compare again.');};
    $('file-a').addEventListener('change',invalidate);$('file-b').addEventListener('change',invalidate);
    const draw = (result,label) => {
      $('file-output').hidden=false;
      report('file-verdict',`${label}: ${result.equal?'Byte-identical':'Different contents'}`);
      report('file-sizes',`File A: ${format(result.sizeA)} bytes. File B: ${format(result.sizeB)} bytes.`);
      report('file-hash-a',result.hashA);report('file-hash-b',result.hashB);
      currentReport=`KYD local file comparison\n${new Date().toISOString()}\n${$('file-verdict').textContent}\n${$('file-sizes').textContent}\nSHA-256 A: ${result.hashA}\nSHA-256 B: ${result.hashB}\n\nNo filenames included. One pair only; not proof of media health, provenance or a complete backup. https://www.kyd.kr/tools/file-copy-check/`;
      $('file-save').disabled=false;
    };
    async function run(demo) {
      if (busy) return;busy=true;buttons.forEach(id=>$(id).disabled=true);$('file-a').disabled=true;$('file-b').disabled=true;invalidate();
      report('file-status',demo?'Running the built-in text fixtures…':'Reading the two selected files locally…');
      try {
        if(demo) {
          const e=new TextEncoder();const same=await compareBytes(e.encode('abc'),e.encode('abc'),globalThis.crypto);
          const different=await compareBytes(e.encode('abc'),e.encode('abd'),globalThis.crypto);
          if (!same.equal || different.equal || same.hashA!=='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad') throw new Error('Demo self-test failed. Do not rely on this session.');
          draw(different,'Demo: abc versus abd');report('file-status','Demo passed: abc / abc matched; abc / abd differed. No personal files were read.');
        } else {
          const a=$('file-a').files[0],b=$('file-b').files[0];if(!a||!b)throw new Error('Select File A and File B first.');
          validateSize(a.size);validateSize(b.size);
          const result=await compareBytes(new Uint8Array(await a.arrayBuffer()),new Uint8Array(await b.arrayBuffer()),globalThis.crypto);
          draw(result,'Selected pair');report('file-status','Comparison complete. Contents were not uploaded by this tool.');
        }
      } catch(error) { report('file-status',error.message||'Unable to read these files. No comparison completed.'); }
      finally {busy=false;buttons.forEach(id=>$(id).disabled=false);$('file-a').disabled=false;$('file-b').disabled=false;}
    }
    $('file-form').addEventListener('submit',e=>{e.preventDefault();run(false);});
    $('file-demo').addEventListener('click',()=>run(true));
    $('file-clear').addEventListener('click',()=>{ $('file-form').reset();invalidate();report('file-status','Selections and results cleared.'); });
    $('file-save').addEventListener('click',()=>{if(currentReport)download(currentReport,'kyd-file-comparison.txt');});
  }
  if ($('print-sheet')) $('print-sheet').addEventListener('click',()=>window.print());
})();
