/* Progressive enhancement: articles and category anchors work without JavaScript. */
(() => {
  'use strict';
  const root = document.querySelector('#article-library');
  if (!root) return;
  const search = document.querySelector('#article-search');
  const sections = [...root.querySelectorAll('.topic-section')];
  const links = [...document.querySelectorAll('.library-filters a')];
  const status = document.querySelector('#search-status');
  const empty = document.querySelector('#search-empty');
  const legacy = document.querySelector('#legacy-guides');
  const groups = new Set(sections.map(section => section.id));
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g, ' ').trim();
  const cards = sections.flatMap(section => [...section.querySelectorAll('.post-card')].map(card => {
    // Photo credits are not search keywords; search the visible title and description only.
    const copy = [...card.children].filter(el => el.tagName !== 'FIGURE').map(el => el.textContent).join(' ');
    return { element: card, section, text: normalize(copy) };
  }));
  let category = 'all';
  function readCategory() {
    const id = location.hash.slice(1);
    category = groups.has(id) || id === 'legacy-guides' ? id : 'all';
  }
  function render() {
    const words = normalize(search.value).split(' ').filter(Boolean);
    let total = 0;
    for (const card of cards) {
      const inCategory = category === 'all' || category === card.section.id ||
        (category === 'legacy-guides' && !['sports', 'buying'].includes(card.section.id));
      const matches = inCategory && words.every(word => card.text.includes(word));
      card.element.hidden = !matches;
      if (matches) total++;
    }
    for (const section of sections) section.hidden = !cards.some(card => card.section === section && !card.element.hidden);
    legacy.hidden = !sections.some(section => !['sports', 'buying'].includes(section.id) && !section.hidden);
    for (const link of links) {
      if (link.hash.slice(1) === category) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    const selected = links.find(link => link.hash.slice(1) === category);
    const label = selected ? selected.childNodes[0].textContent.trim() : 'Earlier practical guides';
    status.textContent = label + ' · ' + total + ' articles' + (words.length ? ' · search results' : '');
    empty.hidden = total !== 0;
  }
  function reset() {
    search.value = '';
    category = 'all';
    history.replaceState(null, '', location.pathname + location.search + '#all');
    render();
    search.focus();
  }
  for (const link of links) link.addEventListener('click', event => {
    // Keep modifier-click and opening a category in a new tab native.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    category = link.hash.slice(1);
    history.pushState(null, '', link.hash);
    render();
  });
  search.addEventListener('input', render);
  document.querySelector('#search-reset').addEventListener('click', reset);
  document.querySelector('#empty-reset').addEventListener('click', reset);
  window.addEventListener('hashchange', () => { readCategory(); render(); });
  window.addEventListener('popstate', () => { readCategory(); render(); });
  readCategory();
  render();
  // Reserve the search panel in the initial HTML; enabling it does not move articles.
  search.disabled = false;
  document.querySelector('#search-reset').disabled = false;
  document.querySelector('.library-search').setAttribute('aria-busy', 'false');
})();
