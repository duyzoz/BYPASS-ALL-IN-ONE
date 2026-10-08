// ==UserScript==
// @name         Bypass Link All-in-One HUD (Duyzoz Edition)
// @namespace    https://github.com/duyzoz/BYPASS-ALL-IN-ONE
// @version      2.0.0
// @description  Tự động vượt link rút gọn, giữ phiên ngầm an toàn, đè giao diện Glassmorphism HUD siêu đẹp.
// @author       Duyzoz
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Cấu hình thời gian chờ an toàn (tránh bị phát hiện spam / anti-bot)
    const SAFE_WAIT_SECONDS = 65;

    // Danh sách các domain hỗ trợ nhận diện tự động
    const SUPPORTED_PATTERNS = [
        /link4sub\.com\/[\w\-]+/i,
        /funlink\.io\/[A-Za-z0-9]+/i,
        /linktot\.net/i,
        /traffic-user\.net/i,
        /layma\.net/i
    ];

    const currentUrl = window.location.href;
    const isSupported = SUPPORTED_PATTERNS.some(reg => reg.test(currentUrl));

    if (!isSupported) {
        // Nếu không thuộc domain hỗ trợ tự động, không tiêm UI để tránh làm phiền web khác
        return;
    }

    // 1. INJECT CSS GIAO DIỆN GLASSMORPHISM
    const styles = `
        #duyzoz-bypass-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(10, 15, 29, 0.9);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #f8fafc;
            user-select: none;
            transition: opacity 0.4s ease;
        }

        .duyzoz-modal {
            background: rgba(30, 41, 59, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 24px;
            padding: 36px 42px;
            width: 450px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 35px rgba(99, 102, 241, 0.25);
            text-align: center;
            position: relative;
            animation: modalPop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalPop {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .duyzoz-badge {
            display: inline-block;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.4);
            color: #818cf8;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 999px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .duyzoz-title {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 6px;
            background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .duyzoz-author {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 20px;
        }

        .duyzoz-status {
            font-size: 14px;
            color: #cbd5e1;
            margin-bottom: 20px;
            min-height: 20px;
        }

        .duyzoz-timer {
            font-size: 38px;
            font-weight: 800;
            color: #f8fafc;
            font-variant-numeric: tabular-nums;
            margin-bottom: 16px;
            text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }

        .duyzoz-progress-track {
            width: 100%;
            height: 10px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 999px;
            overflow: hidden;
            margin-bottom: 20px;
        }

        .duyzoz-progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #06b6d4, #6366f1);
            border-radius: 999px;
            transition: width 1s linear;
            box-shadow: 0 0 14px rgba(99, 102, 241, 0.8);
        }

        .duyzoz-log-console {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 12px 14px;
            font-size: 12px;
            color: #94a3b8;
            text-align: left;
            max-height: 85px;
            overflow-y: auto;
            line-height: 1.5;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .duyzoz-log-item { margin-bottom: 3px; }
        .duyzoz-log-item.success { color: #34d399; font-weight: 600; }
        .duyzoz-log-item.info { color: #38bdf8; }
        .duyzoz-log-item.warn { color: #fbbf24; }

        .duyzoz-btn-close {
            position: absolute;
            top: 14px;
            right: 18px;
            background: transparent;
            border: none;
            color: #64748b;
            font-size: 20px;
            cursor: pointer;
            transition: color 0.2s;
        }
        .duyzoz-btn-close:hover { color: #f1f5f9; }
    `;

    // 2. TẠO DOM GIAO DIỆN
    function initOverlay() {
        if (document.getElementById('duyzoz-bypass-overlay')) return;
        GM_addStyle(styles);

        const overlay = document.createElement('div');
        overlay.id = 'duyzoz-bypass-overlay';
        overlay.innerHTML = `
            <div class="duyzoz-modal">
                <button class="duyzoz-btn-close" id="duyzoz-close-btn">✕</button>
                <div class="duyzoz-badge">Bypass Engine v2.0</div>
                <div class="duyzoz-title">BYPASS ALL IN ONE</div>
                <div class="duyzoz-author">Developed by Duyzoz</div>

                <div class="duyzoz-status" id="duyzoz-status-text">Đang nhận diện liên kết...</div>
                <div class="duyzoz-timer" id="duyzoz-timer-text">${SAFE_WAIT_SECONDS}s</div>

                <div class="duyzoz-progress-track">
                    <div class="duyzoz-progress-fill" id="duyzoz-progress-bar"></div>
                </div>

                <div class="duyzoz-log-console" id="duyzoz-log-container">
                    <div class="duyzoz-log-item info">> Hệ thống đã kích hoạt.</div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('duyzoz-close-btn').onclick = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 400);
        };
    }

    function addLog(msg, type = 'info') {
        const logBox = document.getElementById('duyzoz-log-container');
        const statusBox = document.getElementById('duyzoz-status-text');
        if (statusBox) statusBox.innerText = msg;
        if (logBox) {
            const el = document.createElement('div');
            el.className = `duyzoz-log-item ${type}`;
            el.innerText = `> ${msg}`;
            logBox.appendChild(el);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }

    function startTimer(seconds, onFinish) {
        let left = seconds;
        const timerEl = document.getElementById('duyzoz-timer-text');
        const barEl = document.getElementById('duyzoz-progress-bar');

        const interval = setInterval(() => {
            left--;
            if (timerEl) timerEl.innerText = `${left}s`;
            if (barEl) {
                const pct = ((seconds - left) / seconds) * 100;
                barEl.style.width = `${pct}%`;
            }

            if (left <= 0) {
                clearInterval(interval);
                onFinish();
            }
        }, 1000);
    }

    // 3. LOGIC XỬ LÝ THEO TỪNG LOẠI LINK
    function handleBypass() {
        initOverlay();

        // [Case 1] LINK4SUB: Bóc tách trực tiếp không cần chờ
        if (/link4sub\.com\/([\w\-]+)/i.test(currentUrl)) {
            const scode = currentUrl.match(/link4sub\.com\/([\w\-]+)/i)[1];
            addLog("Phát hiện Link4Sub. Đang giải mã dữ liệu tức thì...", "info");

            GM_xmlhttpRequest({
                method: "GET",
                url: `https://link4sub.com/stu/${scode}/fetch-data`,
                onload: (res) => {
                    try {
                        const json = JSON.parse(res.responseText);
                        const encoded = json?.data?.data?.lnk?.lnk1?.url;
                        if (encoded) {
                            const raw = atob(encoded);
                            const target = decodeURIComponent(raw);
                            addLog("Giải mã thành công!", "success");
                            document.getElementById('duyzoz-timer-text').innerText = "DONE!";
                            document.getElementById('duyzoz-progress-bar').style.width = "100%";
                            GM_setClipboard(target);
                            setTimeout(() => { window.location.href = target; }, 1200);
                        } else {
                            addLog("Không tìm thấy link đích!", "warn");
                        }
                    } catch (e) {
                        addLog("Lỗi giải mã: " + e.message, "warn");
                    }
                }
            });
            return;
        }

        // [Case 2] CÁC HỆ THỐNG CẦN CHỜ (YeuMoney, LinkTot, FunLink)
        addLog("Đang thiết lập phiên ngầm an toàn...", "info");
        startTimer(SAFE_WAIT_SECONDS, () => {
            addLog("Đã hết thời gian chờ an toàn. Đang quét mã xác nhận...", "info");

            // Tự động tìm mã trong DOM hoặc API
            const codeEl = document.querySelector('[id*="layma"], [id*="vuatraffic"], .traffic-code, #code_traffic');
            let foundCode = codeEl ? codeEl.innerText.trim().match(/\d{4,8}/)?.[0] : null;

            if (foundCode) {
                addLog(`Lấy mã thành công: ${foundCode}`, "success");
                GM_setClipboard(foundCode);

                // Auto fill input
                const inp = document.querySelector('input[name*="code"], input[id*="code"], input[placeholder*="mã"]');
                if (inp) {
                    inp.value = foundCode;
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                    addLog("Đã tự động điền mã vào biểu mẫu!", "success");

                    const btn = document.querySelector('button[type="submit"], .btn-submit, #btn-continue');
                    if (btn) {
                        setTimeout(() => btn.click(), 800);
                    }
                }
            } else {
                addLog("Hoàn tất thời gian. Vui lòng bấm Lấy mã trên web!", "info");
            }
        });
    }

    // Tự động khởi chạy
    window.addEventListener('load', handleBypass);
})();
