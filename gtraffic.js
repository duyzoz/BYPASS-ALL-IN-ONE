/**
 * =========================================================================
 * GTraffic Bypass All-In-One (Duyzoz Edition) - Core Engine v2.4.0
 * Author: Duyzoz
 * Repo: https://github.com/duyzoz/BYPASS-ALL-IN-ONE
 *
 * CHANGELOG v2.4.0:
 * - FIX: HUD luôn hiện 100% - dùng MutationObserver + retry loop thay vì
 *   chỉ gọi 1 lần lúc document-start khi body chưa tồn tại
 * - FIX: Xóa hoàn toàn pingTestDomain/recoverMaskedDomain (nguyên nhân bị block 404)
 * - FIX: OCR chỉ trả ra 1 domain duy nhất sạch nhất, không thêm tiền tố thừa
 * - FIX: sanitizeUrl loại bỏ icon unicode, punycode, ký tự rác triệt để
 * - IMPROVE: Tab ngầm chỉ kích hoạt trên domain trong Pool, không bắn request bừa
 * =========================================================================
 */

(function () {
  'use strict';

  const OCR_API_KEY = "K84564487988957";
  const OCR_API_URL = "https://api.ocr.space/parse/image";
  const DISCORD_URL = "https://discord.gg/vnbp";

  const KEY_POOL    = "gtraffic_pool_db";
  const KEY_SETTINGS = "gtraffic_settings";
  const KEY_SESSION = "gtraffic_active_session";
  const KEY_PING    = "gtraffic_sync_ping";
  const KEY_DONE    = "gtraffic_sync_done";

  const isGTraffic = /gtraffic\.io/.test(window.location.hostname);

  // =========================================================================
  // UTILS
  // =========================================================================

  function copyToClipboard(text) {
    if (typeof GM_setClipboard === "function") {
      try { GM_setClipboard(text, "text"); return true; } catch (_) {}
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    Object.assign(ta.style, { position:"fixed", top:"-9999px", left:"-9999px" });
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
    return true;
  }

  /**
   * Làm sạch URL khỏi:
   * - Ký tự non-ASCII (icon ⭐, huy hiệu, unicode rác) → bị Punycode xn--
   * - Breadcrumb phía sau ("> H88", "K9", khoảng trắng...)
   * - Dấu chấm/gạch ở đầu (...)
   * - Tự thêm https:// nếu thiếu
   */
  function sanitizeUrl(raw) {
    if (!raw) return "";
    // Cắt tại khoảng trắng, dấu >, ›, |, em-dash
    let u = raw.trim().split(/[\s\>\›\|\—\–]/)[0];
    // Xóa toàn bộ ký tự non-printable ASCII (bao gồm icon ngôi sao unicode)
    u = u.replace(/[^\x21-\x7E]/g, "");
    // Xóa dấu chấm, gạch thừa ở đầu (...entasy -> entasy)
    u = u.replace(/^(https?:\/\/)?[.\-_*~]+/, "$1");
    // Xóa rác ở đuôi
    u = u.replace(/[.\-_*~,;:!?]+$/, "");
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    // Validate bằng URL constructor – nếu trình duyệt vẫn encode Punycode thì bắt ra
    try {
      const parsed = new URL(u);
      // Nếu hostname chứa xn-- thì bị unicode nhiễm → trả về rỗng để báo lỗi
      if (parsed.hostname.includes("xn--")) return "";
      return parsed.origin + "/";
    } catch (_) {
      return u.endsWith("/") ? u : u + "/";
    }
  }

  function getPool()          { return GM_getValue(KEY_POOL, {}); }
  function savePool(p)        { GM_setValue(KEY_POOL, p); }
  function getSettings()      { return GM_getValue(KEY_SETTINGS, { autoRun: true }); }
  function saveSettings(s)    { GM_setValue(KEY_SETTINGS, s); }

  // =========================================================================
  // ★ TARGET WEBSITE MODE (Non-GTraffic pages)
  //   Fake Referrer + Anti-freeze + Auto-click + Countdown sync + Copy code
  // =========================================================================
  if (!isGTraffic) {
    // Đảm bảo tính năng fake referrer chạy ngay ở document-start
    try {
      Object.defineProperty(document, "referrer", { get: () => "https://www.google.com/", configurable: true });
    } catch (_) {}

    // Chống đóng băng tab background
    const BLOCKED_EVENTS = ["visibilitychange","webkitvisibilitychange","blur","focusout","pagehide"];
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
    window.requestAnimationFrame  = cb => window.setTimeout(() => cb(performance.now()), 16);
    window.cancelAnimationFrame   = id => window.clearTimeout(id);

    // Đợi DOM sẵn sàng rồi khởi agent
    waitForBody(() => runTargetAgent());
    return;
  }

  // =========================================================================
  // ★ GTRAFFIC MASTER PAGE MODE — Inject HUD (luôn luôn hiện)
  // =========================================================================
  waitForBody(() => {
    if (!document.getElementById("gtraffic-hud-container")) {
      mountHud();
    }
  });

  // Backup: dùng MutationObserver phòng trường hợp body bị Vue/React thay thế sau khi mount
  const _hudObserver = new MutationObserver(() => {
    if (!document.getElementById("gtraffic-hud-container") && document.body) {
      mountHud();
    }
  });
  // Bắt đầu observe ngay khi html element có mặt
  (function startObserve() {
    if (document.documentElement) {
      _hudObserver.observe(document.documentElement, { childList: true, subtree: false });
    } else {
      setTimeout(startObserve, 50);
    }
  })();

  // =========================================================================
  // waitForBody – Retry loop bất đồng bộ đến khi body tồn tại
  // =========================================================================
  function waitForBody(cb) {
    if (document.body) { cb(); return; }
    const id = setInterval(() => {
      if (document.body) { clearInterval(id); cb(); }
    }, 20);
  }

  // =========================================================================
  // TARGET AGENT (chạy trên tab ngầm của website đích)
  // =========================================================================
  function runTargetAgent() {
    let hasClicked = false;
    let lastSec = null;

    const loop = setInterval(() => {
      const session = GM_getValue(KEY_SESSION, null);
      if (!session || !session.key) return;

      // Auto-click nút #avt-btn
      const btn = document.querySelector("#avt-btn");
      if (btn && btn.isConnected && !hasClicked) {
        Object.assign(btn.style, {
          position:"fixed", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          zIndex:"2147483647", outline:"4px solid red"
        });
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        ["mousedown","mouseup","click"].forEach(t =>
          btn.dispatchEvent(new MouseEvent(t, { view:window, bubbles:true, cancelable:true, clientX:cx, clientY:cy }))
        );
        hasClicked = true;
      }

      // Đồng bộ đếm ngược về tab mẹ
      let sec = null;
      for (const el of document.querySelectorAll('[class*="timer"],[class*="countdown"],[id*="count"],.countdown')) {
        const m = (el.innerText || "").match(/(\d{1,3})/);
        if (m && +m[1] > 0 && +m[1] <= 180) { sec = +m[1]; break; }
      }
      if (sec !== null && sec !== lastSec) {
        lastSec = sec;
        GM_setValue(KEY_PING, { key: session.key, seconds: sec, ts: Date.now() });
      }

      // Lấy mã xong
      const codeEl = document.querySelector('.trade-btn__content.copy-allowed,[class*="copy-allowed"]');
      if (codeEl) {
        const code = (codeEl.textContent || "").replace(/\s+/g,"").trim();
        if (code.length >= 4) {
          copyToClipboard(code);
          Object.assign(codeEl.style, { backgroundColor:"#22c55e", color:"#fff" });
          GM_setValue(KEY_DONE, { key: session.key, code, ts: Date.now() });
          GM_deleteValue(KEY_SESSION);
          clearInterval(loop);
          setTimeout(() => { try { window.close(); } catch(_){} }, 1500);
        }
      }
    }, 600);
  }

  // =========================================================================
  // MOUNT HUD — Toàn bộ giao diện + logic
  // =========================================================================
  let _hudMounted = false;
  function mountHud() {
    if (_hudMounted || document.getElementById("gtraffic-hud-container")) return;
    _hudMounted = true;

    const pathMatch = window.location.pathname.match(/^\/([a-zA-Z0-9_-]+)/);
    const taskKey = pathMatch ? pathMatch[1] : "UNKNOWN";

    // ── CSS ──────────────────────────────────────────────────────────────────
    const style = document.createElement("style");
    style.textContent = `
#gtraffic-hud-container{position:fixed;bottom:18px;right:18px;width:368px;background:#0f172a;border:1px solid #1e293b;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.75);color:#f1f5f9;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;z-index:2147483647;box-sizing:border-box;overflow:hidden;user-select:none}
#gtraffic-hud-container *{box-sizing:border-box}
.gt-hdr{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;background:#0a1628;border-bottom:1px solid #1e293b;cursor:grab}
.gt-dot{width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8;flex-shrink:0}
.gt-title{font-weight:700;font-size:14px;color:#fff;margin-left:8px}
.gt-author{color:#94a3b8;font-weight:400;font-size:12px}
.gt-badge{background:#1e293b;border:1px solid #f59e0b;color:#f59e0b;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gt-badge.ok{border-color:#22c55e;color:#22c55e}.gt-badge.info{border-color:#38bdf8;color:#38bdf8}.gt-badge.err{border-color:#ef4444;color:#ef4444}
.gt-body{padding:12px 14px;display:flex;flex-direction:column;gap:9px}
.gt-row{display:flex;justify-content:space-between;align-items:center}
.gt-lbl{font-size:11.5px;font-weight:600;color:#94a3b8}
.gt-link{background:none;border:none;color:#38bdf8;font-size:11.5px;font-weight:600;cursor:pointer;padding:0}
.gt-link:hover{text-decoration:underline}
.gt-input{width:100%;background:#020617;border:1px solid #1e293b;border-radius:7px;padding:7px 10px;color:#fff;font-size:12px;outline:none;font-family:Consolas,monospace}
.gt-input:focus{border-color:#0284c7}
.gt-ctrls{display:flex;align-items:center;gap:8px;margin-top:2px}
.gt-chk-lbl{display:flex;align-items:center;gap:5px;font-size:12px;color:#cbd5e1;cursor:pointer;flex:1}
.gt-btn{border:none;font-weight:700;font-size:12.5px;padding:8px 14px;border-radius:8px;cursor:pointer;white-space:nowrap;transition:.15s}
.gt-btn.blue{background:#0284c7;color:#fff}.gt-btn.blue:hover{background:#0369a1}
.gt-btn.gray{background:#1e293b;border:1px solid #334155;color:#f1f5f9}.gt-btn.gray:hover{background:#334155}
.gt-log{background:#020617;border:1px solid #1e293b;border-radius:8px;padding:8px 11px;font-size:11.5px;color:#38bdf8;font-family:Consolas,monospace;min-height:44px;display:flex;align-items:center;word-break:break-all;line-height:1.45}
.gt-discord{background:#5865f2;border:none;color:#fff;font-weight:600;font-size:12px;padding:8px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none;transition:.15s}
.gt-discord:hover{background:#4752c4}
/* Pool modal */
.gt-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:2147483648;display:flex;align-items:center;justify-content:center}
.gt-modal{background:#0f172a;border:1px solid #334155;border-radius:12px;width:460px;max-width:92vw;padding:16px;color:#f8fafc}
.gt-modal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.gt-pool-list{max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:5px;margin:8px 0}
.gt-pi{background:#020617;padding:7px 10px;border-radius:6px;display:flex;align-items:center;font-size:12px}
.gt-pi-key{font-weight:700;color:#38bdf8;min-width:75px;flex-shrink:0}
.gt-pi-url{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 8px;color:#94a3b8}
.gt-pi-del{background:none;border:none;color:#ef4444;cursor:pointer;font-weight:700}
    `;
    document.head.appendChild(style);

    // ── HTML ─────────────────────────────────────────────────────────────────
    const hud = document.createElement("div");
    hud.id = "gtraffic-hud-container";
    hud.innerHTML = `
<div class="gt-hdr" id="gt-drag-handle">
  <div style="display:flex;align-items:center"><span class="gt-dot"></span><span class="gt-title">gtraffic bypass <span class="gt-author">(Duyzoz)</span></span></div>
  <div class="gt-badge" id="gt-badge">Sẵn sàng</div>
</div>
<div class="gt-body">
  <div class="gt-row">
    <span class="gt-lbl">Tự động quét ảnh → URL & Key</span>
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
    document.body.appendChild(hud);

    // Drag
    makeDraggable(hud, hud.querySelector("#gt-drag-handle"));

    // Bind UI events
    bindEvents(taskKey, hud);

    // Ngừng observe sau khi mount thành công
    _hudObserver.disconnect();
  }

  // ── DRAG ─────────────────────────────────────────────────────────────────
  function makeDraggable(el, handle) {
    let x0, y0, l0, t0;
    handle.addEventListener("mousedown", e => {
      x0 = e.clientX; y0 = e.clientY;
      l0 = el.offsetLeft; t0 = el.offsetTop;
      el.style.bottom = "auto"; el.style.right = "auto";
      el.style.left = l0 + "px"; el.style.top = t0 + "px";
      const onMove = e2 => {
        el.style.left = (l0 + e2.clientX - x0) + "px";
        el.style.top  = (t0 + e2.clientY - y0) + "px";
      };
      const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      e.preventDefault();
    });
  }

  // ── BIND EVENTS ──────────────────────────────────────────────────────────
  function bindEvents(taskKey, hud) {
    const $id   = id => hud.querySelector("#" + id);
    const badge = $id("gt-badge");
    const log   = $id("gt-log");
    const urlIn = $id("gt-url");
    const autoCb = $id("gt-auto");

    const setBadge = (txt, cls="") => { badge.textContent = txt; badge.className = "gt-badge " + cls; };
    const setLog   = (txt, col="#38bdf8") => { log.textContent = txt; log.style.color = col; };

    // Restore settings
    autoCb.checked = !!getSettings().autoRun;
    autoCb.addEventListener("change", e => saveSettings({ autoRun: e.target.checked }));

    // Check pool first
    const pool = getPool();
    if (pool[taskKey]?.url) {
      urlIn.value = pool[taskKey].url;
      setBadge("Đã có trong Pool", "info");
      setLog("✨ Database: " + pool[taskKey].url);
      if (autoCb.checked) setTimeout(doStart, 900);
    } else {
      setTimeout(() => doScan(taskKey), 1000);
    }

    $id("gt-rescan").onclick = () => doScan(taskKey);
    $id("gt-ocrkey").onclick = () => doScan(taskKey);
    $id("gt-start").onclick  = doStart;
    $id("gt-pool").onclick   = showPool;

    // Sync countdown badge from tab ngầm
    if (typeof GM_addValueChangeListener === "function") {
      GM_addValueChangeListener(KEY_PING, (_, __, v) => {
        if (v?.key === taskKey) {
          setBadge(`Đang ủ: ${v.seconds}s`, "info");
          setLog(`⏳ Tab ngầm đếm ngược: ${v.seconds}s`);
        }
      });
      GM_addValueChangeListener(KEY_DONE, (_, __, v) => {
        if (v?.key === taskKey && v.code) {
          setBadge("Hoàn thành!", "ok");
          setLog("🎉 Mã: [ " + v.code + " ]", "#22c55e");
          copyToClipboard(v.code);
          // Điền tự động vào form GTraffic nếu có
          const inp = document.querySelector('input[id*="code"],input[name*="code"],input[placeholder*="mã"],.form-control[type="text"]');
          if (inp) { inp.value = v.code; inp.dispatchEvent(new Event("input", {bubbles:true})); }
        }
      });
    }

    // ── SCAN OCR ─────────────────────────────────────────────────────────
    function doScan(key) {
      setBadge("Đang quét...", "info");
      setLog("🔍 Tìm ảnh nhiệm vụ trên trang...");

      // Selector ưu tiên theo đặc điểm DOM thật của GTraffic
      const img = document.querySelector('img[alt="Anh tim kiem"]')
                || document.querySelector('img[src*="cdn.gtraffic.io"]')
                || document.querySelector('img[srcset*="cdn.gtraffic.io"]')
                || (() => {
                    for (const i of document.querySelectorAll("img")) {
                      const pt = i.closest("div,section,p")?.innerText || "";
                      if (/bước\s*0?2/i.test(pt) || /tìm.+truy.+cập/i.test(pt)) return i;
                    }
                  })();

      if (!img) {
        setBadge("Không thấy ảnh", "err");
        setLog("❌ Chưa thấy ảnh nhiệm vụ. Nhập link tay hoặc chờ trang tải xong!");
        return;
      }

      const src = img.currentSrc || img.src || (img.srcset || "").split(" ")[0];
      setLog("📡 Tải ảnh từ CDN (kèm Referer)...");

      // Tải ảnh qua GM để bypass CDN 403
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
      fd.append("language", "eng");         // eng = Latin charset, không lỗi E201
      fd.append("isOverlayRequired", "false");
      fd.append("OCREngine", "2");
      fd.append("scale", "true");
      fd.append("detectOrientation", "true");

      GM_xmlhttpRequest({
        method: "POST", url: OCR_API_URL, data: fd,
        onload(res) {
          try {
            const json = JSON.parse(res.responseText);
            const text = json?.ParsedResults?.[0]?.ParsedText || "";
            if (!text) {
              const errMsg = json?.ErrorMessage?.[0] || "OCR trả về rỗng";
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

    // ── PARSE DOMAIN (không ping, không recover) ──────────────────────────
    function handleOcrText(raw, key) {
      // Loại bỏ TẤT CẢ ký tự non-ASCII ngay từ đầu
      const clean = raw.replace(/[^\x20-\x7E\n]/g, " ");

      // Tìm domain tốt nhất theo thứ tự ưu tiên
      const domain = extractDomain(clean);

      if (!domain) {
        setBadge("Không tìm thấy", "err");
        setLog("⚠️ OCR không thấy domain rõ ràng. Vui lòng nhập tay!");
        return;
      }

      const finalUrl = sanitizeUrl(domain);
      if (!finalUrl) {
        setBadge("URL không hợp lệ", "err");
        setLog("⚠️ Domain OCR ra bị lỗi ký tự. Nhập tay: " + domain);
        urlIn.value = domain; // để user tự sửa
        return;
      }

      urlIn.value = finalUrl;
      setBadge("Đã nhận diện ✓", "ok");
      setLog("✅ " + finalUrl);

      // Lưu Pool
      const p = getPool();
      p[key] = { url: finalUrl, date: Date.now() };
      savePool(p);

      if (autoCb.checked) setTimeout(doStart, 900);
    }

    function extractDomain(cleanText) {
      const TLD = "com\\.vn|net\\.vn|org\\.vn|com|vn|net|org|co|in|io|top|club|xyz|site|vip|cc|biz|info|live|app|win|bet|me|online|tv|news|blog|store";
      const re  = new RegExp(`(?:https?:\\/\\/)?([a-zA-Z0-9][a-zA-Z0-9_\\-]{1,})\\.(?:${TLD})`, "gi");

      const candidates = [];
      let m;
      while ((m = re.exec(cleanText)) !== null) {
        const full = m[0].replace(/^https?:\/\//i,"").replace(/[.*_~-]+$/,"");
        // Lọc bỏ domain không có nghĩa / quá ngắn
        if (full.length > 5 && !full.startsWith("gtraffic")) {
          candidates.push(full);
        }
      }
      if (!candidates.length) return null;

      // Ưu tiên domain dài nhất (thường là domain thật, tránh nhầm tên chương trình)
      candidates.sort((a,b) => b.length - a.length);
      return candidates[0];
    }

    // ── START EXECUTION ───────────────────────────────────────────────────
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

    // ── POOL MODAL ────────────────────────────────────────────────────────
    function showPool() {
      const ov = document.createElement("div");
      ov.className = "gt-overlay";
      const pool = getPool();
      const entries = Object.entries(pool);
      ov.innerHTML = `
<div class="gt-modal">
  <div class="gt-modal-hdr">
    <b style="font-size:14px">📦 Database Pool</b>
    <button id="gp-close" style="background:none;border:none;color:#f1f5f9;font-size:18px;cursor:pointer">✕</button>
  </div>
  <div class="gt-pool-list" id="gp-list">
    ${entries.length ? entries.map(([k,v])=>`
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
      ov.querySelector("#gp-ok").onclick = close;
      ov.querySelector("#gp-clear").onclick = () => { if (confirm("Xóa toàn bộ Pool?")) { savePool({}); close(); } };
      ov.querySelectorAll(".gt-pi-del").forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        const p = getPool(); delete p[k]; savePool(p);
        b.closest(".gt-pi").remove();
      });
    }
  }

})();
