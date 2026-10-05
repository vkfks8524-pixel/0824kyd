'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const library = read('posts/index.html');
const article = read('posts/iphone-storage-choice/index.html');
assert(!/<div class="library-search"[^>]*\bhidden\b/.test(library));
assert(/<input id="article-search"[^>]*\bdisabled\b/.test(library));
assert(/<button id="search-reset"[^>]*\bdisabled\b/.test(library));
assert(!/<form id="storage-choice-form"[^>]*\bhidden\b/.test(article));
assert.equal((article.match(/<input id="choice-[^>]*\bdisabled\b/g) || []).length, 5);
assert(article.includes('120 + 6 × 36 + 30 + 40 = 406GB'));
assert(article.includes('Hypothetical usage log'));
assert(article.includes('content="2026-09-26"'));
assert(article.includes('"dateModified":"2026-10-05"'));
for (const slug of fs.readdirSync(path.join(root, 'posts')).filter(slug => fs.statSync(path.join(root, 'posts', slug)).isDirectory())) {
  assert(library.includes('href="/posts/' + slug + '/"'), 'Missing static article link: ' + slug);
}
for (const file of ['index.html', 'posts/index.html', 'posts/iphone-storage-choice/index.html']) {
  for (const [tag] of read(file).matchAll(/<img\b[^>]*>/g)) {
    assert(/width="\d+"/.test(tag) && /height="\d+"/.test(tag), 'Unreserved image: ' + file);
  }
}
// Unit-test enhancement with lightweight DOM doubles, not a browser session.
function node(text = '') {
  return {textContent: text, hidden: false, disabled: true, attributes: {}, events: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    addEventListener(name, handler) { this.events[name] = handler; }, focus() {}};
}
const sections = ['sports', 'buying'].map(id => {
  const section = node(); section.id = id;
  const card = node(); card.children = [{tagName: 'P', textContent: id === 'sports' ? 'LoL results' : 'iPhone storage'}];
  section.card = card; section.querySelectorAll = () => [card]; return section;
});
const links = ['all', 'sports', 'buying'].map(id => {
  const link = node(); link.hash = '#' + id; link.childNodes = [{textContent: id}]; return link;
});
const search = node(); search.value = '';
const panel = node(); Object.defineProperty(panel, 'hidden', {get: () => false, set: () => {throw new Error('Search panel must not appear late');}});
const nodes = {'#article-search': search, '#search-reset': node(), '#empty-reset': node(), '#search-status': node(), '#search-empty': node(), '#legacy-guides': node(), '.library-search': panel};
const location = {hash: '', pathname: '/posts/', search: ''};
const history = {pushState(_, __, hash) { location.hash = hash; }, replaceState(_, __, url) { location.hash = url.slice(url.indexOf('#')); }};
const context = {document: {querySelector: selector => selector === '#article-library' ? {querySelectorAll: () => sections} : nodes[selector], querySelectorAll: () => links}, location, history, window: {addEventListener() {}}};
vm.runInNewContext(read('assets/library.js'), context);
assert.equal(search.disabled, false);
assert.equal(nodes['#search-reset'].disabled, false);
assert.equal(panel.attributes['aria-busy'], 'false');
assert(sections.every(section => !section.hidden && !section.card.hidden));
search.value = 'IPHONE'; search.events.input();
assert.equal(sections[0].card.hidden, true);
assert.equal(sections[1].card.hidden, false);
nodes['#search-reset'].events.click();
assert(sections.every(section => !section.card.hidden));
links[1].events.click({preventDefault() {}, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false});
assert.equal(sections[0].card.hidden, false);
assert.equal(sections[1].card.hidden, true);
assert(!/fetch\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(read('assets/library.js')));
console.log('PASS: reserved search/calculator markup, static discovery, image dimensions, library enable/filter/reset and local-only inputs.');
