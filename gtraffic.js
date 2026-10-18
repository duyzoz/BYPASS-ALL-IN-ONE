/**
 * =========================================================================
 * GTraffic Bypass All-In-One (Duyzoz Edition) - Core Engine
 * Author: Duyzoz
 * Repo: https://github.com/duyzoz/BYPASS-ALL-IN-ONE
 * =========================================================================
 */

(function () {
  'use strict';

  const OCR_API_KEY = "K84564487988957";
  const OCR_API_URL = "https://api.ocr.space/parse/image";
  const DISCORD_URL = "https://discord.gg/vnbp";

  // Storage Keys
  const KEY_POOL = "gtraffic_pool_db";
  const KEY_SETTINGS = "gtraffic_settings";
  const KEY_SESSION = "gtraffic_active_session";
  const KEY_PING = "gtraffic_sync_ping";
  const KEY_DONE = "gtraffic_sync_done";

  // Check if current page is GTraffic or Target Website
  const isGTraffic = window.location.hostname.includes("gtraffic.io");

  // =========================================================================
  // UTILITY FUNCTIONS
  // =========================================================================

  function copyToClipboard(text) {
    if (typeof GM_setClipboard === "function") {
      try {
        GM_setClipboard(text, "text");
        return true;
      } catch (e) {}
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      return true;
    }
    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {}
    document.body.removeChild(ta);
    return ok;
  }

  function getPool() {
    return GM_getValue(KEY_POOL, {});
  }

  function savePool(pool) {
    GM_setValue(KEY_POOL, pool);
  }

  function getSettings() {
    return GM_getValue(KEY_SETTINGS, { autoRun: true });
  }

  function saveSettings(st) {
    GM_setValue(KEY_SETTINGS, st);
  }

  // =========================================================================
  // TARGET WEBSITE MODE: Anti-freeze, Fake Referrer, Auto-Click, Countdown, Copy
  // =========================================================================
  if (!isGTraffic) {
    initTargetPage();
    return;
  }

  function initTargetPage() {
    // 1. FAKE GOOGLE REFERRER (Chạy ngay lập tức ở document-start)
    try {
      Object.defineProperty(document, "referrer", {
        get: () => "https://www.google.com/",
        configurable: true
      });
    } catch (e) {}

    // 2. FIX TAB (Chống đóng băng khi chạy ở background tab)
    const blockedEvents = ["visibilitychange", "webkitvisibilitychange", "blur", "focusout", "pagehide"];
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (blockedEvents.includes(type)) return;
      return originalAddEventListener.apply(this, arguments);
    };

    const fakeState = {
      hidden: false,
      webkitHidden: false,
      visibilityState: "visible",
      webkitVisibilityState: "visible"
    };
    for (const [k, v] of Object.entries(fakeState)) {
      try {
        Object.defineProperty(document, k, { get: () => v, configurable: true });
      } catch (e) {}
    }
    document.hasFocus = () => true;
    window.onblur = null;

    // Ép requestAnimationFrame chạy 60 FPS ngầm
    window.requestAnimationFrame = function (callback) {
      return window.setTimeout(() => callback(performance.now()), 16);
    };
    window.cancelAnimationFrame = function (id) {
      window.clearTimeout(id);
    };

    console.log("[GTraffic Bypass] Target Website Agent đã kích hoạt thành công!");

    // 3. VÒNG LẶP KIỂM TRA CLICK & ĐẾM NGƯỢC
    let hasClicked = false;
    let lastReportedSec = null;

    const checkInterval = setInterval(() => {
      const session = GM_getValue(KEY_SESSION, null);
      if (!session || !session.key) return;

      // Nhiệm vụ 1: Tìm và click nút G / #avt-btn
      const btn = document.querySelector("#avt-btn");
      if (btn && btn.isConnected && !hasClicked) {
        btn.style.setProperty("position", "fixed", "important");
        btn.style.setProperty("top", "50%", "important");
        btn.style.setProperty("left", "50%", "important");
        btn.style.setProperty("transform", "translate(-50%, -50%)", "important");
        btn.style.setProperty("z-index", "2147483647", "important");
        btn.style.setProperty("outline", "4px solid red", "important");

        const rect = btn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        ["mousedown", "mouseup", "click"].forEach(evtName => {
          btn.dispatchEvent(new MouseEvent(evtName, {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            button: 0
          }));
        });
        hasClicked = true;
        console.log("[GTraffic Bypass] Đã click nút #avt-btn!");
      }

      // Nhiệm vụ 2: Quét số giây đếm ngược và đồng bộ về Tab Mẹ
      let remainingSec = null;
      // Tìm số đếm trong vòng tròn hoặc thẻ chứa số
      const countdownEls = document.querySelectorAll(
        '.countdown, [class*="timer"], [id*="timer"], [class*="countdown"], [id*="count"], .trade-btn__content'
      );
      for (const el of countdownEls) {
        const text = el.innerText ? el.innerText.trim() : "";
        const match = text.match(/(\d{1,3})/);
        if (match && parseInt(match[1], 10) > 0 && parseInt(match[1], 10) <= 120) {
          remainingSec = parseInt(match[1], 10);
          break;
        }
      }

      if (remainingSec !== null && remainingSec !== lastReportedSec) {
        lastReportedSec = remainingSec;
        GM_setValue(KEY_PING, {
          key: session.key,
          seconds: remainingSec,
          timestamp: Date.now()
        });
      }

      // Nhiệm vụ 3: Tự động copy mã khi hoàn thành
      const codeContainer = document.querySelector('.trade-btn__content.copy-allowed, [class*="copy-allowed"]');
      if (codeContainer) {
        const codeText = codeContainer.textContent ? codeContainer.textContent.replace(/\s+/g, "").trim() : "";
        if (codeText.length >= 4) {
          copyToClipboard(codeText);
          codeContainer.style.setProperty("background-color", "#22c55e", "important");
          codeContainer.style.setProperty("color", "#ffffff", "important");

          console.log("[GTraffic Bypass] 🎉 ĐÃ LẤY ĐƯỢC MÃ:", codeText);

          // Báo hoàn thành cho Tab Mẹ
          GM_setValue(KEY_DONE, {
            key: session.key,
            code: codeText,
            timestamp: Date.now()
          });

          // Xóa session đang chạy
          GM_deleteValue(KEY_SESSION);
          clearInterval(checkInterval);

          // Tự động đóng tab con sau 2 giây
          setTimeout(() => {
            try {
              window.close();
            } catch (e) {}
          }, 2000);
        }
      }
    }, 500);
  }

  // =========================================================================
  // GTRAFFIC TASK PAGE MODE: UI HUD, OCR, Pool Cache & Runner
  // =========================================================================

  document.addEventListener("DOMContentLoaded", () => {
    initGTrafficMaster();
  });
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initGTrafficMaster();
  }

  let isInitialized = false;
  function initGTrafficMaster() {
    if (isInitialized) return;
    isInitialized = true;

    // Trích xuất Key từ URL (vd: https://gtraffic.io/3sQJA_W -> key = "3sQJA_W")
    const pathMatch = window.location.pathname.match(/^\/([a-zA-Z0-9_-]+)/);
    const taskKey = pathMatch ? pathMatch[1] : "UNKNOWN";

    injectHudUI(taskKey);
  }

  function injectHudUI(taskKey) {
    if (document.getElementById("gtraffic-hud-container")) return;

    // Tạo CSS Style
    const style = document.createElement("style");
    style.id = "gtraffic-hud-style";
    style.textContent = `
      #gtraffic-hud-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 14px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7);
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        z-index: 2147483647;
        box-sizing: border-box;
        overflow: hidden;
        user-select: none;
      }
      #gtraffic-hud-container * {
        box-sizing: border-box;
      }
      .gt-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border-bottom: 1px solid #1e293b;
        background: #111e38;
        cursor: grab;
      }
      .gt-title-box {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .gt-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #38bdf8;
        box-shadow: 0 0 10px #38bdf8;
        display: inline-block;
      }
      .gt-title {
        font-weight: 700;
        font-size: 14px;
        color: #ffffff;
      }
      .gt-author {
        color: #94a3b8;
        font-weight: 500;
        font-size: 13px;
      }
      .gt-badge {
        background: #1e293b;
        border: 1px solid #f59e0b;
        color: #f59e0b;
        font-size: 11.5px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 20px;
        max-width: 170px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .gt-badge.success {
        border-color: #22c55e;
        color: #22c55e;
      }
      .gt-badge.info {
        border-color: #38bdf8;
        color: #38bdf8;
      }
      .gt-body {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .gt-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .gt-label {
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
      }
      .gt-btn-text {
        background: none;
        border: none;
        color: #38bdf8;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
      }
      .gt-btn-text:hover {
        text-decoration: underline;
      }
      .gt-input {
        width: 100%;
        background: #020617;
        border: 1px solid #1e293b;
        border-radius: 7px;
        padding: 8px 10px;
        color: #ffffff;
        font-size: 12.5px;
        outline: none;
        font-family: Consolas, monospace;
      }
      .gt-input:focus {
        border-color: #0284c7;
      }
      .gt-key-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .gt-controls-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 4px;
      }
      .gt-checkbox-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: #cbd5e1;
        cursor: pointer;
        flex: 1;
      }
      .gt-btn-primary {
        background: #0284c7;
        border: none;
        color: #ffffff;
        font-weight: 700;
        font-size: 13px;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.2s;
        white-space: nowrap;
      }
      .gt-btn-primary:hover {
        background: #0369a1;
      }
      .gt-btn-secondary {
        background: #1e293b;
        border: 1px solid #334155;
        color: #f1f5f9;
        font-weight: 600;
        font-size: 12.5px;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.2s;
      }
      .gt-btn-secondary:hover {
        background: #334155;
      }
      .gt-console {
        background: #020617;
        border: 1px solid #1e293b;
        border-radius: 8px;
        padding: 9px 12px;
        font-size: 12px;
        color: #38bdf8;
        font-family: Consolas, monospace;
        min-height: 38px;
        display: flex;
        align-items: center;
        word-break: break-all;
      }
      .gt-btn-discord {
        background: #5865f2;
        border: none;
        color: #ffffff;
        font-weight: 600;
        font-size: 12.5px;
        padding: 8px 14px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: 0.2s;
        text-decoration: none;
      }
      .gt-btn-discord:hover {
        background: #4752c4;
      }
      .gt-modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .gt-modal {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 12px;
        width: 460px;
        max-width: 90vw;
        padding: 16px;
        color: #f8fafc;
      }
      .gt-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .gt-pool-list {
        max-height: 250px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin: 10px 0;
      }
      .gt-pool-item {
        background: #020617;
        padding: 8px 10px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
      }
      .gt-pool-key {
        font-weight: 700;
        color: #38bdf8;
        min-width: 80px;
      }
      .gt-pool-url {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0 8px;
        color: #94a3b8;
      }
      .gt-pool-del {
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        font-weight: 700;
      }
    `;
    document.head.appendChild(style);

    // Tạo HTML
    const hud = document.createElement("div");
    hud.id = "gtraffic-hud-container";
    hud.innerHTML = `
      <div class="gt-header" id="gt-header-drag">
        <div class="gt-title-box">
          <span class="gt-dot"></span>
          <span class="gt-title">gtraffic bypass <span class="gt-author">(Duyzoz)</span></span>
        </div>
        <div class="gt-badge" id="gt-badge">Sẵn sàng</div>
      </div>
      <div class="gt-body">
        <div class="gt-row">
          <span class="gt-label">Tự động quét ảnh → URL & Key</span>
          <button class="gt-btn-text" id="gt-btn-rescan">Quét lại</button>
        </div>
        <div class="gt-row">
          <span class="gt-label">URL / Link ảnh / Từ khóa</span>
          <button class="gt-btn-text" id="gt-btn-ocrkey">Quét Key</button>
        </div>
        <input type="text" class="gt-input" id="gt-url-input" placeholder="https://domain-dich.com/">

        <div class="gt-key-row">
          <span class="gt-label">Key</span>
          <input type="text" class="gt-input" id="gt-key-input" value="${taskKey}" readonly>
        </div>

        <div class="gt-controls-row">
          <label class="gt-checkbox-label">
            <input type="checkbox" id="gt-autorun-chk"> Tự động chạy
          </label>
          <button class="gt-btn-primary" id="gt-btn-start">Lấy mã ngay</button>
          <button class="gt-btn-secondary" id="gt-btn-pool">+Pool</button>
        </div>

        <div class="gt-console" id="gt-console">Đang chờ quét nhiệm vụ...</div>

        <a class="gt-btn-discord" href="${DISCORD_URL}" target="_blank">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Join Discord nhận bản cập nhật
        </a>
      </div>
    `;
    document.body.appendChild(hud);

    // Kéo thả HUD
    makeDraggable(hud, document.getElementById("gt-header-drag"));

    // Khởi tạo logic điều khiển HUD
    bindHudEvents(taskKey);
  }

  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.bottom = "auto";
      element.style.right = "auto";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function bindHudEvents(taskKey) {
    const badge = document.getElementById("gt-badge");
    const consoleBox = document.getElementById("gt-console");
    const urlInput = document.getElementById("gt-url-input");
    const autoRunChk = document.getElementById("gt-autorun-chk");
    const btnStart = document.getElementById("gt-btn-start");
    const btnRescan = document.getElementById("gt-btn-rescan");
    const btnOcrKey = document.getElementById("gt-btn-ocrkey");
    const btnPool = document.getElementById("gt-btn-pool");

    const settings = getSettings();
    autoRunChk.checked = !!settings.autoRun;
    autoRunChk.addEventListener("change", e => {
      saveSettings({ autoRun: e.target.checked });
    });

    function setLog(msg, color = "#38bdf8") {
      consoleBox.innerText = msg;
      consoleBox.style.color = color;
      console.log("[GTraffic HUD]", msg);
    }

    function setBadge(msg, type = "normal") {
      badge.innerText = msg;
      badge.className = "gt-badge " + type;
    }

    // Kiểm tra trong Pool Database trước
    const pool = getPool();
    if (pool[taskKey] && pool[taskKey].url) {
      urlInput.value = pool[taskKey].url;
      setBadge("Đã có trong Pool", "info");
      setLog(`✨ Tải từ Database Key: ${pool[taskKey].url}`);

      if (autoRunChk.checked) {
        setTimeout(startExecution, 1000);
      }
    } else {
      // Nếu chưa có trong Pool -> Quét OCR tự động
      setTimeout(() => scanAndExtract(taskKey), 1200);
    }

    btnRescan.addEventListener("click", () => scanAndExtract(taskKey));
    btnOcrKey.addEventListener("click", () => scanAndExtract(taskKey));

    btnStart.addEventListener("click", startExecution);
    btnPool.addEventListener("click", showPoolModal);

    // =====================================================================
    // HÀM QUÉT ẢNH VÀ GỌI OCR.SPACE
    // =====================================================================
    function scanAndExtract(key) {
      setBadge("Đang quét OCR...", "info");
      setLog("🔍 Đang tìm ảnh nhiệm vụ trên trang...");

      // Cách tìm ảnh nhiệm vụ chuẩn xác:
      // 1. Tìm trong khối Bước 2 / Hướng dẫn
      let taskImg = null;
      const allImgs = Array.from(document.querySelectorAll("img"));

      for (const img of allImgs) {
        const parentText = img.closest("div, section, p, table")?.innerText || "";
        if (
          /bước\s*0?2/i.test(parentText) ||
          /hình ảnh bên dưới/i.test(parentText) ||
          /tìm và truy cập/i.test(parentText)
        ) {
          taskImg = img;
          break;
        }
      }

      // 2. Dự phòng: Tìm ảnh có kích thước phù hợp (trừ logo)
      if (!taskImg) {
        taskImg = allImgs.find(img => {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          return w > 180 && h > 60 && !img.src.includes("logo") && !img.src.includes("icon");
        });
      }

      if (!taskImg) {
        setBadge("Không thấy ảnh", "normal");
        setLog("❌ Không tìm thấy ảnh nhiệm vụ. Vui lòng nhập link tay!");
        return;
      }

      setLog("📡 Đang gửi ảnh sang OCR.space...");

      // Gọi OCR API
      callOcrApi(taskImg, (err, text) => {
        if (err || !text) {
          setBadge("Lỗi OCR", "normal");
          setLog("❌ Lỗi OCR: " + (err || "Không nhận diện được chữ"));
          return;
        }

        setLog("✨ Đã đọc xong OCR! Đang phân tích domain...");

        // Phân tích domain từ text
        const domain = parseDomainFromOcr(text);
        if (domain) {
          const finalUrl = domain.startsWith("http") ? domain : `https://${domain}/`;
          urlInput.value = finalUrl;
          setBadge("Đã nhận diện", "success");
          setLog(`✅ Domain: ${domain}`);

          // Lưu vào Pool Database
          const currentPool = getPool();
          currentPool[key] = { url: finalUrl, date: Date.now() };
          savePool(currentPool);

          // Nếu có bật Tự động chạy
          if (autoRunChk.checked) {
            setTimeout(startExecution, 1000);
          }
        } else {
          setBadge("Cần nhập tay", "normal");
          setLog("⚠️ Không trích xuất được domain rõ ràng từ OCR.");
        }
      });
    }

    function callOcrApi(imgEl, callback) {
      try {
        // Chuyển ảnh sang Base64 để tránh lỗi CORS hotlinking
        const canvas = document.createElement("canvas");
        canvas.width = imgEl.naturalWidth || imgEl.width;
        canvas.height = imgEl.naturalHeight || imgEl.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgEl, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");

        const formData = new FormData();
        formData.append("apikey", OCR_API_KEY);
        formData.append("base64Image", dataUrl);
        formData.append("language", "vie");
        formData.append("isOverlayRequired", "false");
        formData.append("OCREngine", "2");
        formData.append("scale", "true");
        formData.append("detectOrientation", "true");

        GM_xmlhttpRequest({
          method: "POST",
          url: OCR_API_URL,
          data: formData,
          onload: function (res) {
            try {
              const json = JSON.parse(res.responseText);
              if (json && json.ParsedResults && json.ParsedResults[0]) {
                callback(null, json.ParsedResults[0].ParsedText);
              } else {
                callback(json.ErrorMessage || "OCR trả về rỗng");
              }
            } catch (ex) {
              callback(ex.message);
            }
          },
          onerror: function (err) {
            callback("Lỗi kết nối OCR API");
          }
        });
      } catch (err) {
        // Fallback: Gửi bằng URL ảnh trực tiếp
        const formData = new FormData();
        formData.append("apikey", OCR_API_KEY);
        formData.append("url", imgEl.src);
        formData.append("language", "vie");
        formData.append("OCREngine", "2");

        GM_xmlhttpRequest({
          method: "POST",
          url: OCR_API_URL,
          data: formData,
          onload: function (res) {
            try {
              const json = JSON.parse(res.responseText);
              if (json && json.ParsedResults && json.ParsedResults[0]) {
                callback(null, json.ParsedResults[0].ParsedText);
              } else {
                callback(json.ErrorMessage || "OCR trả về rỗng");
              }
            } catch (ex) {
              callback(ex.message);
            }
          },
          onerror: function (err) {
            callback("Lỗi mạng OCR");
          }
        });
      }
    }

    function parseDomainFromOcr(rawText) {
      // 1. Tìm URL dạng https://domain.com
      const urlMatch = rawText.match(/https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/i);
      if (urlMatch) return urlMatch[1];

      // 2. Tìm domain dạng xxx.com, xxx.vn, xxx.in, xxx.net, xxx.org
      const domainMatch = rawText.match(/([a-zA-Z0-9-]{3,}\.(?:com|vn|net|org|in|io|top|club|xyz|site|vip|cc))/i);
      if (domainMatch) return domainMatch[1];

      // 3. Tìm dạng bị che: filectui... -> lấy chữ đầu nếu cần
      const hiddenMatch = rawText.match(/([a-zA-Z0-9_-]{4,})\s*(?:\.\.\.|\*\*\*)/);
      if (hiddenMatch) return hiddenMatch[1];

      return null;
    }

    // =====================================================================
    // HÀM CHẠY TAB NGẦM VÀ LẮNG NGHE KẾT QUẢ
    // =====================================================================
    function startExecution() {
      const targetUrl = urlInput.value.trim();
      if (!targetUrl) {
        alert("Vui lòng quét hoặc nhập URL đích trước!");
        return;
      }

      setLog(`🚀 Đang mở tab ngầm: ${targetUrl}`);
      setBadge(`Đang ủ (${taskKey})...`, "info");

      // Lưu trạng thái session đang hoạt động
      GM_setValue(KEY_SESSION, {
        key: taskKey,
        targetUrl: targetUrl,
        startTime: Date.now()
      });

      // Mở Tab Ngầm (Background Tab)
      if (typeof GM_openInTab === "function") {
        GM_openInTab(targetUrl, {
          active: false,    // Không focus sang tab mới
          insert: true,
          setParent: true
        });
      } else {
        window.open(targetUrl, "_blank");
      }
    }

    // Lắng nghe tín hiệu đếm ngược từ Tab Con (PING)
    if (typeof GM_addValueChangeListener === "function") {
      GM_addValueChangeListener(KEY_PING, (name, oldVal, newVal) => {
        if (newVal && newVal.key === taskKey && newVal.seconds !== undefined) {
          setBadge(`Đang ủ (${taskKey}): ${newVal.seconds}s`, "info");
          setLog(`⏳ Đang đếm ngược: ${newVal.seconds}s`);
        }
      });

      // Lắng nghe tín hiệu hoàn tất lấy mã (DONE)
      GM_addValueChangeListener(KEY_DONE, (name, oldVal, newVal) => {
        if (newVal && newVal.key === taskKey && newVal.code) {
          setBadge("Hoàn thành!", "success");
          setLog(`🎉 ĐÃ LẤY MÃ THÀNH CÔNG: [ ${newVal.code} ]`, "#22c55e");
          copyToClipboard(newVal.code);

          // Tự động điền mã vào ô nhập của trang GTraffic (nếu có)
          const codeInput = document.querySelector('input[name*="code"], input[placeholder*="mã"], input[id*="code"], .form-control');
          if (codeInput) {
            codeInput.value = newVal.code;
            codeInput.dispatchEvent(new Event("input", { bubbles: true }));
            codeInput.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      });
    }

    // =====================================================================
    // MODAL QUẢN LÝ +POOL
    // =====================================================================
    function showPoolModal() {
      const overlay = document.createElement("div");
      overlay.className = "gt-modal-overlay";

      const currentPool = getPool();
      const entries = Object.entries(currentPool);

      let itemsHtml = "";
      if (entries.length === 0) {
        itemsHtml = '<div style="text-align:center; color:#94a3b8; padding:20px;">Chưa có Key/URL nào được lưu trong Pool.</div>';
      } else {
        itemsHtml = entries.map(([k, item]) => `
          <div class="gt-pool-item" data-key="${k}">
            <span class="gt-pool-key">${k}</span>
            <span class="gt-pool-url">${item.url}</span>
            <button class="gt-pool-del" data-key="${k}">Xóa</button>
          </div>
        `).join("");
      }

      overlay.innerHTML = `
        <div class="gt-modal">
          <div class="gt-modal-header">
            <h3 style="margin:0; font-size:15px; font-weight:700;">Quản lý Database Pool</h3>
            <button id="gt-close-modal" style="background:none; border:none; color:#f1f5f9; font-size:16px; cursor:pointer;">✕</button>
          </div>
          <div class="gt-pool-list" id="gt-pool-container">
            ${itemsHtml}
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:12px;">
            <button id="gt-clear-pool" style="background:#ef4444; border:none; color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer;">Xóa tất cả</button>
            <button id="gt-ok-modal" style="background:#0284c7; border:none; color:#fff; padding:6px 16px; border-radius:6px; cursor:pointer;">Đóng</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector("#gt-close-modal").onclick = () => overlay.remove();
      overlay.querySelector("#gt-ok-modal").onclick = () => overlay.remove();

      overlay.querySelectorAll(".gt-pool-del").forEach(btn => {
        btn.onclick = () => {
          const k = btn.dataset.key;
          delete currentPool[k];
          savePool(currentPool);
          btn.closest(".gt-pool-item").remove();
        };
      });

      overlay.querySelector("#gt-clear-pool").onclick = () => {
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ Pool Database?")) {
          savePool({});
          overlay.remove();
        }
      };
    }
  }
})();
