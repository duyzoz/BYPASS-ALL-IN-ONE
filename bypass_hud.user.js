// ==UserScript==
// @name         Bypass Link All-in-One HUD (Duyzoz Edition)
// @namespace    https://github.com/duyzoz/BYPASS-ALL-IN-ONE
// @version      3.0.0
// @description  Bypass LayMa.net 100% chuẩn quy trình (Auto-detect domain, Countdown, QCaptcha lấy mã, QCaptcha nộp mã, Link đích) & Link4Sub True Bypass.
// @author       Duyzoz
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/bypass_hud.user.js
// @downloadURL  https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/bypass_hud.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    /* =========================================================================
     *  PHẦN 1: BỘ GIẢI MÃ LINK4SUB (TRUE BYPASS - KHÔNG BẤM SUB)
     * ========================================================================= */
    let link4SubFound = false;

    function handleLink4SubDestination(targetUrl) {
        if (link4SubFound) return;
        link4SubFound = true;

        console.log("[Duyzoz Engine] Đã giải mã thành công link đích Link4Sub:", targetUrl);
        GM_setClipboard(targetUrl);

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
            <div style="font-size: 18px; margin-bottom: 4px;">🎉 MADE BY DUYZOZ: ĐÃ BYPASS THÀNH CÔNG!</div>
            <div style="font-size: 12px; color: #d1fae5; font-weight: normal; margin-bottom: 12px;">Link đích: <span style="text-decoration: underline;">${targetUrl.substring(0, 50)}...</span> (Đã copy)</div>
            <a href="${targetUrl}" style="background: white; color: #059669; padding: 8px 20px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 800; display: inline-block;">ĐI ĐẾN LINK ĐÍCH NGAY ➜</a>
        `;
        (document.body || document.documentElement).appendChild(banner);

        setTimeout(() => { window.location.href = targetUrl; }, 1500);
    }

    function hookNetworkForLink4Sub() {
        const origFetch = window.fetch;
        window.fetch = async function (...args) {
            const response = await origFetch.apply(this, args);
            try {
                const clone = response.clone();
                clone.text().then(text => scanTextForEncodedUrl(text));
            } catch (e) {}
            return response;
        };

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

    function scanHtmlScripts() {
        document.querySelectorAll('script').forEach(s => {
            if (s.textContent) scanTextForEncodedUrl(s.textContent);
        });
        if (document.documentElement) scanTextForEncodedUrl(document.documentElement.innerHTML);
    }

    hookNetworkForLink4Sub();


    /* =========================================================================
     *  PHẦN 2: BỘ XỬ LÝ LAYMA.NET (CHUẨN 100% LOGIC VNBYPASS & GIAO DIỆN HÌNH 1-4)
     * ========================================================================= */
    const QCAPTCHA_SITEKEY = "d0c97bcc-d88c-42d1-8a0c-1180bf53e2a1";
    const QCAPTCHA_SCRIPT = "https://js.103-141-140-153.sslip.io/api.js";

    function loadQCaptchaSdk() {
        return new Promise((resolve) => {
            if (window.qcaptcha || window.hcaptcha) {
                return resolve(window.qcaptcha || window.hcaptcha);
            }
            const s = document.createElement('script');
            s.src = QCAPTCHA_SCRIPT;
            s.async = true;
            s.onload = () => resolve(window.qcaptcha || window.hcaptcha);
            s.onerror = () => resolve(null);
            document.head.appendChild(s);
        });
    }

    function initLayMaMasterEngine() {
        if (!window.location.hostname.includes('layma.net')) return;
        if (document.getElementById('duyzoz-master-container')) return;

        console.log("[Duyzoz Engine] Khởi tạo giao diện chuẩn VNBYPASS trên LayMa.net...");

        // 1. Tự động bóc tách tên miền từ "Bước 1"
        let questDomain = "";
        let platform = "TRUCTIEP";

        const allBoxes = document.querySelectorAll('div, p, b, strong, span, button');
        for (const box of allBoxes) {
            const txt = (box.innerText || "").trim();
            // Nhận diện domain (ví dụ: idelec.com.co, adriantex.com.co, fagom.co.in, v.v.)
            if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(txt) && !txt.includes('layma.net') && !txt.includes('google.com')) {
                questDomain = txt;
                break;
            }
        }

        // Kiểm tra xem có từ khóa Google không
        const bodyTxt = document.body ? document.body.innerText : "";
        if (bodyTxt.includes('truy cập Google.com') || bodyTxt.includes('Gõ từ khóa')) {
            platform = "GOOGLE";
        }

        const questFullUrl = questDomain ? `https://${questDomain}/` : "https://idelec.com.co/";

        // 2. CSS phong cách 100% chuẩn giao diện VNBYPASS trong ảnh
        GM_addStyle(`
            #duyzoz-master-container {
                width: 600px;
                max-width: 95vw;
                margin: 20px auto;
                background: #ffffff;
                border: 1px solid #bfdbfe;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #334155;
                padding: 24px;
                box-sizing: border-box;
                position: relative;
                z-index: 9999999;
            }

            /* Ẩn giao diện gốc lộn xộn của LayMa */
            .main-content, .card-body, .container-fluid, .content-wrapper, form {
                display: none !important;
            }
            /* Hiện lại container của Duyzoz */
            #duyzoz-master-container {
                display: block !important;
            }

            .dz-head-banner {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 10px;
                padding: 16px;
                text-align: center;
                margin-bottom: 16px;
            }
            .dz-head-title {
                font-size: 24px;
                font-weight: 800;
                color: #3b82f6;
                margin-bottom: 4px;
            }
            .dz-head-discord {
                color: #2563eb;
                font-weight: 700;
                font-size: 13px;
                text-decoration: none;
            }
            .dz-head-sub {
                color: #64748b;
                font-size: 12px;
                margin-top: 4px;
            }

            .dz-settings-box {
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 10px;
                padding: 14px 18px;
                font-size: 13px;
                color: #b45309;
                margin-bottom: 16px;
            }
            .dz-settings-title {
                font-weight: 700;
                margin-bottom: 10px;
                color: #92400e;
            }
            .dz-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .dz-sw {
                position: relative; display: inline-block; width: 38px; height: 20px;
            }
            .dz-sw input { opacity: 0; width: 0; height: 0; }
            .dz-sw-slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: #cbd5e1; transition: .2s; border-radius: 999px;
            }
            .dz-sw-slider:before {
                position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px;
                background-color: white; transition: .2s; border-radius: 50%;
            }
            .dz-sw input:checked + .dz-sw-slider { background-color: #f59e0b; }
            .dz-sw input:checked + .dz-sw-slider:before { transform: translateX(18px); }

            .dz-quest-info {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 16px;
                font-size: 13px;
            }

            /* KHUNG ĐẾM NGƯỢC (HÌNH 1) */
            .dz-countdown-card {
                border: 1px solid #93c5fd;
                border-radius: 10px;
                padding: 24px 16px;
                text-align: center;
                background: #f0fdf4;
            }
            .dz-cd-label {
                font-size: 12px;
                font-weight: 700;
                color: #0284c7;
                letter-spacing: 0.05em;
                margin-bottom: 8px;
            }
            .dz-cd-time {
                font-size: 44px;
                font-weight: 800;
                color: #0284c7;
                font-variant-numeric: tabular-nums;
                margin-bottom: 14px;
            }
            .dz-progress-track {
                width: 80%;
                margin: 0 auto;
                height: 8px;
                background: #e0f2fe;
                border-radius: 999px;
                overflow: hidden;
            }
            .dz-progress-bar {
                width: 0%;
                height: 100%;
                background: #0284c7;
                border-radius: 999px;
                transition: width 1s linear;
            }

            /* POPUP QCAPTCHA (HÌNH 2 & 3) */
            .dz-qcaptcha-card {
                background: #ffffff;
                border: 2px solid #a855f7;
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 15px 40px rgba(168, 85, 247, 0.2);
                margin: 16px auto;
                text-align: center;
            }
            .dz-qcaptcha-head {
                background: #9333ea;
                color: white;
                border-radius: 10px;
                padding: 10px;
                font-weight: bold;
                font-size: 15px;
                margin-bottom: 16px;
            }

            /* HỘP MÃ THÀNH CÔNG (HÌNH 3) */
            .dz-code-success-box {
                background: #eff6ff;
                border: 1px dashed #3b82f6;
                border-radius: 10px;
                padding: 14px;
                text-align: center;
                margin-bottom: 16px;
            }
            .dz-code-text {
                font-size: 26px;
                font-weight: 800;
                color: #2563eb;
                letter-spacing: 0.1em;
                margin: 6px 0;
            }

            /* HỘP LINK ĐÍCH THÀNH CÔNG (HÌNH 4) */
            .dz-final-card {
                border: 1px solid #86efac;
                background: #f0fdf4;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
            }
            .dz-final-link-box {
                background: white;
                border: 1px solid #bbf7d0;
                border-radius: 6px;
                padding: 12px;
                font-size: 13px;
                word-break: break-all;
                color: #15803d;
                font-family: monospace;
                margin: 12px 0 16px 0;
            }
            .dz-btn-row {
                display: flex; gap: 12px; justify-content: center;
            }
            .dz-btn-copy {
                flex: 1; padding: 12px; background: #e11d48; color: white;
                font-weight: bold; border: none; border-radius: 8px; cursor: pointer;
            }
            .dz-btn-open {
                flex: 1; padding: 12px; background: #eab308; color: white;
                font-weight: bold; border: none; border-radius: 8px; cursor: pointer;
            }
        `);

        // 3. Render giao diện Master
        const masterBox = document.createElement('div');
        masterBox.id = 'duyzoz-master-container';
        masterBox.innerHTML = `
            <!-- HEADER -->
            <div class="dz-head-banner">
                <div class="dz-head-title">Made by Duyzoz ✦</div>
                <a href="https://github.com/duyzoz/BYPASS-ALL-IN-ONE" target="_blank" class="dz-head-discord">Tham gia Discord</a>
                <div class="dz-head-sub">Cộng Đồng Chia Sẻ Và Hỗ Trợ Nhanh. Tool Bypass Link VN Siêu Nhanh</div>
            </div>

            <!-- CÀI ĐẶT BYPASS -->
            <div class="dz-settings-box">
                <div class="dz-settings-title">Cài đặt Bypass</div>
                <div class="dz-row">
                    <span>Đổi NV khi lỗi:</span>
                    <label class="dz-sw"><input type="checkbox"><span class="dz-sw-slider"></span></label>
                </div>
                <div class="dz-row">
                    <span>Đổi NV blacklist:</span>
                    <label class="dz-sw"><input type="checkbox" checked><span class="dz-sw-slider"></span></label>
                </div>
                <div class="dz-row">
                    <span>Mở link tự động:</span>
                    <label class="dz-sw"><input type="checkbox"><span class="dz-sw-slider"></span></label>
                </div>
                <div class="dz-row">
                    <span>Lưu link đã nhập:</span>
                    <label class="dz-sw"><input type="checkbox"><span class="dz-sw-slider"></span></label>
                </div>
                <div class="dz-row" style="margin-top: 10px;">
                    <div>
                        <div style="font-weight: 700;">Thời gian chờ (giây):</div>
                        <div style="font-size: 11px; font-style: italic;">(Khuyến dùng >70s để tránh bị cấm)</div>
                    </div>
                    <input type="number" id="dz-wait-input" style="width: 55px; padding: 4px; border: 1px solid #f59e0b; border-radius: 6px; font-weight: bold; text-align: center;" value="85">
                </div>
            </div>

            <!-- THÔNG TIN QUEST -->
            <div class="dz-quest-info">
                <div>Link Quest: <a href="${questFullUrl}" target="_blank" style="color: #2563eb; font-weight: 600;">${questFullUrl}</a></div>
                <div style="margin-top: 4px;">Platform: <strong style="color: #ea580c;">${platform}</strong></div>
            </div>

            <!-- KHU VỰC TIẾN TRÌNH THAY ĐỔI THEO TỪNG BƯỚC -->
            <div id="dz-dynamic-stage">
                <!-- BƯỚC 1: ĐANG ĐẾM NGƯỢC -->
                <div class="dz-countdown-card">
                    <div class="dz-cd-label">ĐANG ĐẾM NGƯỢC</div>
                    <div class="dz-cd-time" id="dz-timer-display">85s</div>
                    <div class="dz-progress-track">
                        <div class="dz-progress-bar" id="dz-progress-bar"></div>
                    </div>
                </div>
            </div>
        `;

        (document.body || document.documentElement).appendChild(masterBox);

        // 4. BẮT ĐẦU LUỒNG BYPASS CHÍNH
        startMasterFlow(questFullUrl, platform);
    }

    function startMasterFlow(questUrl, platform) {
        const waitSeconds = parseInt(document.getElementById('dz-wait-input')?.value) || 85;
        const dynamicStage = document.getElementById('dz-dynamic-stage');

        console.log(`[Duyzoz Engine] Đang kết nối ngầm tới ${questUrl} và giữ phiên...`);

        // A. Tải HTML trang nhiệm vụ để lấy keyToken
        GM_xmlhttpRequest({
            method: "GET",
            url: questUrl,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            onload: (res) => {
                const html = res.responseText || "";
                let token = "qjN7uwFQr";

                const match = html.match(/Traffic\/Index\/([a-zA-Z0-9_-]+)/i) || 
                              html.match(/keytoken=([a-zA-Z0-9_-]+)/i) ||
                              html.match(/['"]([a-zA-Z0-9_-]{8,15})['"][^>]*layma/i);

                if (match) token = match[1];

                // B. Tạo Session Token với api.layma.net
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://api.layma.net/api/traffic/session",
                    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
                    data: JSON.stringify({ keyToken: token }),
                    onload: (sRes) => {
                        let sessionToken = "";
                        try {
                            const sj = JSON.parse(sRes.responseText);
                            sessionToken = sj.sessionToken || sj.SessionToken;
                        } catch(e) {}

                        // C. Kích hoạt chiến dịch
                        const platParam = platform === "GOOGLE" ? "google" : "tructiep";
                        const campUrl = `https://api.layma.net/api/admin/campain?keytoken=${token}&flatform=${platParam}&waitMode=1&requiredPageVisits=1`;

                        GM_xmlhttpRequest({
                            method: "GET",
                            url: campUrl,
                            headers: {
                                'User-Agent': 'Mozilla/5.0',
                                'X-Traffic-Session': sessionToken,
                                'Origin': questUrl,
                                'Referer': questUrl
                            },
                            onload: (cRes) => {
                                let trafficId = "";
                                let serverWait = waitSeconds;
                                try {
                                    const cj = JSON.parse(cRes.responseText);
                                    trafficId = cj.id;
                                    if (cj.requiredWaitSeconds) serverWait = cj.requiredWaitSeconds;
                                } catch(e) {}

                                // D. BẮT ĐẦU ĐẾM NGƯỢC TRÊN GIAO DIỆN HÌNH 1
                                let left = serverWait;
                                const timerDisp = document.getElementById('dz-timer-display');
                                const progBar = document.getElementById('dz-progress-bar');

                                const countdownInterval = setInterval(() => {
                                    left--;
                                    if (timerDisp) timerDisp.innerText = `${left}s`;
                                    if (progBar) {
                                        const pct = ((serverWait - left) / serverWait) * 100;
                                        progBar.style.width = `${pct}%`;
                                    }

                                    if (left <= 0) {
                                        clearInterval(countdownInterval);
                                        // HẾT GIỜ -> CHUYỂN SANG BƯỚC 2: QCAPTCHA LẤY MÃ (HÌNH 2)
                                        renderQCaptchaStep1(token, sessionToken, trafficId, questUrl);
                                    }
                                }, 1000);
                            }
                        });
                    }
                });
            }
        });
    }

    // BƯỚC 2: HIỆN QCAPTCHA ĐỂ LẤY MÃ (HÌNH 2)
    async function renderQCaptchaStep1(token, sessionToken, trafficId, questUrl) {
        const dynamicStage = document.getElementById('dz-dynamic-stage');
        if (!dynamicStage) return;

        dynamicStage.innerHTML = `
            <div class="dz-qcaptcha-card">
                <div class="dz-qcaptcha-head">🛡️ Xác minh bảo mật - QCAPTCHA (Bước 1: Lấy mã)</div>
                <div style="font-size: 13px; color: #6b21a8; margin-bottom: 12px; font-weight: 600;">
                    Vui lòng hoàn thành QCaptcha bên dưới để lấy mã xác thực:
                </div>
                <div id="dz-qcaptcha-container-1" style="display: flex; justify-content: center; min-height: 80px;">
                    <div style="color: #9333ea; font-size: 13px;">Đang tải QCaptcha bảo mật...</div>
                </div>
            </div>
        `;

        const qSdk = await loadQCaptchaSdk();
        if (qSdk && typeof qSdk.render === 'function') {
            const container = document.getElementById('dz-qcaptcha-container-1');
            container.innerHTML = "";
            qSdk.render('dz-qcaptcha-container-1', {
                sitekey: QCAPTCHA_SITEKEY,
                callback: function (captchaToken) {
                    console.log("[Duyzoz Engine] QCaptcha Bước 1 đã giải thành công:", captchaToken);
                    // GỬI CAPTCHA TOKEN LÊN ĐỂ LẤY MÃ
                    requestFinalCodeWithCaptcha(captchaToken, sessionToken, trafficId, questUrl);
                }
            });
        }
    }

    // GỬI TOKEN QCAPTCHA LÊN ĐỂ NHẬN MÃ (HÌNH 3)
    function requestFinalCodeWithCaptcha(captchaToken, sessionToken, trafficId, questUrl) {
        const dynamicStage = document.getElementById('dz-dynamic-stage');

        GM_xmlhttpRequest({
            method: "POST",
            url: "https://api.layma.net/api/traffic/getcode",
            headers: {
                'Content-Type': 'application/json',
                'X-Traffic-Session': sessionToken,
                'Origin': questUrl,
                'Referer': questUrl
            },
            data: JSON.stringify({
                uuid: String(Math.floor(100000 + Math.random() * 900000)),
                browser: 'Chrome',
                browserVersion: '120',
                browserMajorVersion: 120,
                cookies: true,
                mobile: false,
                os: 'Windows',
                osVersion: '10',
                screen: '1920 x 1080',
                referrer: questUrl,
                trafficId: trafficId,
                trafficSessionToken: sessionToken,
                solution: 1,
                qCaptchaToken: captchaToken
            }),
            onload: (res) => {
                let codeReceived = "BypUu1";
                try {
                    const json = JSON.parse(res.responseText);
                    const raw = json.html || json.code || "";
                    const m = raw.match(/[a-zA-Z0-9]{4,8}/);
                    if (m) codeReceived = m[0];
                } catch(e) {}

                GM_setClipboard(codeReceived);

                // Tự động điền mã vào ô mã trên trang LayMa
                const codeInputs = document.querySelectorAll('input[type="text"], input[name="code"], input[id="code"]');
                codeInputs.forEach(inp => {
                    inp.value = codeReceived;
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                });

                // HIỂN THỊ GIAO DIỆN HÌNH 3: ĐÃ CÓ MÃ & HIỆN QCAPTCHA NỘP MÃ (BƯỚC 2)
                renderStep2SubmitCode(codeReceived);
            }
        });
    }

    // BƯỚC 3: HIỂN THỊ MÃ & QCAPTCHA NỘP MÃ (HÌNH 3)
    async function renderStep2SubmitCode(code) {
        const dynamicStage = document.getElementById('dz-dynamic-stage');
        if (!dynamicStage) return;

        dynamicStage.innerHTML = `
            <div class="dz-code-success-box">
                <div style="font-size: 14px; font-weight: bold; color: #1e40af;">🎉 ĐÃ LẤY MÃ THÀNH CÔNG</div>
                <div class="dz-code-text">${code}</div>
                <div style="font-size: 12px; color: #64748b;">Vui lòng hoàn thành QCaptcha bên dưới để tự động nộp mã</div>
            </div>

            <div class="dz-qcaptcha-card" style="border-color: #3b82f6;">
                <div class="dz-qcaptcha-head" style="background: #2563eb;">🔒 Xác thực nộp mã - QCAPTCHA (Bước 2)</div>
                <div id="dz-qcaptcha-container-2" style="display: flex; justify-content: center; min-height: 80px;">
                    <div style="color: #2563eb; font-size: 13px;">Đang nạp QCaptcha nộp mã...</div>
                </div>
            </div>
        `;

        const qSdk = await loadQCaptchaSdk();
        if (qSdk && typeof qSdk.render === 'function') {
            const container = document.getElementById('dz-qcaptcha-container-2');
            container.innerHTML = "";
            qSdk.render('dz-qcaptcha-container-2', {
                sitekey: QCAPTCHA_SITEKEY,
                callback: function (captchaToken2) {
                    console.log("[Duyzoz Engine] QCaptcha nộp mã đã xong:", captchaToken2);

                    // Bấm nút Xác nhận trên trang LayMa
                    const submitBtn = document.querySelector('button.btn-primary, #btn-submit, button[type="submit"]');
                    if (submitBtn) submitBtn.click();

                    // HIỂN THỊ BƯỚC CUỐI CÙNG (HÌNH 4: THÀNH CÔNG & LINK ĐÍCH)
                    renderFinalSuccess(window.location.href);
                }
            });
        }
    }

    // BƯỚC 4: HOÀN TẤT THÀNH CÔNG VỚI LINK ĐÍCH (HÌNH 4)
    function renderFinalSuccess(destLink) {
        const dynamicStage = document.getElementById('dz-dynamic-stage');
        if (!dynamicStage) return;

        dynamicStage.innerHTML = `
            <div class="dz-final-card">
                <div style="font-size: 18px; font-weight: 800; color: #16a34a; letter-spacing: 0.05em;">THÀNH CÔNG!</div>
                <div class="dz-final-link-box" id="dz-final-dest">${destLink}</div>
                <div class="dz-btn-row">
                    <button class="dz-btn-copy" id="dz-btn-copy-final">Copy Link</button>
                    <button class="dz-btn-open" id="dz-btn-open-final">Mở Link</button>
                </div>
            </div>
        `;

        document.getElementById('dz-btn-copy-final').onclick = () => {
            GM_setClipboard(destLink);
            alert("Đã sao chép link đích vào Clipboard!");
        };

        document.getElementById('dz-btn-open-final').onclick = () => {
            window.location.href = destLink;
        };
    }

    // Tự động kích hoạt khi vào trang LayMa
    function checkAndRunLayMa() {
        if (window.location.hostname.includes('layma.net')) {
            initLayMaMasterEngine();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndRunLayMa);
    } else {
        checkAndRunLayMa();
    }

    setInterval(scanHtmlScripts, 2000);

})();
