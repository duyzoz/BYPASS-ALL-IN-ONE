// ==UserScript==
// @name         Bypass Link All-in-One HUD (Made by Duyzoz)
// @namespace    https://github.com/duyzoz/BYPASS-ALL-IN-ONE
// @version      4.0.0
// @description  Clean 4-Layer Native DOM Bypass for LayMa.net & Link4Sub True Bypass
// @author       Duyzoz
// @match        *://layma.net/*
// @match        *://*.layma.net/*
// @match        *://link4sub.com/*
// @match        *://*.link4sub.com/*
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/bypass_hud.user.js
// @downloadURL  https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/bypass_hud.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-start
// ==UserScript==

(function () {
    'use strict';

    const pageWin = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    /* =========================================================================
     *  PHẦN 1: BỘ GIẢI MÃ LINK4SUB (TRUE BYPASS - KHÔNG CẦN SUB/LIKE)
     * ========================================================================= */
    let link4SubFound = false;

    function handleLink4SubDestination(targetUrl) {
        if (link4SubFound) return;
        link4SubFound = true;

        console.log("[Duyzoz Engine] Link4Sub đã giải mã thành công:", targetUrl);
        try { GM_setClipboard(targetUrl); } catch (e) {}

        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: #ffffff; padding: 18px 32px; border-radius: 16px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px; font-weight: bold;
            box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.3);
            z-index: 2147483647; text-align: center; line-height: 1.6;
        `;
        banner.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 4px;">🎉 MADE BY DUYZOZ: BYPASS LINK4SUB THÀNH CÔNG!</div>
            <div style="font-size: 12px; color: #d1fae5; font-weight: normal; margin-bottom: 12px;">
                Link đích: <span style="text-decoration: underline;">${targetUrl.substring(0, 60)}...</span> (Đã copy)
            </div>
            <a href="${targetUrl}" style="background: white; color: #059669; padding: 8px 20px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 800; display: inline-block;">ĐI ĐẾN LINK ĐÍCH NGAY ➜</a>
        `;
        (document.body || document.documentElement).appendChild(banner);

        setTimeout(() => { window.location.href = targetUrl; }, 1200);
    }

    function hookNetworkForLink4Sub() {
        if (!window.location.hostname.includes('link4sub.com')) return;

        const origFetch = window.fetch;
        if (origFetch) {
            window.fetch = async function (...args) {
                const response = await origFetch.apply(this, args);
                try {
                    const clone = response.clone();
                    clone.text().then(text => scanTextForEncodedUrl(text));
                } catch (e) {}
                return response;
            };
        }

        const origXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            this.addEventListener('load', function () {
                try { scanTextForEncodedUrl(this.responseText); } catch (e) {}
            });
            origXhrOpen.apply(this, arguments);
        };
    }

    function scanTextForEncodedUrl(text) {
        if (!text || link4SubFound) return;
        try {
            const json = JSON.parse(text);
            const rawUrl = json?.data?.data?.lnk?.lnk1?.url || json?.lnk?.lnk1?.url;
            if (rawUrl) {
                const decoded = decodeURIComponent(atob(rawUrl));
                if (decoded.startsWith('http')) {
                    handleLink4SubDestination(decoded);
                    return;
                }
            }
        } catch (e) {}

        const base64Regex = /(aHR0cHM6Ly[A-Za-z0-9+/=]{10,}|aHR0cDov[A-Za-z0-9+/=]{10,})/g;
        let match;
        while ((match = base64Regex.exec(text)) !== null) {
            try {
                const decoded = decodeURIComponent(atob(match[1]));
                if (decoded.startsWith('http') && !decoded.includes('youtube.com') && !decoded.includes('link4sub') && !decoded.includes('facebook.com')) {
                    handleLink4SubDestination(decoded);
                    return;
                }
            } catch (e) {}
        }
    }

    hookNetworkForLink4Sub();

    /* =========================================================================
     *  PHẦN 2: BYPASS LAYMA.NET 4 LỚP (CLEAN HYBRID ARCHITECTURE)
     * ========================================================================= */
    const isLayma = window.location.hostname.includes('layma');

    if (isLayma) {
        console.log("[Duyzoz Engine v4.0.0] Khởi động Clean 4-Layer Bypass Engine trên LayMa.net...");

        let autoSubmitted = false;
        let redirected = false;

        // Banner thông báo HUD gọn nhẹ ở góc trên
        function injectDuyzozHUDHeader() {
            if (document.getElementById('duyzoz-hud-floating-header')) return;
            const hud = document.createElement('div');
            hud.id = 'duyzoz-hud-floating-header';
            hud.style.cssText = `
                position: fixed; top: 12px; right: 12px; z-index: 2147483647;
                background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(8px);
                color: #ffffff; padding: 10px 16px; border-radius: 12px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 13px; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 8px;
            `;
            hud.innerHTML = `
                <span style="color:#60a5fa; font-size:15px;">⚡ Made by Duyzoz ✦</span>
                <span style="color:#94a3b8; font-size:11px;">(Engine v4.0.0 Active)</span>
            `;
            (document.body || document.documentElement).appendChild(hud);
        }

        // =====================================================================
        // LAYER 4: NETWORK & API INTERCEPTOR LAYER
        // =====================================================================
        function hookLaymaNetworkLayer() {
            const handleApiResponseText = (url, text) => {
                if (!text || redirected) return;

                // 1. Kiểm tra URL chuyển hướng thành công
                try {
                    const json = JSON.parse(text);
                    const destUrl = json.redirectUrl || json.RedirectUrl || json.url || (typeof json === 'string' && json.startsWith('http') ? json : null);
                    if (destUrl && (destUrl.startsWith('http') || destUrl.includes('/api/traffic/go/'))) {
                        console.log("[Duyzoz Layer 4] Bắt được link đích từ API response:", destUrl);
                        triggerSuccessRedirect(destUrl);
                        return;
                    }

                    // 2. Phát hiện lỗi chiến dịch hết hạn / link không tồn tại -> Đổi Nhiệm Vụ ngay
                    const rawText = text.toLowerCase();
                    if (rawText.includes('không có chiến dịch') || rawText.includes('link rút gọn không tồn tại') || rawText.includes('lỗi chiến dịch') || rawText.includes('hết hạn')) {
                        console.warn("[Duyzoz Layer 4] Phát hiện chiến dịch lỗi từ API, kích hoạt Đổi Nhiệm Vụ tự động...");
                        triggerChangeTaskNative("Chiến dịch hết hạn từ API");
                    }
                } catch (e) {}
            };

            // Intercept XMLHttpRequest
            const origOpen = pageWin.XMLHttpRequest.prototype.open;
            const origSend = pageWin.XMLHttpRequest.prototype.send;

            pageWin.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                this._reqUrl = url;
                return origOpen.apply(this, [method, url, ...rest]);
            };

            pageWin.XMLHttpRequest.prototype.send = function (...args) {
                this.addEventListener('load', function () {
                    if (this._reqUrl) {
                        handleApiResponseText(this._reqUrl, this.responseText);
                    }
                });
                return origSend.apply(this, args);
            };

            // Intercept fetch
            const origFetch = pageWin.fetch;
            if (origFetch) {
                pageWin.fetch = async function (...args) {
                    const response = await origFetch.apply(this, args);
                    try {
                        const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
                        const clone = response.clone();
                        clone.text().then(text => handleApiResponseText(url, text));
                    } catch (e) {}
                    return response;
                };
            }
        }

        // =====================================================================
        // LAYER 1: OBSERVER & AUTO-CLICK LAYER
        // =====================================================================
        const clickedElements = new WeakSet();

        function triggerClickSafe(el, reason) {
            if (!el || clickedElements.has(el)) return false;
            try {
                console.log(`[Duyzoz Layer 1] Auto-click (${reason}):`, el);
                clickedElements.add(el);
                el.focus();
                el.click();
                return true;
            } catch (e) {
                return false;
            }
        }

        function scanAndAutoClickButtons() {
            if (redirected) return;

            // 1. Tự động click nút Xác Nhận Đổi Nhiệm Vụ nếu Modal thông báo lỗi xuất hiện
            const confirmTaskBtn = document.querySelector('#btnXacNhanDoiNhiemVu, #modalNhiemVu button.btn-primary, .modal button.btn-warning, button[onclick*="doiNhiemVu"], button[onclick*="executeChangeMission"]');
            if (confirmTaskBtn && confirmTaskBtn.offsetParent !== null) {
                triggerClickSafe(confirmTaskBtn, "Xác nhận đổi nhiệm vụ");
                return;
            }

            // 2. Tự động click nút Lấy Mã / Xác Nhận khi mã hoặc captcha đã sẵn sàng
            const submitBtn = document.querySelector('#btn-xac-nhan, button[onclick*="submitCode"], button[onclick*="redeemCode"], .box-step-getCode button, .box-form-button button');
            if (submitBtn && submitBtn.offsetParent !== null && !submitBtn.disabled) {
                const codeInp = document.querySelector('#codeInput, input[name="code"]');
                const captchaSolved = pageWin.qCaptchaTokenValue || (pageWin.hcaptcha && pageWin.hcaptcha.getResponse && pageWin.hcaptcha.getResponse());
                if ((codeInp && codeInp.value && codeInp.value.trim().length >= 4) || captchaSolved) {
                    triggerClickSafe(submitBtn, "Nộp mã / Submit LayMa");
                }
            }

            // 3. Quét toàn bộ nút / thẻ a có chữ "Lấy mã", "Xác nhận", "Tiếp tục", "Nhận mã", "Hoàn thành"
            const candidates = document.querySelectorAll('button, a, div[role="button"], input[type="button"], input[type="submit"]');
            for (const el of candidates) {
                if (el.offsetParent === null || el.disabled) continue;
                const txt = (el.innerText || el.value || '').trim().toLowerCase();
                if (/^(lấy mã|xác nhận|nhận mã|tiếp tục|hoàn thành|gửi mã)$/i.test(txt)) {
                    const codeInp = document.querySelector('#codeInput, input[name="code"]');
                    const captchaSolved = pageWin.qCaptchaTokenValue || (pageWin.hcaptcha && pageWin.hcaptcha.getResponse && pageWin.hcaptcha.getResponse());
                    if ((codeInp && codeInp.value && codeInp.value.trim().length >= 4) || captchaSolved) {
                        triggerClickSafe(el, `Match Text (${txt})`);
                    }
                }
            }
        }

        function triggerChangeTaskNative(reason) {
            console.warn("[Duyzoz Engine] Đổi nhiệm vụ native vì:", reason);
            if (typeof pageWin.executeChangeMission === 'function') {
                try { pageWin.executeChangeMission(); } catch (e) {}
            }
            const btnBaoLoi = document.querySelector('#btn-baoloi, a#btn-baoloi, button.btn-danger, button[onclick*="baoloi"]');
            if (btnBaoLoi) {
                btnBaoLoi.click();
            }
            setTimeout(() => {
                const confirmBtn = document.querySelector('#btnXacNhanDoiNhiemVu, #modalNhiemVu button.btn-primary, .modal button.btn-warning, button[onclick*="doiNhiemVu"]');
                if (confirmBtn) confirmBtn.click();
            }, 150);
        }

        // =====================================================================
        // LAYER 2: TIMER HOOK LAYER
        // =====================================================================
        function speedupTimers() {
            try {
                if (typeof pageWin.trafficWaitSeconds !== 'undefined' && pageWin.trafficWaitSeconds > 2) {
                    pageWin.trafficWaitSeconds = 1;
                }
                if (typeof pageWin.countdownSeconds !== 'undefined' && pageWin.countdownSeconds > 2) {
                    pageWin.countdownSeconds = 1;
                }
            } catch (e) {}

            const timerEls = document.querySelectorAll('#countdown, #timer, .box-step-note span, #sec, #time');
            timerEls.forEach(el => {
                if (el && el.innerText && /\d+/.test(el.innerText)) {
                    const num = parseInt(el.innerText.match(/\d+/)[0]);
                    if (num > 3) {
                        el.innerText = el.innerText.replace(/\d+/, '1');
                    }
                }
            });
        }

        // =====================================================================
        // LAYER 3: CAPTCHA WATCHER LAYER
        // =====================================================================
        function watchCaptchaToken() {
            if (autoSubmitted || redirected) return;

            let token = pageWin.qCaptchaTokenValue || "";

            if (!token && pageWin.hcaptcha && typeof pageWin.hcaptcha.getResponse === 'function') {
                try { token = pageWin.hcaptcha.getResponse(); } catch (e) {}
            }
            if (!token && pageWin.qcaptcha && typeof pageWin.qcaptcha.getResponse === 'function') {
                try { token = pageWin.qcaptcha.getResponse(); } catch (e) {}
            }

            if (!token) {
                const tas = document.querySelectorAll('textarea[name*="response"], textarea[name*="captcha"], input[name*="captcha"]');
                for (const ta of tas) {
                    if (ta.value && ta.value.length > 20) {
                        token = ta.value;
                        break;
                    }
                }
            }

            if (token && token.length > 20) {
                console.log("[Duyzoz Layer 3] Bắt được token Captcha thành công!");
                pageWin.qCaptchaTokenValue = token;
                autoSubmitted = true;

                if (typeof pageWin.redeemCode === 'function') {
                    try { pageWin.redeemCode(null, token); } catch(e) {}
                } else if (typeof pageWin.submitCode === 'function') {
                    try { pageWin.submitCode(); } catch(e) {}
                }

                scanAndAutoClickButtons();
            }
        }

        // =====================================================================
        // HOÀN TẤT & CHUYỂN HƯỚNG
        // =====================================================================
        function triggerSuccessRedirect(url) {
            if (redirected || !url) return;
            redirected = true;

            try { GM_setClipboard(url); } catch (e) {}

            const banner = document.createElement('div');
            banner.style.cssText = `
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: #ffffff; padding: 18px 32px; border-radius: 16px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 14px; font-weight: bold;
                box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.3);
                z-index: 2147483647; text-align: center; line-height: 1.6;
            `;
            banner.innerHTML = `
                <div style="font-size: 18px; margin-bottom: 4px;">🎉 MADE BY DUYZOZ: BYPASS LAYMA THÀNH CÔNG!</div>
                <div style="font-size: 12px; color: #dbeafe; font-weight: normal; margin-bottom: 12px;">
                    Link đích: <span style="font-family:monospace;">${url.substring(0, 60)}...</span> (Đã copy)
                </div>
                <a href="${url}" style="background: white; color: #1d4ed8; padding: 8px 20px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 800; display: inline-block;">CHUYỂN ĐẾN LINK ĐÍCH ➜</a>
            `;
            (document.body || document.documentElement).appendChild(banner);

            setTimeout(() => { window.location.href = url; }, 1200);
        }

        // =====================================================================
        // KÍCH HOẠT ĐỒNG THỜI TOÀN BỘ 4 LỚP ENGINE
        // =====================================================================
        hookLaymaNetworkLayer();

        const observer = new MutationObserver(() => {
            scanAndAutoClickButtons();
            speedupTimers();
            watchCaptchaToken();
        });

        const initEngine = () => {
            injectDuyzozHUDHeader();
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
            }
            setInterval(() => {
                scanAndAutoClickButtons();
                speedupTimers();
                watchCaptchaToken();
            }, 250);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initEngine);
        } else {
            initEngine();
        }
    }
})();
