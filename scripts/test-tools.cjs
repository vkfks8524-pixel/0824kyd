// Run with NODE_PATH pointing at the available Playwright installation.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tools/test-cases.json'), 'utf8'));
const results = [];
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
  const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
  res.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({executablePath: process.env.KYD_BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
  try {
    const page = await browser.newPage();
    const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = route.request().url();
      if (!url.startsWith(origin + '/')) { requests.push(url); return route.abort(); }
      return route.continue();
    });
    for (const test of cases.url) {
      await page.goto(origin + '/tools/url-structure-check/');
      await page.locator('#url-input').fill(test.input);
      await page.locator('#url-tool-form button').click();
      assert(await page.locator('#url-result').isVisible());
      const actual = await page.locator('#url-result').innerText();
      if (test.rejected) assert.match(actual, /분석할 수 없는|해석하지 못/);
      if (test.host) assert((await page.locator('#url-facts').innerText()).includes(test.host));
      if (test.contains) assert(actual.includes(test.contains));
      if (test.absent) assert(!actual.includes(test.absent));
      results.push('URL ' + test.input);
    }
    for (const test of cases.file) {
      await page.goto(origin + '/tools/file-extension-check/');
      await page.locator('#file-name-input').fill(test.input);
      await page.locator('#file-tool-form button').click();
      assert.equal(await page.locator('#file-extension').innerText(), test.extension);
      const actual = await page.locator('#file-findings').innerText();
      if (test.contains) assert(actual.includes(test.contains));
      if (test.absent) assert(!actual.includes(test.absent));
      assert.equal(await page.locator('#file-result img').count(), 0);
      results.push('FILE ' + test.input);
    }
    for (const test of cases.storage) {
      await page.goto(origin + '/tools/storage-planner/');
      await page.locator('#storage-total').fill(test.total);
      await page.locator('#storage-free').fill(test.free);
      await page.locator('#storage-target').selectOption(test.target);
      await page.locator('#storage-tool-form button').click();
      if (test.invalid) assert(await page.locator('#storage-error').isVisible());
      else assert.equal(await page.locator('#storage-cleanup-value').innerText(), test.cleanup);
      results.push('STORAGE ' + JSON.stringify(test));
    }
    await page.goto(origin + '/tools/account-security-check/');
    const boxes = page.locator('#account-tool-form input[type=checkbox]');
    for (const count of [0,3,8]) {
      for (let i=0;i<8;i++) await boxes.nth(i).setChecked(i<count);
      await page.locator('#account-tool-form button[type=submit]').click();
      assert.equal(await page.locator('#account-score').innerText(), ({0:0,3:50,8:100})[count] + ' / 100');
      assert.equal(await page.locator('#account-missing li').count(), 8-count);
      results.push('ACCOUNT ' + count + ' selected');
    }
    await page.locator('#account-tool-form button[type=reset]').click();
    assert.equal(await boxes.evaluateAll(list => list.filter(x=>x.checked).length),0);
    assert(!(await page.locator('#account-result').isVisible()));
    results.push('ACCOUNT reset');
    assert.deepEqual(requests, [], 'Tool pages must not send external requests');
    for (const slug of ['url-structure-check','file-extension-check']) {
      await page.goto(origin + '/tools/' + slug + '/');
      const samples = page.locator('[data-sample-for]');
      assert.equal(await samples.count(), 2);
      for (let i=0; i<2; i++) {
        const sample = samples.nth(i);
        const inputId = await sample.getAttribute('data-sample-for');
        const value = await sample.getAttribute('data-sample');
        await sample.click();
        assert.equal(await page.locator('#' + inputId).inputValue(), value);
        assert(await page.locator(slug.startsWith('url') ? '#url-result' : '#file-result').isVisible());
      }
    }
    assert.deepEqual(requests, [], 'Sample buttons must not send external requests');
    const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'kyd-quality-'));
    const routes = ['/', '/tools/', ...['url-structure-check','file-extension-check','storage-planner','account-security-check'].map(x=>'/tools/'+x+'/'), ...['windows-file-extension','pdf-link-safety','browser-cache-refresh','smartphone-storage-cleanup','cloudflare-pages-domain'].map(x=>'/posts/'+x+'/')];
    for (const width of [390,1280]) {
      await page.setViewportSize({width,height:844});
      for (const route of routes) {
        await page.goto(origin+route);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert(!overflow, 'Horizontal overflow at '+width+' '+route);
        const broken = await page.locator('a[href^="#"]').evaluateAll(links=>links.map(a=>a.getAttribute('href').slice(1)).filter(id=>id && !document.getElementById(id)));
        assert.deepEqual(broken, []);
      }
      await page.goto(origin+'/posts/windows-file-extension/');
      await page.screenshot({path:path.join(screenshots,'article-'+width+'.png'),fullPage:true});
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({passed:results.length,results,responsivePages:routes.length,resolutions:[390,1280],errors,screenshots,browser:await browser.version()},null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
