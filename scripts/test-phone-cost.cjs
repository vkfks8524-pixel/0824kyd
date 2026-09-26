'use strict';
const assert = require('node:assert/strict');
const {calculate, compare} = require('../assets/phone-cost.js');
const zero={device:0,initialRate:0,initialMonths:0,laterRate:0,extras:0,fees:0,resale:0};
const a={device:1990000,initialRate:25000,initialMonths:6,laterRate:25000,extras:0,fees:0,resale:400000};
const b={device:1590000,initialRate:90000,initialMonths:6,laterRate:55000,extras:5000,fees:100000,resale:400000};
let passed=0;
function test(name, run) { run(); passed++; console.log('PASS '+name); }
test('published example totals',()=>assert.deepEqual(compare(a,b,24),{
  a:{device:1990000,telecom:600000,addons:0,fees:0,gross:2590000,resale:400000,net:2190000,average:91250},
  b:{device:1590000,telecom:1530000,addons:120000,fees:100000,gross:3340000,resale:400000,net:2940000,average:122500},
  difference:750000
}));
test('same quotes tie',()=>assert.equal(compare(a,a,24).difference,0));
test('reverse order',()=>assert.equal(compare(b,a,24).difference,-750000));
test('zero prices valid',()=>assert.equal(calculate(zero,24).net,0));
test('no initial period',()=>assert.equal(calculate({...zero,initialRate:99999,laterRate:30000},24).telecom,720000));
test('entire initial period',()=>assert.equal(calculate({...zero,initialRate:25000,initialMonths:24,laterRate:99999},24).telecom,600000));
test('one month',()=>assert.equal(calculate({...zero,laterRate:25000},1).net,25000));
test('60 months',()=>assert.equal(calculate({...zero,laterRate:25000},60).net,1500000));
test('full principal not amortized',()=>assert.equal(calculate({...zero,device:1200000},12).net,1200000));
test('fees counted once',()=>assert.equal(calculate({...zero,fees:10000},24).net,10000));
test('monthly extras counted each month',()=>assert.equal(calculate({...zero,extras:5000},24).net,120000));
test('sale deducted once',()=>assert.equal(calculate({...zero,device:1000000,resale:400000},24).net,600000));
test('negative net retained for warning',()=>assert.equal(calculate({...zero,resale:1000},24).net,-1000));
test('same resale change preserves gap',()=>assert.equal(compare({...a,resale:0},{...b,resale:0},24).difference,750000));
test('one extra monthly 10000 means 240000',()=>assert.equal(compare({...zero,laterRate:10000},zero,24).difference,-240000));
for (const months of [0,-1,61,1.5,NaN,Infinity,'24']) test('invalid months '+months,()=>assert.throws(()=>calculate(zero,months)));
for (const value of [-1,1.5,NaN,Infinity,100000001,'10']) test('invalid amount '+value,()=>assert.throws(()=>calculate({...zero,device:value},24)));
test('missing field',()=>assert.throws(()=>calculate({},24)));
test('initial months exceeds term',()=>assert.throws(()=>calculate({...zero,initialMonths:25},24)));
test('initial months integer',()=>assert.throws(()=>calculate({...zero,initialMonths:0.5},24)));
console.log('Phone cost calculation tests: '+passed+' passed.');
