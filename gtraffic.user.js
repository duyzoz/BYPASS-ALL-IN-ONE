// ==UserScript==
// @name         GTraffic Bypass All-In-One (Duyzoz)
// @namespace    https://gtraffic.io/
// @version      3.2.0
// @description  Bypass tự động 2 nền tảng: gtraffic.io (OCR AI nhận diện ảnh) & direct.gtraffic.io (Auto Leak Domain không cần OCR)
// @match        https://gtraffic.io/*
// @match        http://gtraffic.io/*
// @match        https://*.gtraffic.io/*
// @match        http://*.gtraffic.io/*
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
   GTraffic Bypass All-In-One (Duyzoz Edition) - v3.2.0
   HỖ TRỢ SONG SONG CẢ 2 NỀN TẢNG:
   1. direct.gtraffic.io: Tự động trích xuất Domain leak từ Bước 1, không cần OCR,
      mở tab ngầm, chờ logo #avt-d-btn xuất hiện (delay 2-6s), tự động click,
      đọc đếm ngược từ #trade-d-btn__content & tự động copy mã.
   2. gtraffic.io: Tự động lấy ảnh Bước 2, gửi OCR AI nhận diện domain,
      chống cache sai, lưu Pool theo Token ảnh.
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

  const hostname           = window.location.hostname;
  const isDirectGTraffic   = /direct\.gtraffic\.io$/i.test(hostname);
  const isStandardGTraffic = /(?:^|\.)gtraffic\.io$/i.test(hostname) && !isDirectGTraffic;
  const isAnyGTraffic      = isDirectGTraffic || isStandardGTraffic;

  // Dọn dẹp cache rác cũ nếu có
  (function purgeBadCache() {
    try {
      const p = GM_getValue(KEY_POOL, {});
      let changed = false;
      for (const k in p) {
        if (k === "85D67QK" || (p[k] && p[k].url && p[k].url.includes("entasymercadeo"))) {
          delete p[k];
          changed = true;
        }
      }
      if (changed) GM_setValue(KEY_POOL, p);
    } catch (_) {}
  })();

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
  // ★ TARGET WEBSITE AGENT (chạy trong tab ngầm của trang đích)
  //   Hỗ trợ cả nút của gtraffic chuẩn (#avt-btn) & direct (#avt-d-btn / #trade-d-btn)
  // ===========================================================================
  if (!isAnyGTraffic) {
    let session = null;
    try {
      session = GM_getValue(KEY_SESSION, null);
    } catch (_) { return; }

    if (!session || !session.targetUrl || !session.key) return;
    if (Date.now() - (session.ts || 0) > 600000) return;

    try {
      const targetHost = new URL(session.targetUrl).hostname.replace(/^www\./, "").toLowerCase();
      const currentHost = window.location.hostname.replace(/^www\./, "").toLowerCase();
      if (!currentHost.includes(targetHost) && !targetHost.includes(currentHost)) {
        return;
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
  // TARGET AGENT LOGIC (với xử lý delay 2-6s cho logo direct)
  // ===========================================================================
  function runTargetAgent() {
    let hasClicked = false;
    let clickAttempts = 0;
    let lastSec = null;
    let codeExtracted = false;

    function findTargetButton() {
      // 1. Nút của direct.gtraffic: #avt-d-btn (svg) hoặc #trade-d-btn
      const directSvg = document.querySelector("#avt-d-btn")
                     || document.querySelector(".logo-dr-svg-us")
                     || document.querySelector("#trade-d-btn_arrow");
      if (directSvg) return directSvg;

      const directContainer = document.querySelector("#trade-d-btn")
                           || document.querySelector(".trade-d-btn-container");
      if (directContainer) return directContainer;

      // 2. Nút của gtraffic tiêu chuẩn: #avt-btn
      const stdBtn = document.querySelector("#avt-btn")
                  || document.querySelector('[class*="avt-btn"]')
                  || document.querySelector("#trade-btn");
      if (stdBtn) return stdBtn;

      // 3. Nút chữ LẤY MÃ
      for (const el of document.querySelectorAll("button, a, div[role='button'], div, span")) {
        const txt = el.innerText || el.textContent || "";
        if (/lấy\s*mã/i.test(txt) && el.children.length <= 2) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) return el;
        }
      }

      return null;
    }

    function triggerClick(el) {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (_) {}

      try {
        el.style.outline = "4px solid #22c55e";
      } catch (_) {}

      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const eventOpts = {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: cx,
        clientY: cy,
        button: 0,
        buttons: 1
      };

      ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(type => {
        try { el.dispatchEvent(new MouseEvent(type, eventOpts)); } catch (_) {}
      });

      // Bắn thêm vào phần tử cha nếu là SVG
      if (el.parentElement) {
        ["mousedown", "mouseup", "click"].forEach(type => {
          try { el.parentElement.dispatchEvent(new MouseEvent(type, eventOpts)); } catch (_) {}
        });
      }

      if (typeof el.click === "function") {
        try { el.click(); } catch (_) {}
      }
    }

    function extractCountdown() {
      // 1. Thẻ text SVG của direct.gtraffic: #trade-d-btn__content
      const directContent = document.querySelector("#trade-d-btn__content");
      if (directContent) {
        const txt = (directContent.textContent || directContent.innerHTML || "").trim();
        const m = txt.match(/^(\d{1,3})$/);
        if (m && +m[1] > 0 && +m[1] <= 180) return +m[1];
      }

      // 2. Thẻ đếm ngược tiêu chuẩn
      const stdContent = document.querySelector('.trade-btn__content, [id*="trade"][id*="content"]');
      if (stdContent) {
        const txt = (stdContent.textContent || stdContent.innerText || "").trim();
        const m = txt.match(/(\d{1,3})/);
        if (m && +m[1] > 0 && +m[1] <= 180) return +m[1];
      }

      // 3. Quét mọi phần tử đếm ngược
      for (const el of document.querySelectorAll('[class*="timer"], [class*="countdown"], [id*="count"], .countdown, #notice-d-btn, #trade-d-btn')) {
        const txt = el.innerText || el.textContent || "";
        const m = txt.match(/\b(\d{1,3})\s*(?:s|giây|sec)?\b/i);
        if (m && +m[1] > 0 && +m[1] <= 180) return +m[1];
      }

      return null;
    }

    function extractSecretCode() {
      // 1. Class chuẩn .copy-allowed
      const codeEl = document.querySelector('.copy-allowed, [class*="copy-allowed"]');
      if (codeEl) {
        const code = (codeEl.textContent || codeEl.innerText || "").replace(/\s+/g, "").trim();
        if (code.length >= 4 && !/^\d{1,2}$/.test(code)) {
          try { codeEl.style.backgroundColor = "#22c55e"; codeEl.style.color = "#fff"; } catch (_) {}
          return code;
        }
      }

      // 2. Thẻ #trade-d-btn__content khi đổi thành mã
      const directContent = document.querySelector("#trade-d-btn__content");
      if (directContent) {
        const txt = (directContent.textContent || "").replace(/\s+/g, "").trim();
        if (txt.length >= 4 && !/^\d{1,3}$/.test(txt)) {
          return txt;
        }
      }

      // 3. Thẻ #notice-d-btn
      const noticeEl = document.querySelector("#notice-d-btn");
      if (noticeEl) {
        const txt = (noticeEl.innerText || noticeEl.textContent || "").replace(/\s+/g, "").trim();
        if (txt.length >= 4 && !/^\d{1,3}$/.test(txt) && !/đang|chờ|vui lòng/i.test(txt)) {
          return txt;
        }
      }

      return null;
    }

    // Polling liên tục mỗi 400ms: đợi 2-6s cho đến khi nút xuất hiện
    const loop = setInterval(() => {
      const session = GM_getValue(KEY_SESSION, null);
      if (!session || !session.key) return;

      // 1. Tự động click khi logo xuất hiện
      if (!hasClicked || (clickAttempts < 5 && lastSec === null)) {
        const btn = findTargetButton();
        if (btn && btn.isConnected) {
          const style = window.getComputedStyle(btn);
          const isVisible = style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
          if (isVisible) {
            triggerClick(btn);
            clickAttempts++;
            if (clickAttempts >= 1) hasClicked = true;
          }
        }
      }

      // 2. Đồng bộ thời gian đếm ngược
      const sec = extractCountdown();
      if (sec !== null && sec !== lastSec) {
        lastSec = sec;
        GM_setValue(KEY_PING, { key: session.key, seconds: sec, ts: Date.now() });
      }

      // 3. Lấy mã khi hoàn thành
      if (!codeExtracted) {
        const code = extractSecretCode();
        if (code) {
          codeExtracted = true;
          copyToClipboard(code);
          GM_setValue(KEY_DONE, { key: session.key, code, ts: Date.now() });
          GM_deleteValue(KEY_SESSION);
          clearInterval(loop);
          setTimeout(() => { try { window.close(); } catch (_) {} }, 2000);
        }
      }
    }, 400);
  }

  // ===========================================================================
  // ★ MASTER PAGE MODE (gtraffic.io & direct.gtraffic.io)
  // ===========================================================================

  function tryMount() {
    if (!isAnyGTraffic) return;
    if (document.getElementById("gtraffic-hud-container")) return;
    const parent = document.body || document.documentElement;
    if (!parent) return;
    mountHud();
  }

  tryMount();
  waitForBody(tryMount);
  document.addEventListener("DOMContentLoaded", tryMount);
  window.addEventListener("load", tryMount);

  (function startObserver() {
    if (document.documentElement) {
      const obs = new MutationObserver(() => {
        if (!document.getElementById("gtraffic-hud-container")) tryMount();
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } else {
      setTimeout(startObserver, 50);
    }
  })();

  setInterval(() => {
    if (isAnyGTraffic && !document.getElementById("gtraffic-hud-container")) tryMount();
  }, 1000);

  // ===========================================================================
  // MOUNT HUD
  // ===========================================================================
  function mountHud() {
    if (document.getElementById("gtraffic-hud-container")) return;

    const pathMatch = window.location.pathname.match(/^\/([a-zA-Z0-9_-]+)/);
    const shortKey  = pathMatch ? pathMatch[1] : "UNKNOWN";

    const titlePrefix = isDirectGTraffic ? "direct.gtraffic" : "gtraffic";

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
#gtraffic-hud-container * { box-sizing: border-box !important; }
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
.gt-author { color: #94a3b8 !important; font-weight: 400 !important; font-size: 12px !important; }
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
.gt-lbl { font-size: 11.5px !important; font-weight: 600 !important; color: #94a3b8 !important; }
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
  min-width: 95px !important;
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

    const hud = document.createElement("div");
    hud.id = "gtraffic-hud-container";
    hud.innerHTML = `
<div class="gt-hdr" id="gt-drag-handle">
  <div style="display:flex;align-items:center"><span class="gt-dot"></span><span class="gt-title">${titlePrefix} bypass <span class="gt-author">(Duyzoz)</span></span></div>
  <div class="gt-badge" id="gt-badge">Sẵn sàng</div>
</div>
<div class="gt-body">
  <div class="gt-row">
    <span class="gt-lbl">${isDirectGTraffic ? 'Tự động leak domain trực tiếp' : 'Tự động quét ảnh → URL & Key'}</span>
    <button class="gt-link" id="gt-rescan">${isDirectGTraffic ? '⚡ Dò lại Domain' : '🔄 Quét lại OCR'}</button>
  </div>
  <div class="gt-row">
    <span class="gt-lbl">URL / Link đích</span>
    <button class="gt-link" id="gt-clearpool" style="color:#ef4444">🗑️ Xóa Pool</button>
  </div>
  <input class="gt-input" id="gt-url" placeholder="Đang dò tìm link đích...">
  <div>
    <span class="gt-lbl" style="display:block;margin-bottom:4px">Key nhiệm vụ (${isDirectGTraffic ? 'Direct Link' : 'Token ảnh'})</span>
    <input class="gt-input" id="gt-key" value="${shortKey}" readonly>
  </div>
  <div class="gt-ctrls">
    <label class="gt-chk-lbl"><input type="checkbox" id="gt-auto"> Tự động chạy</label>
    <button class="gt-btn blue" id="gt-start">Lấy mã ngay</button>
    <button class="gt-btn gray" id="gt-pool">+Pool</button>
  </div>
  <div class="gt-log" id="gt-log">Đang khởi tạo...</div>
  <a class="gt-discord" href="${DISCORD_URL}" target="_blank">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
    Join Discord nhận bản cập nhật
  </a>
</div>`;

    const parent = document.body || document.documentElement;
    parent.appendChild(hud);

    makeDraggable(hud, hud.querySelector("#gt-drag-handle"));
    bindMasterEvents(hud, shortKey);
  }

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

  // ===========================================================================
  // DOMAIN EXTRACTORS
  // ===========================================================================

  // 1. Dành riêng cho direct.gtraffic.io: Trích xuất trực tiếp từ DOM không cần OCR
  function findDirectLeakedDomain() {
    // a. Trực tiếp từ thẻ span.notranslate.break-all (theo DevTools)
    const span = document.querySelector('span.notranslate.break-all')
              || document.querySelector('.notranslate.break-all')
              || document.querySelector('span.font-mono.break-all');
    if (span) {
      const txt = (span.innerText || span.textContent || "").trim();
      if (txt.includes(".") && !txt.includes(" ") && txt.length > 3) {
        return txt;
      }
    }

    // b. Tìm trong khối Bước 1
    for (const el of document.querySelectorAll("div, section, p, h2, h3, h4")) {
      const txt = el.innerText || "";
      if (/bước\s*0?1/i.test(txt)) {
        const parent = el.parentElement || el;
        const m = parent.innerText.match(/([a-zA-Z0-9][a-zA-Z0-9_\-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/);
        if (m && !m[1].includes("gtraffic") && !m[1].includes("google")) {
          return m[1];
        }
      }
    }

    // c. Quét thẻ bất kỳ có định dạng domain
    for (const el of document.querySelectorAll("span, b, strong, div")) {
      const txt = (el.innerText || el.textContent || "").trim();
      if (/^[a-zA-Z0-9][a-zA-Z0-9_\-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(txt)) {
        if (!txt.includes("gtraffic") && !txt.includes("google") && !txt.includes("recaptcha")) {
          return txt;
        }
      }
    }

    return null;
  }

  // 2. Dành cho gtraffic.io tiêu chuẩn: Tìm ảnh nhiệm vụ
  function findTaskImage() {
    const selectors = [
      'img[alt*="tim kiem" i]',
      'img[alt*="tìm kiếm" i]',
      'img[src*="cdn.gtraffic.io"]',
      'img[src*="/i?t="]',
      'img[srcset*="cdn.gtraffic.io"]',
      'img[data-src*="cdn.gtraffic.io"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }

    for (const el of document.querySelectorAll("div, section, p, h2, h3, h4")) {
      const txt = el.innerText || "";
      if (/bước\s*0?2/i.test(txt) && !/bước\s*0?[134]/i.test(txt)) {
        const block = el.closest(".card, .step, section, .border, .rounded") || el.parentElement?.parentElement || el;
        const img = block.querySelector("img");
        if (img && !/logo|avatar|brand/i.test(img.src || "")) {
          return img;
        }
      }
    }

    let bestImg = null;
    let maxArea = 0;
    for (const img of document.querySelectorAll("img")) {
      const src = img.currentSrc || img.src || "";
      if (/logo|icon|avatar|brand|flag|social|placeholder/i.test(src)) continue;
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      const area = w * h;
      if (area > maxArea && area > 10000) {
        maxArea = area;
        bestImg = img;
      }
    }
    return bestImg;
  }

  function computeTaskKey(img) {
    if (img) {
      const src = img.currentSrc || img.src || (img.srcset || "").split(" ")[0] || "";
      try {
        const u = new URL(src, location.href);
        const t = u.searchParams.get("t");
        if (t) return "t_" + t.substring(0, 14);
        const p = u.pathname.split("/").pop();
        if (p && p.length > 5 && !/logo|placeholder/i.test(p)) return "t_" + p.substring(0, 14);
      } catch (_) {}
      if (src.length > 20) {
        let hash = 0;
        for (let i = 0; i < src.length; i++) {
          hash = ((hash << 5) - hash) + src.charCodeAt(i);
          hash |= 0;
        }
        return "img_" + Math.abs(hash).toString(36);
      }
    }
    return "task_" + Math.floor(Date.now() / 180000);
  }

  // ===========================================================================
  // BIND MASTER EVENTS
  // ===========================================================================
  function bindMasterEvents(hud, shortKey) {
    const $id    = id => hud.querySelector("#" + id);
    const badge  = $id("gt-badge");
    const log    = $id("gt-log");
    const urlIn  = $id("gt-url");
    const keyIn  = $id("gt-key");
    const autoCb = $id("gt-auto");

    const setBadge = (txt, cls="") => { badge.textContent = txt; badge.className = "gt-badge " + cls; };
    const setLog   = (txt, col="#38bdf8") => { log.textContent = txt; log.style.color = col; };

    autoCb.checked = !!getSettings().autoRun;
    autoCb.addEventListener("change", e => saveSettings({ autoRun: e.target.checked }));

    $id("gt-start").onclick = doStart;
    $id("gt-pool").onclick  = showPool;
    $id("gt-clearpool").onclick = () => {
      savePool({});
      urlIn.value = "";
      setBadge("Đã xóa", "info");
      setLog("🗑️ Đã xóa sạch Database Pool!");
    };

    // Lắng nghe cập nhật từ tab ngầm (đồng bộ số giây & điền mã)
    if (typeof GM_addValueChangeListener === "function") {
      GM_addValueChangeListener(KEY_PING, (_, __, v) => {
        if (v && v.key === keyIn.value) {
          setBadge(`Đang ủ: ${v.seconds}s`, "info");
          setLog(`⏳ Tab ngầm đếm ngược: ${v.seconds}s`);
        }
      });
      GM_addValueChangeListener(KEY_DONE, (_, __, v) => {
        if (v && v.key === keyIn.value && v.code) {
          setBadge("Hoàn thành!", "ok");
          setLog("🎉 Mã: [ " + v.code + " ]", "#22c55e");
          copyToClipboard(v.code);
          // Tự động điền mã vào ô xác nhận
          const inp = document.querySelector('input[placeholder*="mã" i], input[placeholder*="xác nhận" i], input[id*="code"], input[name*="code"], .form-control[type="text"]');
          if (inp) {
            inp.value = v.code;
            inp.dispatchEvent(new Event("input", { bubbles: true }));
            inp.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      });
    }

    // =========================================================================
    // NỀN TẢNG 1: DIRECT.GTRAFFIC.IO (Auto Leak Domain, No OCR)
    // =========================================================================
    if (isDirectGTraffic) {
      keyIn.value = "direct_" + shortKey;
      $id("gt-rescan").onclick = () => initDirectTask(true);

      function initDirectTask(force = false) {
        setBadge("Đang dò domain...", "info");
        setLog("⚡ Đang trích xuất domain trực tiếp (không cần OCR)...");

        let attempts = 0;
        const poll = setInterval(() => {
          attempts++;
          const domain = findDirectLeakedDomain();
          if (domain) {
            clearInterval(poll);
            const finalUrl = sanitizeUrl(domain);
            urlIn.value = finalUrl;
            setBadge("Đã leak domain ✓", "ok");
            setLog("⚡ Phát hiện domain: " + finalUrl);

            const p = getPool();
            p[keyIn.value] = { url: finalUrl, date: Date.now() };
            savePool(p);

            if (autoCb.checked) setTimeout(doStart, 800);
          } else if (attempts >= 25) { // Quét trong 10 giây
            clearInterval(poll);
            setBadge("Chưa thấy domain", "err");
            setLog("⚠️ Không tìm thấy domain leak tự động. Hãy nhập link tay!");
          }
        }, 400);
      }

      // Kiểm tra pool hoặc khởi chạy
      const pool = getPool();
      const directKey = "direct_" + shortKey;
      if (pool[directKey]?.url) {
        urlIn.value = pool[directKey].url;
        setBadge("Đã có trong Pool", "info");
        setLog("✨ Database: " + pool[directKey].url);
        if (autoCb.checked) setTimeout(doStart, 800);
      } else {
        setTimeout(() => initDirectTask(false), 500);
      }
      return;
    }

    // =========================================================================
    // NỀN TẢNG 2: GTRAFFIC.IO TIÊU CHUẨN (OCR AI Scanning)
    // =========================================================================
    $id("gt-rescan").onclick = () => doScanStandard(true);

    function initStandardTask() {
      const img = findTaskImage();
      const taskKey = computeTaskKey(img);
      keyIn.value = taskKey;

      const pool = getPool();
      if (pool[taskKey]?.url && !pool[taskKey].url.includes("entasymercadeo")) {
        urlIn.value = pool[taskKey].url;
        setBadge("Đã có trong Pool", "info");
        setLog("✨ Đã lưu từ trước (Key: " + taskKey + "): " + pool[taskKey].url);
        if (autoCb.checked) setTimeout(doStart, 900);
      } else {
        doScanStandard(false);
      }
    }

    setTimeout(initStandardTask, 800);

    function doScanStandard(force = false) {
      setBadge("Đang tìm ảnh...", "info");
      setLog("🔍 Đang định vị ảnh nhiệm vụ Bước 2...");

      const img = findTaskImage();
      if (!img) {
        setTimeout(() => {
          const img2 = findTaskImage();
          if (img2) {
            const actualKey = computeTaskKey(img2);
            keyIn.value = actualKey;
            startOcr(img2, actualKey, force);
          } else {
            setBadge("Không thấy ảnh", "err");
            setLog("❌ Chưa thấy ảnh Bước 2. Hãy cuộn xuống để ảnh tải!");
          }
        }, 1200);
        return;
      }

      const actualKey = computeTaskKey(img);
      keyIn.value = actualKey;
      startOcr(img, actualKey, force);
    }

    function startOcr(img, taskKey, force) {
      if (!force) {
        const pool = getPool();
        if (pool[taskKey]?.url && !pool[taskKey].url.includes("entasymercadeo")) {
          urlIn.value = pool[taskKey].url;
          setBadge("Đã có trong Pool", "info");
          setLog("✨ Đã lưu từ trước: " + pool[taskKey].url);
          if (autoCb.checked) setTimeout(doStart, 900);
          return;
        }
      }

      const src = img.currentSrc || img.src || (img.srcset || "").split(" ")[0];
      setBadge("Đang quét OCR...", "info");
      setLog("📡 Tải ảnh Bước 2 để quét OCR...");

      GM_xmlhttpRequest({
        method: "GET", url: src,
        headers: { Referer: location.href, Accept: "image/*,*/*" },
        responseType: "blob",
        onload(res) {
          if (res.status >= 200 && res.status < 400 && res.response) {
            const fr = new FileReader();
            fr.onloadend = () => sendOcr(fr.result, taskKey);
            fr.onerror   = () => canvasOcr(img, taskKey);
            fr.readAsDataURL(res.response);
          } else {
            canvasOcr(img, taskKey);
          }
        },
        onerror() { canvasOcr(img, taskKey); }
      });
    }

    function canvasOcr(img, taskKey) {
      try {
        const c = document.createElement("canvas");
        c.width  = img.naturalWidth  || img.width  || 655;
        c.height = img.naturalHeight || img.height || 130;
        c.getContext("2d").drawImage(img, 0, 0);
        sendOcr(c.toDataURL("image/png"), taskKey);
      } catch (e) {
        setBadge("Lỗi ảnh", "err");
        setLog("❌ Canvas lỗi: " + e.message);
      }
    }

    function sendOcr(b64, taskKey) {
      setLog("🚀 Đang gửi ảnh lên OCR.space nhận diện...");
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
              const errMsg = (json && json.ErrorMessage && json.ErrorMessage[0]) || "OCR không đọc được chữ trong ảnh";
              setBadge("Lỗi OCR", "err");
              setLog("❌ " + errMsg);
              return;
            }
            setLog("✨ OCR xong! Đang bóc tách tên miền...");
            handleOcrText(text, taskKey);
          } catch(e) {
            setBadge("Lỗi parse", "err");
            setLog("❌ Parse JSON lỗi: " + e.message);
          }
        },
        onerror() { setBadge("Lỗi mạng", "err"); setLog("❌ Mất kết nối tới OCR.space"); }
      });
    }

    function handleOcrText(raw, taskKey) {
      const clean = raw.replace(/[^\x20-\x7E\n]/g, " ");
      let textForRegex = clean.replace(/\.{2,}/g, ".");
      textForRegex = textForRegex.replace(/([a-zA-Z0-9])\s*\.\s*([a-zA-Z0-9])/g, "$1.$2");

      const domain = extractStandardDomain(textForRegex, clean);
      if (!domain) {
        setBadge("Không thấy domain", "err");
        setLog("⚠️ OCR chưa nhận rõ domain bị che. Vui lòng gõ link vào ô!");
        return;
      }

      const finalUrl = sanitizeUrl(domain);
      if (!finalUrl) {
        setBadge("URL lỗi", "err");
        setLog("⚠️ Domain bị lỗi ký tự: " + domain);
        urlIn.value = domain;
        return;
      }

      urlIn.value = finalUrl;
      setBadge("Đã nhận diện ✓", "ok");
      setLog("✅ Nhận diện thành công: " + finalUrl);

      const p = getPool();
      p[taskKey] = { url: finalUrl, date: Date.now() };
      savePool(p);

      if (autoCb.checked) setTimeout(doStart, 900);
    }

    function extractStandardDomain(normalizedText, rawText) {
      const TLD = "com\\.vn|net\\.vn|org\\.vn|edu\\.vn|com|vn|net|org|co|in|io|top|club|xyz|site|vip|cc|biz|info|live|app|win|bet|me|online|tv|news|blog|store|game|click|link|work|cash|bid";
      const re = new RegExp(`(?:https?:\\/\\/)?([a-zA-Z0-9][a-zA-Z0-9_\\-]{1,})\\.(?:${TLD})(?:\\/[^\\s]*)?`, "gi");

      const candidates = [];
      let m;

      while ((m = re.exec(normalizedText)) !== null) {
        const full = m[0].replace(/^https?:\/\//i, "").replace(/[.*_~-]+$/, "").split(/[\/\s]/)[0];
        if (full.length > 5 && !full.startsWith("gtraffic") && !full.startsWith("ocr.space")) {
          candidates.push(full);
        }
      }

      const maskedRe = new RegExp(`(?:https?:\\/\\/)?([a-zA-Z0-9]{3,})\\.{2,}(?:${TLD})`, "gi");
      while ((m = maskedRe.exec(rawText)) !== null) {
        const prefix = m[1];
        const wordRe = new RegExp(`\\b(${prefix}[a-zA-Z0-9]+)\\b`, "gi");
        let wm = wordRe.exec(rawText);
        if (wm && wm[1].length > prefix.length) {
          candidates.unshift(wm[1].toLowerCase() + ".com");
        } else {
          candidates.push(prefix + ".com");
        }
      }

      if (!candidates.length) return null;
      candidates.sort((a, b) => b.length - a.length);
      return candidates[0];
    }

    // ── DO START ─────────────────────────────────────────────────────────────
    function doStart() {
      const raw = urlIn.value.trim();
      if (!raw) { alert("Vui lòng nhập hoặc chờ tìm URL trước!"); return; }

      const url = sanitizeUrl(raw);
      if (!url) {
        setBadge("URL lỗi", "err");
        setLog("❌ URL không hợp lệ!");
        return;
      }

      urlIn.value = url;
      const currentKey = keyIn.value || "UNKNOWN";
      setLog("🚀 Mở tab ngầm: " + url);
      setBadge("Đang ủ...", "info");

      const p = getPool();
      p[currentKey] = { url: url, date: Date.now() };
      savePool(p);

      GM_setValue(KEY_SESSION, { key: currentKey, targetUrl: url, ts: Date.now() });

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
    <b style="font-size:14px">📦 Database Pool (${isDirectGTraffic ? 'Direct Links' : 'Ảnh nhiệm vụ'})</b>
    <button id="gp-close" style="background:none;border:none;color:#f1f5f9;font-size:18px;cursor:pointer">✕</button>
  </div>
  <div class="gt-pool-list" id="gp-list">
    ${entries.length ? entries.map(([k,v]) => `
      <div class="gt-pi" data-k="${k}">
        <span class="gt-pi-key">${k}</span>
        <span class="gt-pi-url" title="${v.url}">${v.url}</span>
        <button class="gt-pi-del" data-k="${k}">✕</button>
      </div>`).join("") : '<div style="text-align:center;color:#94a3b8;padding:16px">Chưa có dữ liệu nào</div>'}
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
        if (confirm("Xóa toàn bộ Pool?")) { savePool({}); close(); urlIn.value = ""; }
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
