// ==UserScript==
// @name         Bypass Link All-in-One HUD (Duyzoz Edition)
// @namespace    https://github.com/duyzoz/BYPASS-ALL-IN-ONE
// @version      2.3.0
// @description  Tự động vượt link Link4Sub (Trích xuất link gốc 100%), LayMa.net (Giao diện chuẩn Hình 3 đè giữa màn hình, tự tìm link nhiệm vụ, tự đổi NV khi lỗi, giải mã API chuẩn).
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
     *  PHẦN 1: BỘ GIẢI MÃ VÀ BẮT LINK ĐÍCH LINK4SUB (TRUE BYPASS - KHÔNG BẤM SUB)
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

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 1500);
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
                try {
                    scanTextForEncodedUrl(this.responseText);
                } catch (e) {}
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
     *  PHẦN 2: BỘ XỬ LÝ LAYMA.NET (CHUẨN 100% GIAO DIỆN HÌNH 3 - ĐÈ CHÍNH GIỮA)
     * ========================================================================= */
    function initLayMaPanel() {
        if (!window.location.hostname.includes('layma.net')) return;
        if (document.getElementById('duyzoz-layma-panel')) return;

        console.log("[Duyzoz Engine] Đang dựng giao diện LayMa.net đè giữa màn hình...");

        // 1. Tự động bóc tách thông tin từ trang LayMa
        let guideImgUrl = "";
        let searchKeyword = "Không có từ khóa";
        let autoDetectedQuestUrl = "";

        // Tìm ảnh hướng dẫn
        const imgs = document.querySelectorAll('img');
        for (const img of imgs) {
            if (img.src && (img.src.includes('layma.net/media') || img.src.includes('posts') || img.src.includes('images'))) {
                guideImgUrl = img.src;
                break;
            }
        }

        // Tự động tìm tên miền nhiệm vụ trong "Bước 1"
        const fullText = document.body ? document.body.innerText : "";
        
        // Tìm ô hiển thị domain ở Bước 1
        const allBoxes = document.querySelectorAll('div, p, b, strong, span, button');
        for (const box of allBoxes) {
            const txt = (box.innerText || "").trim();
            // Match dạng domain (ví dụ: idelec.com.co, fagom.co.in, v.v.)
            if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/.test(txt) && !txt.includes('layma.net') && !txt.includes('google.com')) {
                autoDetectedQuestUrl = "https://" + txt + "/";
                break;
            }
        }

        // Tìm từ khóa nếu là nhiệm vụ Google
        for (const el of allBoxes) {
            const txt = (el.innerText || "").trim();
            if (txt.includes('sunwin') || txt.includes('88bet') || txt.includes('w88') || txt.includes('bk8')) {
                if (txt.split(/\s+/).length <= 3) {
                    searchKeyword = txt;
                    break;
                }
            }
        }

        // 2. CSS Giao diện chuẩn xác theo Hình 3 (Đè chính giữa màn hình)
        GM_addStyle(`
            #duyzoz-backdrop {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(15, 23, 42, 0.7);
                backdrop-filter: blur(8px);
                z-index: 2147483646;
                display: flex; align-items: center; justify-content: center;
            }

            #duyzoz-layma-panel {
                position: relative;
                width: 500px;
                max-width: 95vw;
                max-height: 94vh;
                overflow-y: auto;
                background: #ffffff;
                border: 2px solid #fde68a;
                border-radius: 18px;
                box-shadow: 0 25px 60px rgba(0,0,0,0.35);
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #334155;
                padding: 16px;
                box-sizing: border-box;
                animation: panelPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes panelPop {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }

            /* CARD 1: HEADER */
            .dz-header-card {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 12px;
                padding: 14px;
                text-align: center;
                margin-bottom: 12px;
                position: relative;
            }
            .dz-brand-title {
                font-size: 24px;
                font-weight: 800;
                color: #d946ef;
                letter-spacing: -0.01em;
                margin-bottom: 2px;
            }
            .dz-brand-link {
                color: #3b82f6;
                font-size: 13px;
                font-weight: 700;
                text-decoration: none;
            }
            .dz-brand-link:hover { text-decoration: underline; }
            .dz-brand-sub {
                color: #64748b;
                font-size: 12px;
                margin-top: 4px;
            }

            /* CARD 2: CÀI ĐẶT BYPASS */
            .dz-settings-card {
                background: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 12px;
                padding: 14px 16px;
                font-size: 13px;
                color: #b45309;
                margin-bottom: 12px;
            }
            .dz-settings-title {
                font-weight: 700;
                margin-bottom: 10px;
                color: #92400e;
                font-size: 14px;
            }
            .dz-setting-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .dz-toggle {
                position: relative;
                display: inline-block;
                width: 40px;
                height: 22px;
            }
            .dz-toggle input { opacity: 0; width: 0; height: 0; }
            .dz-slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: #cbd5e1; transition: .2s; border-radius: 999px;
            }
            .dz-slider:before {
                position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px;
                background-color: white; transition: .2s; border-radius: 50%;
            }
            .dz-toggle input:checked + .dz-slider { background-color: #f59e0b; }
            .dz-toggle input:checked + .dz-slider:before { transform: translateX(18px); }

            .dz-link-helper {
                font-size: 12px;
                color: #b45309;
                text-decoration: underline;
                display: block;
                margin-top: 4px;
                cursor: pointer;
            }
            .dz-timer-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 10px;
            }
            .dz-time-input {
                width: 60px;
                padding: 4px 8px;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                text-align: center;
                font-weight: 700;
                background: white;
                color: #92400e;
            }

            /* CARD 3: NHIỆM VỤ */
            .dz-quest-card {
                background: #ffffff;
                border: 1px solid #fed7aa;
                border-radius: 12px;
                padding: 14px;
            }
            .dz-alert-box {
                background: #fff7ed;
                border: 1px solid #fed7aa;
                border-radius: 8px;
                padding: 10px 12px;
                margin-bottom: 12px;
                font-size: 12px;
                color: #ea580c;
                line-height: 1.5;
            }
            .dz-field-label {
                font-size: 12px;
                font-weight: 600;
                color: #475569;
                margin-bottom: 4px;
                display: block;
            }
            .dz-field-input {
                width: 100%;
                box-sizing: border-box;
                padding: 8px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 13px;
                color: #334155;
                background: #f8fafc;
                margin-bottom: 10px;
            }
            .dz-field-input:focus {
                outline: none;
                border-color: #f59e0b;
                background: white;
            }
            .dz-img-box {
                width: 100%;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                margin-bottom: 10px;
                max-height: 130px;
                object-fit: contain;
                background: #f8fafc;
                display: block;
            }

            .dz-btn-continue {
                width: 100%;
                padding: 12px;
                background: #eab308;
                color: white;
                font-weight: 800;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                transition: background .2s;
                margin-bottom: 8px;
            }
            .dz-btn-continue:hover { background: #ca8a04; }
            .dz-btn-change {
                width: 100%;
                padding: 10px;
                background: #e11d48;
                color: white;
                font-weight: 700;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                cursor: pointer;
                transition: background .2s;
            }
            .dz-btn-change:hover { background: #be123c; }

            .dz-close-btn {
                position: absolute;
                top: 10px;
                right: 14px;
                background: transparent;
                border: none;
                font-size: 18px;
                color: #94a3b8;
                cursor: pointer;
            }
        `);

        // 3. Render HTML - Bọc trong Backdrop chính giữa màn hình
        const backdrop = document.createElement('div');
        backdrop.id = 'duyzoz-backdrop';

        const panel = document.createElement('div');
        panel.id = 'duyzoz-layma-panel';
        panel.innerHTML = `
            <!-- HEADER -->
            <div class="dz-header-card">
                <button class="dz-close-btn" id="dz-close-btn">✕</button>
                <div class="dz-brand-title">Made by Duyzoz ✦</div>
                <a href="https://github.com/duyzoz/BYPASS-ALL-IN-ONE" target="_blank" class="dz-brand-link">Tham gia Discord</a>
                <div class="dz-brand-sub">Cộng Đồng Chia Sẻ Và Hỗ Trợ Nhanh. Tool Bypass Link VN Siêu Nhanh</div>
            </div>

            <!-- CÀI ĐẶT BYPASS -->
            <div class="dz-settings-card">
                <div class="dz-settings-title">Cài đặt Bypass</div>
                <div class="dz-setting-row">
                    <span>Đổi NV khi lỗi:</span>
                    <label class="dz-toggle"><input type="checkbox" id="dz-opt-auto-change-err" checked><span class="dz-slider"></span></label>
                </div>
                <div class="dz-setting-row">
                    <span>Đổi NV blacklist:</span>
                    <label class="dz-toggle"><input type="checkbox" checked><span class="dz-slider"></span></label>
                </div>
                <div class="dz-setting-row">
                    <span>Mở link tự động:</span>
                    <label class="dz-toggle"><input type="checkbox" checked><span class="dz-slider"></span></label>
                </div>
                <div class="dz-setting-row">
                    <span>Lưu link đã nhập:</span>
                    <label class="dz-toggle"><input type="checkbox"><span class="dz-slider"></span></label>
                </div>
                <span class="dz-link-helper">Xem link nhiệm vụ đã lưu</span>
                <span class="dz-link-helper">Xem nhiệm vụ bị blacklist tại đây</span>

                <div class="dz-timer-row">
                    <div>
                        <div style="font-weight: 700;">Thời gian chờ (giây):</div>
                        <div style="font-size: 11px; font-style: italic;">(Khuyến dùng >70s để tránh bị cấm)</div>
                    </div>
                    <input type="number" id="dz-wait-seconds" class="dz-time-input" value="65">
                </div>
            </div>

            <!-- NHIỆM VỤ -->
            <div class="dz-quest-card">
                <div class="dz-alert-box" id="dz-status-alert">
                    ${autoDetectedQuestUrl 
                        ? `<strong>✅ ĐÃ TỰ ĐỘNG TÌM THẤY LINK QUEST!</strong><br>Đang chuẩn bị kết nối ngầm...` 
                        : `<strong>Không lấy được link Quest tự động!</strong><br>Bạn có thể nhập thông tin nhiệm vụ thủ công để tiếp tục.`}
                </div>

                <label class="dz-field-label">Link ảnh hướng dẫn</label>
                <input type="text" class="dz-field-input" id="dz-guide-img-input" value="${guideImgUrl}" readonly>

                ${guideImgUrl ? `<img src="${guideImgUrl}" class="dz-img-box" alt="Ảnh hướng dẫn">` : ''}

                <label class="dz-field-label">Từ khóa</label>
                <input type="text" class="dz-field-input" id="dz-keyword-input" value="${searchKeyword}" readonly>

                <label class="dz-field-label">Link Quest thủ công</label>
                <input type="text" class="dz-field-input" id="dz-manual-url" value="${autoDetectedQuestUrl}" placeholder="https://..." style="border: 2px solid #f59e0b;">

                <button class="dz-btn-continue" id="dz-btn-submit-quest">Tiếp tục với link này</button>
                <button class="dz-btn-change" id="dz-btn-reload-quest">Đổi nhiệm vụ</button>
            </div>
        `;

        backdrop.appendChild(panel);
        (document.body || document.documentElement).appendChild(backdrop);

        document.getElementById('dz-close-btn').onclick = () => backdrop.remove();

        // NÚT ĐỔI NHIỆM VỤ THẬT (Kích hoạt nút Đổi nhiệm vụ của chính web LayMa)
        function triggerNativeChangeTask() {
            const nativeChangeBtns = document.querySelectorAll('button, a, input[type="button"]');
            for (const btn of nativeChangeBtns) {
                if ((btn.innerText || btn.value || "").includes('Đổi nhiệm vụ') && !btn.id.includes('dz-')) {
                    console.log("[Duyzoz Engine] Đang bấm nút Đổi nhiệm vụ gốc của web...");
                    btn.click();
                    return true;
                }
            }
            window.location.reload();
            return false;
        }

        document.getElementById('dz-btn-reload-quest').onclick = triggerNativeChangeTask;

        // XỬ LÝ QUY TRÌNH BYPASS HOÀN CHỈNH
        const submitBtn = document.getElementById('dz-btn-submit-quest');
        const manualInput = document.getElementById('dz-manual-url');
        const alertBox = document.getElementById('dz-status-alert');

        function startBypassProcess() {
            const questUrl = manualInput.value.trim();
            if (!questUrl.startsWith('http')) {
                alert("Vui lòng nhập đường link đầy đủ bắt đầu bằng https://");
                manualInput.focus();
                return;
            }

            const waitTime = parseInt(document.getElementById('dz-wait-seconds').value) || 65;
            submitBtn.disabled = true;
            alertBox.innerHTML = `<strong>⚡ Đang kết nối ngầm tới:</strong> ${questUrl}<br>Đang tải HTML để bóc tách token chiến dịch...`;

            // BƯỚC 1: Tải HTML của trang nhiệm vụ để bóc tách keytoken
            GM_xmlhttpRequest({
                method: "GET",
                url: questUrl,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                onload: (res) => {
                    const html = res.responseText || "";
                    let token = null;

                    // Bóc tách token từ layma script
                    const match = html.match(/Traffic\/Index\/([a-zA-Z0-9_-]+)/i) || 
                                  html.match(/keytoken=([a-zA-Z0-9_-]+)/i) ||
                                  html.match(/['"]([a-zA-Z0-9_-]{8,15})['"][^>]*layma/i);

                    if (match) {
                        token = match[1];
                    }

                    if (!token) {
                        // Nếu không thấy token và đang bật chế độ Đổi NV khi lỗi -> Tự động đổi nhiệm vụ!
                        const autoChange = document.getElementById('dz-opt-auto-change-err').checked;
                        if (autoChange) {
                            alertBox.innerHTML = `<span style="color:#ef4444; font-weight:bold;">⚠️ Không tìm thấy mã trên web này! Đang tự động đổi sang nhiệm vụ khác...</span>`;
                            setTimeout(triggerNativeChangeTask, 1500);
                            return;
                        }
                        token = "qjN7uwFQr"; // fallback
                    }

                    console.log("[Duyzoz Engine] Tìm thấy keyToken:", token);
                    alertBox.innerHTML = `<strong>✅ Đã tìm thấy Token (${token})!</strong><br>Đang tạo session ngầm từ api.layma.net...`;

                    // BƯỚC 2: Gọi api/traffic/session để lấy Session Token
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: "https://api.layma.net/api/traffic/session",
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Mozilla/5.0'
                        },
                        data: JSON.stringify({ keyToken: token }),
                        onload: (sRes) => {
                            let sessionToken = null;
                            try {
                                const sJson = JSON.parse(sRes.responseText);
                                sessionToken = sJson.sessionToken || sJson.SessionToken;
                            } catch(e) {}

                            if (!sessionToken) {
                                alertBox.innerHTML = `<span style="color:#ef4444;">Lỗi tạo session! Đang đổi nhiệm vụ...</span>`;
                                setTimeout(triggerNativeChangeTask, 1500);
                                return;
                            }

                            // BƯỚC 3: Thử các platform ('tructiep', 'google') để kích hoạt chiến dịch
                            tryActivateCampaign(token, sessionToken, questUrl, waitTime);
                        },
                        onerror: () => {
                            alertBox.innerHTML = `<span style="color:red;">Lỗi kết nối tới api.layma.net!</span>`;
                            submitBtn.disabled = false;
                        }
                    });
                },
                onerror: () => {
                    alertBox.innerHTML = `<span style="color:red;">Không thể kết nối tới web nhiệm vụ! Đang đổi nhiệm vụ...</span>`;
                    setTimeout(triggerNativeChangeTask, 1500);
                }
            });
        }

        // BƯỚC 3: Kích hoạt campaign qua api/admin/campain
        function tryActivateCampaign(token, sessionToken, questUrl, waitTime) {
            const platforms = ['tructiep', 'google', 'facebook'];
            let currentPlatIdx = 0;

            function attemptPlatform() {
                if (currentPlatIdx >= platforms.length) {
                    alertBox.innerHTML = `<span style="color:red;">Hết chiến dịch phù hợp cho web này! Đang đổi nhiệm vụ...</span>`;
                    setTimeout(triggerNativeChangeTask, 1500);
                    return;
                }

                const plat = platforms[currentPlatIdx];
                const campUrl = `https://api.layma.net/api/admin/campain?keytoken=${token}&flatform=${plat}&waitMode=1&requiredPageVisits=1`;

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
                        if (cRes.status === 200) {
                            try {
                                const cData = JSON.parse(cRes.responseText);
                                console.log("[Duyzoz Engine] Kích hoạt chiến dịch thành công:", cData);
                                
                                const trafficId = cData.id;
                                const actualWait = cData.requiredWaitSeconds || waitTime;

                                alertBox.innerHTML = `<strong>🎉 Kết nối chiến dịch thành công!</strong><br>Đang giữ phiên an toàn trong ${actualWait} giây...`;

                                // BẮT ĐẦU ĐẾM NGƯỢC
                                runCountdown(actualWait, () => {
                                    fetchFinalCode(token, sessionToken, trafficId, questUrl);
                                });
                            } catch(e) {
                                currentPlatIdx++;
                                attemptPlatform();
                            }
                        } else {
                            currentPlatIdx++;
                            attemptPlatform();
                        }
                    },
                    onerror: () => {
                        currentPlatIdx++;
                        attemptPlatform();
                    }
                });
            }

            attemptPlatform();
        }

        // BƯỚC 4: Đếm ngược
        function runCountdown(seconds, onFinished) {
            let left = seconds;
            const timer = setInterval(() => {
                left--;
                submitBtn.innerText = `Đang đếm ngược: ${left}s`;
                if (left <= 0) {
                    clearInterval(timer);
                    submitBtn.innerText = "Đang xin mã từ máy chủ...";
                    onFinished();
                }
            }, 1000);
        }

        // BƯỚC 5: Gọi api/traffic/getcode để lấy mã thực sự
        function fetchFinalCode(token, sessionToken, trafficId, questUrl) {
            alertBox.innerHTML = `<strong>Đang yêu cầu mã giải phóng từ api.layma.net/api/traffic/getcode...</strong>`;

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
                    solution: 1
                }),
                onload: (res) => {
                    try {
                        const json = JSON.parse(res.responseText);
                        const rawCode = json.html || json.code || "";
                        const match = rawCode.match(/\d{4,8}/);

                        if (match) {
                            const finalCode = match[0];
                            alertBox.innerHTML = `<strong style="color:#059669; font-size:15px;">🎉 LẤY MÃ THÀNH CÔNG: ${finalCode}</strong><br>Đã tự động điền vào ô mã!`;
                            submitBtn.innerText = `Mã: ${finalCode}`;
                            GM_setClipboard(finalCode);

                            // Điền vào ô input trên trang LayMa
                            const codeInputs = document.querySelectorAll('input[type="text"], input[name="code"], input[id="code"]');
                            for (const inp of codeInputs) {
                                if (!inp.id.includes('dz-')) {
                                    inp.value = finalCode;
                                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }

                            // Tự động bấm nút Xác nhận nếu không vướng Turnstile
                            const submitBtnOnPage = document.querySelector('button.btn-primary, #btn-submit, button[type="submit"]');
                            if (submitBtnOnPage && !submitBtnOnPage.id.includes('dz-')) {
                                setTimeout(() => submitBtnOnPage.click(), 1000);
                            }
                        } else {
                            alertBox.innerHTML = `<span>Server trả về: ${res.responseText}</span>`;
                        }
                    } catch(e) {
                        alertBox.innerHTML = `<span style="color:red;">Lỗi phân tích mã: ${e.message}</span>`;
                    }
                },
                onerror: () => {
                    alertBox.innerHTML = `<span style="color:red;">Lỗi kết nối khi lấy mã!</span>`;
                }
            });
        }

        submitBtn.onclick = startBypassProcess;

        // NẾU TỰ ĐỘNG TÌM THẤY LINK QUEST VÀ ĐANG BẬT TỰ ĐỘNG -> TỰ ĐỘNG CHẠY LUÔN SAU 1 GIÂY!
        if (autoDetectedQuestUrl) {
            setTimeout(() => {
                console.log("[Duyzoz Engine] Tự động khởi chạy bypass cho link phát hiện được:", autoDetectedQuestUrl);
                startBypassProcess();
            }, 1000);
        }
    }

    // Khởi chạy khi DOM sẵn sàng
    function startEngine() {
        scanHtmlScripts();
        initLayMaPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startEngine);
    } else {
        startEngine();
    }

    setInterval(scanHtmlScripts, 2000);

})();
