// ==UserScript==
// @name         GTraffic Bypass (Duyzoz)
// @namespace    https://gtraffic.io/
// @version      3.0.0
// @description  Bypass tự động GTraffic - OCR nhận diện ảnh, tab ngầm đếm ngược, tự copy mã
// @match        https://gtraffic.io/*
// @match        http://gtraffic.io/*
// @match        https://*.gtraffic.io/*
// @match        *://*/*
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/assets/icon.png
// @author       Duyzoz
// @updateURL    https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/gtraffic.user.js
// @downloadURL  https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/gtraffic.user.js
// @connect      api.ocr.space
// @connect      cdn.gtraffic.io
// @connect      *
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @grant        GM_addValueChangeListener
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @grant        window.close
// ==/UserScript==

/* =========================================================================
   GTraffic Bypass All-In-One (Duyzoz Edition) - v3.0.0 Monolithic
   - KHÔNG dùng @require (tránh hoàn toàn lỗi Tampermonkey cache vĩnh viễn)
   - Tự động hiện Cyber HUD 100% trên gtraffic.io (miễn nhiễm Vue/React hydrate)
   - Tab ngầm nhận diện target site, fake referrer, chống freeze, auto-click
   - OCR.space trích xuất domain tự động + Pool Database
   ========================================================================= */

