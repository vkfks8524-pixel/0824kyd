'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { calculate } = require('../assets/storage-choice.js');
const cases = [
  [[90,1,24,20,30],164,212],
  [[160,4,24,30,40],326,374],
  [[100,2,24,80,40],268,316],
  [[120,2,36,30,0],222,294],
  [[0,0,1,0,0],0,2],
  [[100,0,24,100,56],256,304],
  [[400,0,24,100,12],512,560],
  [[90.5,1.2,24,20.1,30.3],169.7,217.7],
  [[10000,1000,120,10000,10000],150000,150240],
];
for (const [values, planned, higher] of cases) {
  const answer = calculate(values);
  assert(Math.abs(answer.planned - planned) < 1e-8);
  assert(Math.abs(answer.higherGrowth - higher) < 1e-8);
}
for (const values of [null,[],[1,2],[1,2,3,4,5,6],[NaN,1,24,1,1],[Infinity,1,24,1,1],['90',1,24,1,1],[-1,1,24,1,1],[1,-1,24,1,1],[1,1,0,1,1],[1,1,1.5,1,1],[1,1,121,1,1],[10001,1,24,1,1],[1,1001,24,1,1],[1,1,24,-1,1],[1,1,24,1,-1]]) assert.throws(() => calculate(values), RangeError);
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root,'posts/iphone-storage-choice/index.html'),'utf8');
for (const id of ['storage-choice-form','storage-choice-result','storage-calculator','choice-used','choice-growth','choice-months','choice-temporary','choice-reserve']) assert(html.includes('id="'+id+'"'));
const rss = fs.readFileSync(path.join(root,'rss.xml'),'utf8');
assert(!rss.includes('<form'));
assert(rss.includes('https://www.kyd.kr/posts/iphone-storage-choice/#storage-calculator'));
assert(!/fetch\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(fs.readFileSync(path.join(root,'assets/storage-choice.js'),'utf8')));
console.log('PASS: 9 calculation cases, 16 invalid cases, article integration, portable RSS and no network/storage API.');
