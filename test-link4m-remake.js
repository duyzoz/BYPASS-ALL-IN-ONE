// Mock tests for link4m-remake.user.js v0.6 — jsdom only, no network, no real account.
// Run: NODE_PATH=~/workspace/deobf-cakj/node_modules node test-link4m-remake.js
// Fake values only: FAKEKEY / FAKECODE* / fake domains. Nothing real is submitted.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'link4m-remake.user.js'), 'utf8');
let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS', name); }
  else { failed++; console.log('FAIL', name, extra || ''); }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const html = `<!DOCTYPE html><html><head><title>Link4m - Get Link</title></head><body>
    <div id="advertise-html-wrapper">Bước 1: Mở trình duyệt. Bước 2: Gõ tìm từ khóa. Bước 3: Bấm vào website kqbd***.site ở trang 1. Bước 4: Quay lại nhập mã.</div>
    <input type="hidden" name="alias" value="ALIAS1">
    <input type="hidden" name="campaign_id" value="CAMP1">
    <input type="hidden" name="display_id" value="DISP1">
    <input type="hidden" name="prefix" value="PRE1">
    <input name="code" value="">
  </body></html>`;
  const dom = new JSDOM(html, { url: 'https://link4m.com/go/test', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  // jsdom 30 does not implement innerText (undefined) — the deobf reads
  // document.body.innerText (works in a real browser). Polyfill it from
  // textContent so the test env behaves like Tampermonkey. NOT a script bug.
  Object.defineProperty(w.HTMLElement.prototype, 'innerText', {
    get() { return this.textContent; },
    set(v) { this.textContent = v; },
    configurable: true
  });
  const store = {};
  w.GM_getValue = (k, d) => (k in store ? store[k] : d);
  w.GM_setValue = (k, v) => { store[k] = v; };
  w.GM_setClipboard = () => {};
  w.GM_info = { script: { version: '0.6.0' } };
  const reqLog = [];
  w.GM_xmlhttpRequest = (opts) => {
    reqLog.push({ method: (opts.method || 'GET').toUpperCase(), url: opts.url, data: opts.data || null });
    setTimeout(() => {
      if (opts.url.includes('/links/get-link-info')) {
        opts.onload({ status: 200, statusText: 'OK', responseText: JSON.stringify({ url: 'https://dest.test/fake' }), finalUrl: opts.url });
      } else if (/^https:\/\/(kqbdaliga\.site|example-task\.com)/.test(opts.url)) {
        opts.onload({ status: 200, statusText: 'OK', responseText: '<html><body><script src="https://widget.test/widget/service.js?key=FAKEKEY"></script></body></html>', finalUrl: opts.url });
      } else {
        opts.onload({ status: 200, statusText: 'OK', responseText: '{}', finalUrl: opts.url });
      }
    }, 0);
  };
  let unhandled = null;
  process.on('unhandledRejection', (e) => { unhandled = e; });

  w.eval(src);
  await sleep(100); // let the eval-time auto workflow settle (mask gate, no network)
  const T = w.__LINK4M_TEST__;
  check('test hook exposed', !!T);
  if (!T) { console.log('passed', passed, 'failed', failed); process.exit(1); }
  check('no unhandled rejection from eval-time auto run', !unhandled, String(unhandled));
  check('panel exists (deobf Shadow DOM HUD kept)', !!w.document.getElementById('l4m-bypass-host'));
  check('UI version 0.6.0', T.UI.version === '0.6.0', T.UI.version);

  // ---- (c) getClientId: bootstrap already called it, stable + persisted ----
  check('bootstrap persisted _traffic_cid_ (P1)', typeof store['_traffic_cid_'] === 'string' && store['_traffic_cid_'].startsWith('cid-'), JSON.stringify(store));
  const id1 = T.getClientId(); const id2 = T.getClientId();
  check('getClientId stable across calls (P1)', !!id1 && id1 === id2 && store['_traffic_cid_'] === id1);
  check('getClientId format cid-<hex><hex> (P1)', /^cid-[0-9a-f]+$/.test(id1), id1);

  // ---- (d) structure intact ----
  check('UI.init exists', typeof T.UI.init === 'function');
  check('Engine.runAutoWorkflow exists', typeof T.Engine.runAutoWorkflow === 'function');
  check('Engine.submitFinalLink KEPT intact', typeof T.Engine.submitFinalLink === 'function');
  check('Engine.fillCodeOnly exists (P3)', typeof T.Engine.fillCodeOnly === 'function');
  check('OCREngine.scanAdvertiserImages exists', typeof T.OCREngine.scanAdvertiserImages === 'function');
  check('DomainMatcher.matchMask exists', typeof T.DomainMatcher.matchMask === 'function');
  // Deobf section comment claims 178 TLDs, but the verbatim array literal has 134.
  check('TLD list kept verbatim from deobf (134 entries)', Array.isArray(T.TLDS) && T.TLDS.length === 134, 'len=' + (T.TLDS && T.TLDS.length));
  check('no auto-submit call left in source (P3)', !src.includes('await this.submitFinalLink(foundCode)'));
  check('fillCodeOnly wired in runManualUrlBypass (P3)', src.includes('this.fillCodeOnly(foundCode)'));

  // ---- (a) mask check: unit level ----
  check('extractMaskFromText finds kqbd***.site (P2)', T.DomainMatcher.extractMaskFromText('Bấm vào website kqbd***.site ở trang 1') === 'kqbd***.site');
  check('extractMaskFromText null for full domain (P2)', T.DomainMatcher.extractMaskFromText('Truy cập example-task.com để lấy mã') === null);
  check('extractMaskFromText null for empty (P2)', T.DomainMatcher.extractMaskFromText('') === null);
  check('matchMask accepts exact OCR domain (P2)', T.DomainMatcher.matchMask('kqbdaliga.site', 'kqbd***.site') === true);
  check('matchMask rejects other TLD (P2)', T.DomainMatcher.matchMask('kqbdaliga.net', 'kqbd***.site') === false);
  check('matchMask rejects unrelated domain (P2)', T.DomainMatcher.matchMask('google.com', 'kqbd***.site') === false);

  // ---- (a) mask check: e2e REJECT — OCR domain does not match mask -> STOP, no fetch ----
  const reqBeforeReject = reqLog.length;
  T.OCREngine.scanAdvertiserImages = async () => 'Truy cập example-task.com rồi tìm';
  await T.Engine.runAutoWorkflow();
  check('mask REJECT: status says stop, no guessing (P2)', /không khớp mặt nạ/.test(T.UI.statusText.textContent), T.UI.statusText.textContent);
  check('mask REJECT: no widget fetch attempted (P2)', reqLog.length === reqBeforeReject, 'reqs=' + (reqLog.length - reqBeforeReject));

  // ---- (a)+(b) mask ACCEPT + fill-only e2e: OCR domain matches mask -> widget -> fill only ----
  T.OCREngine.scanAdvertiserImages = async () => 'KQBD Kết Quả Bóng Đá https://kqbdaliga.site/ Tin Tức';
  T.Engine.executeWidgetWorkflow = async () => 'FAKECODE99'; // skip real 45s+30s countdowns
  const reqBeforeAccept = reqLog.length;
  await T.Engine.runAutoWorkflow();
  const fetchedTarget = reqLog.slice(reqBeforeAccept).some(r => r.url === 'https://kqbdaliga.site');
  check('mask ACCEPT: proceeded to fetch matched target domain (P2)', fetchedTarget, JSON.stringify(reqLog.slice(reqBeforeAccept)));
  const pageInput = w.document.querySelector('input[name="code"]');
  check('fill-only: page code input filled with widget code (P3)', pageInput && pageInput.value === 'FAKECODE99', pageInput && pageInput.value);
  check('fill-only: panel input shows code (P3)', T.UI.urlInput && T.UI.urlInput.value === 'FAKECODE99', T.UI.urlInput && T.UI.urlInput.value);
  check('fill-only: status tells user to submit + solve captcha (P3)', /tự bấm Nộp/.test(T.UI.statusText.textContent), T.UI.statusText.textContent);
  check('fill-only: pendingCode stored (P3)', T.Engine.pendingCode === 'FAKECODE99');
  check('fill-only: NO POST to /links/get-link-info (P3)', !reqLog.some(r => r.url.includes('/links/get-link-info')), JSON.stringify(reqLog.map(r => r.url)));
  check('fill-only: "Nộp ngay" button enabled after fill (P3)', T.UI.btnSubmitNow && T.UI.btnSubmitNow.disabled === false);

  // ---- (b) "Nộp ngay" button calls submitFinalLink only on click ----
  let submitted = null;
  const origSubmit = T.Engine.submitFinalLink;
  T.Engine.submitFinalLink = async (code) => { submitted = code; };
  T.Engine.fillCodeOnly('FILLTEST1');
  check('fillCodeOnly alone does NOT call submitFinalLink (P3)', submitted === null);
  check('fillCodeOnly sets pendingCode (P3)', T.Engine.pendingCode === 'FILLTEST1');
  T.UI.shadow.getElementById('btnSubmitNow').click();
  await sleep(50);
  check('"Nộp ngay" click calls submitFinalLink with pending code (P3)', submitted === 'FILLTEST1', String(submitted));
  T.Engine.submitFinalLink = origSubmit;

  // ---- (a) no-mask passthrough: full domain in text, no mask -> proceeds as deobf did ----
  w.document.getElementById('advertise-html-wrapper').textContent = 'Bước 3: Truy cập website example-task.com để lấy mã. Bước 4: Quay lại.';
  T.OCREngine.scanAdvertiserImages = async () => { throw new Error('OCR must not run when text already has a domain'); };
  const reqBeforePass = reqLog.length;
  await T.Engine.runAutoWorkflow();
  check('no-mask passthrough: fetched text domain without OCR (P2)', reqLog.slice(reqBeforePass).some(r => r.url === 'https://example-task.com'), JSON.stringify(reqLog.slice(reqBeforePass)));
  check('no-mask passthrough: still fill-only, no POST (P3)', !reqLog.slice(reqBeforePass).some(r => r.url.includes('/links/get-link-info')));

  console.log('---');
  console.log('passed', passed, 'failed', failed);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