(function () {
  'use strict';

  const OCR_API_KEY  = "K84564487988957";
  const OCR_API_URL  = "https://api.ocr.space/parse/image";
  const DISCORD_URL  = "https://discord.gg/vnbp";

  const KEY_POOL     = "gtraffic_pool_db";
  const KEY_SETTINGS = "gtraffic_settings";
  const KEY_SESSION  = "gtraffic_active_session";
  const KEY_PING     = "gtraffic_sync_ping";
  const KEY_DONE     = "gtraffic_sync_done";

  const isGTraffic   = /gtraffic\.io/i.test(window.location.hostname);

  // ===========================================================================
  // UTILS
  // ===========================================================================

  function copyToClipboard(text) {
    if (typeof GM_setClipboard === "function") {
      try { GM_setClipboard(text, "text"); return true; } catch (_) {}
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    Object.assign(ta.style, { position: "fixed", top: "-9999px", left: "-9999px" });
    (document.body || document.documentElement).appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    ta.remove();
    return true;
  }

  function sanitizeUrl(raw) {
    if (!raw) return "";
    let u = raw.trim().split(/[\s\>\›\|\—\–]/)[0];
    u = u.replace(/[^\x21-\x7E]/g, "");
    u = u.replace(/^(https?:\/\/)?[.\-_*~]+/, "$1");
    u = u.replace(/[.\-_*~,;:!?]+$/, "");
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try {
      const parsed = new URL(u);
      if (parsed.hostname.includes("xn--")) return "";
      return parsed.origin + "/";
    } catch (_) {
      return u.endsWith("/") ? u : u + "/";
    }
  }

  function getPool()       { return GM_getValue(KEY_POOL, {}); }
  function savePool(p)     { GM_setValue(KEY_POOL, p); }
  function getSettings()   { return GM_getValue(KEY_SETTINGS, { autoRun: true }); }
  function saveSettings(s) { GM_setValue(KEY_SETTINGS, s); }

  function waitForBody(cb) {
    if (document.body) { cb(); return; }
    const id = setInterval(() => {
      if (document.body) { clearInterval(id); cb(); }
    }, 20);
  }

  // ===========================================================================
  // ★ TARGET WEBSITE MODE (tab ngầm chạy trên website đích)
  //   Chỉ kích hoạt nếu trang này đúng là trang được mở bởi phiên GTraffic
  // ===========================================================================
  if (!isGTraffic) {
    let session = null;
    try {
      session = GM_getValue(KEY_SESSION, null);
    } catch (_) { return; }

    // Nếu không có session đang chờ lấy mã -> thoát ngay lập tức, không ảnh hưởng web khác
    if (!session || !session.targetUrl || !session.key) return;

    // Session hết hạn sau 10 phút
    if (Date.now() - (session.ts || 0) > 600000) return;

    // Kiểm tra hostname có liên quan đến targetUrl không
    try {
      const targetHost = new URL(session.targetUrl).hostname.replace(/^www\./, "").toLowerCase();
      const currentHost = window.location.hostname.replace(/^www\./, "").toLowerCase();
      if (!currentHost.includes(targetHost) && !targetHost.includes(currentHost)) {
        return; // Không phải web đích -> thoát ngay
      }
    } catch (_) {
      return;
    }

    // 1. Fake Google Referrer
    try {
      Object.defineProperty(document, "referrer", { get: () => "https://www.google.com/", configurable: true });
    } catch (_) {}

    // 2. Chống đóng băng tab khi chạy ngầm
    const BLOCKED_EVENTS = ["visibilitychange", "webkitvisibilitychange", "blur", "focusout", "pagehide"];
    const _origAEL = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, fn, opts) {
      if (BLOCKED_EVENTS.includes(type)) return;
      return _origAEL.apply(this, arguments);
    };
    for (const [k, v] of Object.entries({
      hidden: false, webkitHidden: false,
      visibilityState: "visible", webkitVisibilityState: "visible"
    })) {
      try { Object.defineProperty(document, k, { get: () => v, configurable: true }); } catch (_) {}
    }
    try { document.hasFocus = () => true; } catch (_) {}
    window.onblur = null;
    window.requestAnimationFrame = cb => window.setTimeout(() => cb(performance.now()), 16);
    window.cancelAnimationFrame  = id => window.clearTimeout(id);

    // 3. Khởi chạy agent tự động click nút & đồng bộ countdown
    waitForBody(() => runTargetAgent());
    return;
  }

  // ===========================================================================
  // TARGET AGENT (chạy trong tab ngầm lấy mã)
  // ===========================================================================
  function runTargetAgent() {
    let hasClicked = false;
    let lastSec    = null;

    const loop = setInterval(() => {
      const session = GM_getValue(KEY_SESSION, null);
      if (!session || !session.key) return;

      // 1. Auto-click nút lấy mã #avt-btn
      const btn = document.querySelector("#avt-btn")
               || document.querySelector('[class*="avt-btn"]')
               || document.querySelector('[id*="lay-ma"]')
               || document.querySelector('[class*="lay-ma"]');

      if (btn && btn.isConnected && !hasClicked) {
        Object.assign(btn.style, {
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: "2147483647", outline: "4px solid red"
        });
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        ["mousedown", "mouseup", "click"].forEach(t =>
          btn.dispatchEvent(new MouseEvent(t, { view: window, bubbles: true, cancelable: true, clientX: cx, clientY: cy }))
        );
        hasClicked = true;
      }

      // 2. Đồng bộ thời gian đếm ngược về tab mẹ (GTraffic HUD)
      let sec = null;
      for (const el of document.querySelectorAll('[class*="timer"],[class*="countdown"],[id*="count"],.countdown')) {
        const m = (el.innerText || "").match(/(\d{1,3})/);
        if (m && +m[1] > 0 && +m[1] <= 180) { sec = +m[1]; break; }
      }
      if (sec !== null && sec !== lastSec) {
        lastSec = sec;
        GM_setValue(KEY_PING, { key: session.key, seconds: sec, ts: Date.now() });
      }

      // 3. Khi xuất hiện mã -> tự động copy và báo về tab mẹ
      const codeEl = document.querySelector('.trade-btn__content.copy-allowed,[class*="copy-allowed"]');
      if (codeEl) {
        const code = (codeEl.textContent || "").replace(/\s+/g, "").trim();
        if (code.length >= 4) {
          copyToClipboard(code);
          Object.assign(codeEl.style, { backgroundColor: "#22c55e", color: "#fff" });
          GM_setValue(KEY_DONE, { key: session.key, code, ts: Date.now() });
          GM_deleteValue(KEY_SESSION);
          clearInterval(loop);
          setTimeout(() => { try { window.close(); } catch(_) {} }, 1500);
        }
      }
    }, 600);
  }

  // ===========================================================================
  // ★ GTRAFFIC MASTER PAGE MODE — BẢO ĐẢM HIỆN HUD 100%
  // ===========================================================================

  function tryMount() {
    if (!isGTraffic) return;
    if (document.getElementById("gtraffic-hud-container")) return;
    const parent = document.body || document.documentElement;
    if (!parent) return;
    mountHud();
  }

  // Khởi chạy đa tầng:
  // 1. Ngay khi có thể
  tryMount();

  // 2. Khi body sẵn sàng
  waitForBody(tryMount);

  // 3. Khi DOMContentLoaded
  document.addEventListener("DOMContentLoaded", tryMount);

  // 4. Khi window.load
  window.addEventListener("load", tryMount);

  // 5. MutationObserver bắt mọi thay đổi DOM (Next.js/React re-render)
  (function startObserver() {
    if (document.documentElement) {
      const obs = new MutationObserver(() => {
        if (!document.getElementById("gtraffic-hud-container")) {
          tryMount();
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } else {
      setTimeout(startObserver, 50);
    }
  })();

  // 6. Heartbeat kiểm tra định kỳ mỗi 1 giây (nếu bị xóa sẽ tự mọc lại ngay)
  setInterval(() => {
    if (isGTraffic && !document.getElementById("gtraffic-hud-container")) {
      tryMount();
    }
  }, 1000);

  // ===========================================================================
  // MOUNT HUD
  // ===========================================================================
  function mountHud() {
    if (document.getElementById("gtraffic-hud-container")) return;

    const pathMatch = window.location.pathname.match(/^\/([a-zA-Z0-9_-]+)/);
    const taskKey   = pathMatch ? pathMatch[1] : "UNKNOWN";

    // ── CSS INJECTION ────────────────────────────────────────────────────────
    const styleId = "gtraffic-hud-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
#gtraffic-hud-container {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  width: 375px !important;
  max-width: 95vw !important;
  background: #0f172a !important;
  border: 1px solid #1e293b !important;
  border-radius: 14px !important;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.85) !important;
  color: #f1f5f9 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  font-size: 13px !important;
  z-index: 2147483647 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  user-select: none !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}
#gtraffic-hud-container * {
  box-sizing: border-box !important;
}
.gt-hdr {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 11px 14px !important;
  background: #0a1628 !important;
  border-bottom: 1px solid #1e293b !important;
  cursor: grab !important;
}
.gt-dot {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: #38bdf8 !important;
  box-shadow: 0 0 8px #38bdf8 !important;
  flex-shrink: 0 !important;
}
.gt-title {
  font-weight: 700 !important;
  font-size: 14px !important;
  color: #fff !important;
  margin-left: 8px !important;
}
.gt-author {
  color: #94a3b8 !important;
  font-weight: 400 !important;
  font-size: 12px !important;
}
.gt-badge {
  background: #1e293b !important;
  border: 1px solid #f59e0b !important;
  color: #f59e0b !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  padding: 3px 10px !important;
  border-radius: 20px !important;
  max-width: 165px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
.gt-badge.ok   { border-color: #22c55e !important; color: #22c55e !important; }
.gt-badge.info { border-color: #38bdf8 !important; color: #38bdf8 !important; }
.gt-badge.err  { border-color: #ef4444 !important; color: #ef4444 !important; }

.gt-body {
  padding: 12px 14px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 9px !important;
}
.gt-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}
.gt-lbl {
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #94a3b8 !important;
}
.gt-link {
  background: none !important;
  border: none !important;
  color: #38bdf8 !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  padding: 0 !important;
}
.gt-link:hover { text-decoration: underline !important; }
.gt-input {
  width: 100% !important;
  background: #020617 !important;
  border: 1px solid #1e293b !important;
  border-radius: 7px !important;
  padding: 7px 10px !important;
  color: #fff !important;
  font-size: 12px !important;
  outline: none !important;
  font-family: Consolas, monospace !important;
}
.gt-input:focus { border-color: #0284c7 !important; }
.gt-ctrls {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-top: 2px !important;
}
.gt-chk-lbl {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  font-size: 12px !important;
  color: #cbd5e1 !important;
  cursor: pointer !important;
  flex: 1 !important;
}
.gt-btn {
  border: none !important;
  font-weight: 700 !important;
  font-size: 12.5px !important;
  padding: 8px 14px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: .15s !important;
}
.gt-btn.blue { background: #0284c7 !important; color: #fff !important; }
.gt-btn.blue:hover { background: #0369a1 !important; }
.gt-btn.gray { background: #1e293b !important; border: 1px solid #334155 !important; color: #f1f5f9 !important; }
.gt-btn.gray:hover { background: #334155 !important; }

.gt-log {
  background: #020617 !important;
  border: 1px solid #1e293b !important;
  border-radius: 8px !important;
  padding: 8px 11px !important;
  font-size: 11.5px !important;
  color: #38bdf8 !important;
  font-family: Consolas, monospace !important;
  min-height: 44px !important;
  display: flex !important;
  align-items: center !important;
  word-break: break-all !important;
  line-height: 1.45 !important;
}
.gt-discord {
  background: #5865f2 !important;
  border: none !important;
  color: #fff !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  padding: 8px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  text-decoration: none !important;
  transition: .15s !important;
}
.gt-discord:hover { background: #4752c4 !important; }

.gt-overlay {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0, 0, 0, .78) !important;
  z-index: 2147483648 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.gt-modal {
  background: #0f172a !important;
  border: 1px solid #334155 !important;
  border-radius: 12px !important;
  width: 460px !important;
  max-width: 92vw !important;
  padding: 16px !important;
  color: #f8fafc !important;
}
.gt-modal-hdr {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 10px !important;
}
.gt-pool-list {
  max-height: 220px !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 5px !important;
  margin: 8px 0 !important;
}
.gt-pi {
  background: #020617 !important;
  padding: 7px 10px !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 12px !important;
}
.gt-pi-key {
  font-weight: 700 !important;
  color: #38bdf8 !important;
  min-width: 75px !important;
  flex-shrink: 0 !important;
}
.gt-pi-url {
  flex: 1 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  margin: 0 8px !important;
  color: #94a3b8 !important;
}
.gt-pi-del {
  background: none !important;
  border: none !important;
  color: #ef4444 !important;
  cursor: pointer !important;
  font-weight: 700 !important;
}
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    // ── HTML INJECTION ───────────────────────────────────────────────────────
    const hud = document.createElement("div");
    hud.id = "gtraffic-hud-container";
    hud.innerHTML = `
<div class="gt-hdr" id="gt-drag-handle">
  <div style="display:flex;align-items:center"><span class="gt-dot"></span><span class="gt-title">gtraffic bypass <span class="gt-author">(Duyzoz)</span></span></div>
  <div class="gt-badge" id="gt-badge">Sẵn sàng</div>
</div>
<div class="gt-body">
  <div class="gt-row">
    <span class="gt-lbl">Tự động quét ảnh → URL &amp; Key</span>
    <button class="gt-link" id="gt-rescan">Quét lại</button>
  </div>
  <div class="gt-row">
    <span class="gt-lbl">URL / Link đích</span>
    <button class="gt-link" id="gt-ocrkey">Quét Key</button>
  </div>
  <input class="gt-input" id="gt-url" placeholder="https://domain-dich.com/">
  <div>
    <span class="gt-lbl" style="display:block;margin-bottom:4px">Key nhiệm vụ</span>
    <input class="gt-input" id="gt-key" value="${taskKey}" readonly>
  </div>
  <div class="gt-ctrls">
    <label class="gt-chk-lbl"><input type="checkbox" id="gt-auto"> Tự động chạy</label>
    <button class="gt-btn blue" id="gt-start">Lấy mã ngay</button>
    <button class="gt-btn gray" id="gt-pool">+Pool</button>
  </div>
  <div class="gt-log" id="gt-log">Đang chờ quét nhiệm vụ...</div>
  <a class="gt-discord" href="${DISCORD_URL}" target="_blank">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
    Join Discord nhận bản cập nhật
  </a>
</div>`;

    const parent = document.body || document.documentElement;
    parent.appendChild(hud);

    makeDraggable(hud, hud.querySelector("#gt-drag-handle"));
    bindEvents(taskKey, hud);
  }

  // ── DRAG LOGIC ─────────────────────────────────────────────────────────────
  function makeDraggable(el, handle) {
    let x0, y0, l0, t0;
    handle.addEventListener("mousedown", e => {
      const rect = el.getBoundingClientRect();
      x0 = e.clientX; y0 = e.clientY;
      l0 = rect.left; t0 = rect.top;
      el.style.bottom = "auto"; el.style.right = "auto";
      el.style.left = l0 + "px"; el.style.top = t0 + "px";
      const onMove = e2 => {
        el.style.left = (l0 + e2.clientX - x0) + "px";
        el.style.top  = (t0 + e2.clientY - y0) + "px";
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      e.preventDefault();
    });
  }

  // ── BIND EVENTS ────────────────────────────────────────────────────────────
  function bindEvents(taskKey, hud) {
    const $id    = id => hud.querySelector("#" + id);
    const badge  = $id("gt-badge");
    const log    = $id("gt-log");
    const urlIn  = $id("gt-url");
    const autoCb = $id("gt-auto");

    const setBadge = (txt, cls="") => { badge.textContent = txt; badge.className = "gt-badge " + cls; };
    const setLog   = (txt, col="#38bdf8") => { log.textContent = txt; log.style.color = col; };

    // Khôi phục cài đặt
    autoCb.checked = !!getSettings().autoRun;
    autoCb.addEventListener("change", e => saveSettings({ autoRun: e.target.checked }));

    // Kiểm tra Pool xem đã có sẵn domain cho key này chưa
    const pool = getPool();
    if (pool[taskKey] && pool[taskKey].url) {
      urlIn.value = pool[taskKey].url;
      setBadge("Đã có trong Pool", "info");
      setLog("✨ Database: " + pool[taskKey].url);
      if (autoCb.checked) setTimeout(doStart, 900);
    } else {
      setTimeout(() => doScan(taskKey), 1200);
    }

    $id("gt-rescan").onclick = () => doScan(taskKey);
    $id("gt-ocrkey").onclick = () => doScan(taskKey);
    $id("gt-start").onclick  = doStart;
    $id("gt-pool").onclick   = showPool;

    // Lắng nghe thay đổi từ tab ngầm (countdown + copy code)
    if (typeof GM_addValueChangeListener === "function") {
      GM_addValueChangeListener(KEY_PING, (_, __, v) => {
        if (v && v.key === taskKey) {
          setBadge("Đang ủ: " + v.seconds + "s", "info");
          setLog("⏳ Tab ngầm đếm ngược: " + v.seconds + "s");
        }
      });
      GM_addValueChangeListener(KEY_DONE, (_, __, v) => {
        if (v && v.key === taskKey && v.code) {
          setBadge("Hoàn thành!", "ok");
          setLog("🎉 Mã: [ " + v.code + " ]", "#22c55e");
          copyToClipboard(v.code);
          const inp = document.querySelector('input[id*="code"],input[name*="code"],input[placeholder*="mã"],.form-control[type="text"]');
          if (inp) { inp.value = v.code; inp.dispatchEvent(new Event("input", { bubbles: true })); }
        }
      });
    }

    // ── SCAN OCR ─────────────────────────────────────────────────────────────
    function doScan(key) {
      setBadge("Đang quét...", "info");
      setLog("🔍 Tìm ảnh nhiệm vụ trên trang...");

      const img = findTaskImage();

      if (!img) {
        setBadge("Không thấy ảnh", "err");
        setLog("❌ Chưa thấy ảnh nhiệm vụ. Nhập link tay hoặc đợi trang tải!");
        return;
      }

      const src = img.currentSrc || img.src || (img.srcset || "").split(" ")[0];
      setLog("📡 Tải ảnh từ CDN (kèm Referer)...");

      GM_xmlhttpRequest({
        method: "GET", url: src,
        headers: { Referer: location.href, Accept: "image/*,*/*" },
        responseType: "blob",
        onload(res) {
          if (res.status >= 200 && res.status < 400 && res.response) {
            const fr = new FileReader();
            fr.onloadend = () => sendOcr(fr.result, key);
            fr.onerror   = () => canvasOcr(img, key);
            fr.readAsDataURL(res.response);
          } else {
            canvasOcr(img, key);
          }
        },
        onerror() { canvasOcr(img, key); }
      });
    }

    function findTaskImage() {
      // 1. Selector alt/src chuẩn
      const byAlt = document.querySelector('img[alt*="tim kiem" i], img[alt*="tìm kiếm" i]');
      if (byAlt) return byAlt;

      const byCdn = document.querySelector('img[src*="cdn.gtraffic.io"], img[src*="/i?t="]');
      if (byCdn) return byCdn;

      const bySrcset = document.querySelector('img[srcset*="cdn.gtraffic.io"]');
      if (bySrcset) return bySrcset;

      // 2. Tìm theo thẻ chứa text Bước 2
      for (const i of document.querySelectorAll("img")) {
        const parent = i.closest("div,section,article,p");
        if (!parent) continue;
        const txt = parent.innerText || "";
        if (/bước\s*0?2/i.test(txt) || /tìm.+truy.+cập/i.test(txt) || /link.+nhiệm.+vụ/i.test(txt)) {
          return i;
        }
      }

      // 3. Fallback ảnh nội dung lớn
      for (const i of document.querySelectorAll("img")) {
        if (i.src && i.src.includes("logo")) continue;
        const area = (i.naturalWidth || i.width || 0) * (i.naturalHeight || i.height || 0);
        if (area > 15000) return i;
      }
      return null;
    }

    function canvasOcr(img, key) {
      try {
        const c = document.createElement("canvas");
        c.width  = img.naturalWidth  || img.width  || 655;
        c.height = img.naturalHeight || img.height || 130;
        c.getContext("2d").drawImage(img, 0, 0);
        sendOcr(c.toDataURL("image/png"), key);
      } catch (e) {
        setBadge("Lỗi ảnh", "err");
        setLog("❌ Không đọc được ảnh: " + e.message);
      }
    }

    function sendOcr(b64, key) {
      setLog("🚀 OCR.space đang nhận diện...");
      const fd = new FormData();
      fd.append("apikey", OCR_API_KEY);
      fd.append("base64Image", b64);
      fd.append("language", "eng");
      fd.append("isOverlayRequired", "false");
      fd.append("OCREngine", "2");
      fd.append("scale", "true");
      fd.append("detectOrientation", "true");

      GM_xmlhttpRequest({
        method: "POST", url: OCR_API_URL, data: fd,
        onload(res) {
          try {
            const json = JSON.parse(res.responseText);
            const text = json && json.ParsedResults && json.ParsedResults[0] ? json.ParsedResults[0].ParsedText : "";
            if (!text) {
              const errMsg = (json && json.ErrorMessage && json.ErrorMessage[0]) || "OCR trả về rỗng";
              setBadge("Lỗi OCR", "err");
              setLog("❌ " + errMsg);
              return;
            }
            setLog("✨ OCR xong! Đang bóc tách domain...");
            console.log("[GT-OCR Raw]\n" + text);
            handleOcrText(text, key);
          } catch(e) {
            setBadge("Lỗi parse", "err");
            setLog("❌ Parse JSON lỗi: " + e.message);
          }
        },
        onerror() { setBadge("Lỗi mạng", "err"); setLog("❌ Không thể kết nối OCR.space"); }
      });
    }

    // ── PARSE DOMAIN ─────────────────────────────────────────────────────────
    function handleOcrText(raw, key) {
      const clean = raw.replace(/[^\x20-\x7E\n]/g, " ");
      const domain = extractDomain(clean);

      if (!domain) {
        setBadge("Không tìm thấy", "err");
        setLog("⚠️ OCR không thấy domain rõ. Vui lòng nhập tay!");
        return;
      }

      const finalUrl = sanitizeUrl(domain);
      if (!finalUrl) {
        setBadge("URL không hợp lệ", "err");
        setLog("⚠️ Domain bị lỗi ký tự. Nhập tay: " + domain);
        urlIn.value = domain;
        return;
      }

      urlIn.value = finalUrl;
      setBadge("Đã nhận diện ✓", "ok");
      setLog("✅ " + finalUrl);

      // Lưu vào Pool Database
      const p = getPool();
      p[key] = { url: finalUrl, date: Date.now() };
      savePool(p);

      if (autoCb.checked) setTimeout(doStart, 900);
    }

    function extractDomain(cleanText) {
      const TLD = "com\\.vn|net\\.vn|org\\.vn|edu\\.vn|com|vn|net|org|co|in|io|top|club|xyz|site|vip|cc|biz|info|live|app|win|bet|me|online|tv|news|blog|store|game|click|link|work|cash|bid";
      const re  = new RegExp(`(?:https?:\\/\\/)?([a-zA-Z0-9][a-zA-Z0-9_\\-]{1,})\\.(?:${TLD})(?:\\/[^\\s]*)?`, "gi");

      const candidates = [];
      let m;
      while ((m = re.exec(cleanText)) !== null) {
        const full = m[0].replace(/^https?:\/\//i, "").replace(/[.*_~-]+$/, "").split(/\s/)[0];
        if (full.length > 5 && !full.startsWith("gtraffic") && !full.startsWith("ocr.space")) {
          candidates.push(full);
        }
      }
      if (!candidates.length) return null;

      candidates.sort((a, b) => b.length - a.length);
      return candidates[0];
    }

    // ── START EXECUTION ──────────────────────────────────────────────────────
    function doStart() {
      const raw = urlIn.value.trim();
      if (!raw) { alert("Vui lòng quét hoặc nhập URL trước!"); return; }

      const url = sanitizeUrl(raw);
      if (!url) {
        setBadge("URL lỗi", "err");
        setLog("❌ URL có ký tự lạ. Vui lòng kiểm tra lại!");
        return;
      }

      urlIn.value = url;
      setLog("🚀 Mở tab ngầm: " + url);
      setBadge("Đang ủ...", "info");

      GM_setValue(KEY_SESSION, { key: taskKey, targetUrl: url, ts: Date.now() });

      if (typeof GM_openInTab === "function") {
        GM_openInTab(url, { active: false, insert: true, setParent: true });
      } else {
        window.open(url, "_blank");
      }
    }

    // ── POOL MODAL ───────────────────────────────────────────────────────────
    function showPool() {
      if (document.querySelector(".gt-overlay")) return;
      const ov = document.createElement("div");
      ov.className = "gt-overlay";
      const poolData = getPool();
      const entries  = Object.entries(poolData);
      ov.innerHTML = `
<div class="gt-modal">
  <div class="gt-modal-hdr">
    <b style="font-size:14px">📦 Database Pool</b>
    <button id="gp-close" style="background:none;border:none;color:#f1f5f9;font-size:18px;cursor:pointer">✕</button>
  </div>
  <div class="gt-pool-list" id="gp-list">
    ${entries.length ? entries.map(([k,v]) => `
      <div class="gt-pi" data-k="${k}">
        <span class="gt-pi-key">${k}</span>
        <span class="gt-pi-url" title="${v.url}">${v.url}</span>
        <button class="gt-pi-del" data-k="${k}">✕</button>
      </div>`).join("") : '<div style="text-align:center;color:#94a3b8;padding:16px">Chưa có dữ liệu</div>'}
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:10px">
    <button id="gp-clear" style="background:#ef4444;border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer">Xóa tất cả</button>
    <button id="gp-ok" style="background:#0284c7;border:none;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer">Đóng</button>
  </div>
</div>`;
      document.body.appendChild(ov);
      const close = () => ov.remove();
      ov.querySelector("#gp-close").onclick = close;
      ov.querySelector("#gp-ok").onclick    = close;
      ov.querySelector("#gp-clear").onclick = () => {
        if (confirm("Xóa toàn bộ Pool?")) { savePool({}); close(); }
      };
      ov.querySelectorAll(".gt-pi-del").forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        const p = getPool(); delete p[k]; savePool(p);
        b.closest(".gt-pi").remove();
      });
      ov.addEventListener("click", e => { if (e.target === ov) close(); });
    }
  }

})();
