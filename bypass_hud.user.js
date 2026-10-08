// ==UserScript==
// @name         Bypass Link All-in-One HUD (Duyzoz Edition)
// @namespace    https://github.com/duyzoz/BYPASS-ALL-IN-ONE
// @version      2.2.0
// @description  Tự động vượt link Link4Sub (Trích xuất link đích 100%), LayMa.net (Giao diện chuẩn Hình 3 Made by Duyzoz), đếm ngược an toàn và tự điền mã.
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

        // Hiển thị Banner thành công cực đẹp
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: #ffffff; padding: 16px 28px; border-radius: 16px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px; font-weight: bold;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.2);
            z-index: 2147483647; text-align: center; line-height: 1.6;
        `;
        banner.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 4px;">🎉 MADE BY DUYZOZ: ĐÃ BYPASS THÀNH CÔNG!</div>
            <div style="font-size: 12px; color: #d1fae5; font-weight: normal; margin-bottom: 10px;">Link đích: <span style="text-decoration: underline;">${targetUrl.substring(0, 45)}...</span> (Đã copy)</div>
            <a href="${targetUrl}" style="background: white; color: #059669; padding: 6px 16px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 800; display: inline-block;">ĐI ĐẾN LINK ĐÍCH NGAY ➜</a>
        `;
        document.body ? document.body.appendChild(banner) : document.documentElement.appendChild(banner);

        // Tự động chuyển hướng sau 1.5 giây
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 1500);
    }

    // 1. Hook XMLHttpRequest & Fetch để bắt gói tin JSON chứa link đích của Link4Sub
    function hookNetworkForLink4Sub() {
        // Hook Fetch
        const origFetch = window.fetch;
        window.fetch = async function (...args) {
            const response = await origFetch.apply(this, args);
            try {
                const clone = response.clone();
                clone.text().then(text => scanTextForEncodedUrl(text));
            } catch (e) {}
            return response;
        };

        // Hook XHR
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

    // Quét chuỗi Base64 đại diện cho URL (aHR0cHM6Ly = https://, aHR0cDov = http://)
    function scanTextForEncodedUrl(text) {
        if (!text || link4SubFound) return;

        // Trường hợp A: JSON chứa trường lnk1
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

        // Trường hợp B: Quét chuỗi Base64 trực tiếp
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

    // Quét toàn bộ mã nguồn trang HTML để tìm link ẩn
    function scanHtmlScripts() {
        const scripts = document.querySelectorAll('script');
        scripts.forEach(s => {
            if (s.textContent) scanTextForEncodedUrl(s.textContent);
        });
        scanTextForEncodedUrl(document.documentElement.innerHTML);
    }

    hookNetworkForLink4Sub();


    /* =========================================================================
     *  PHẦN 2: BỘ XỬ LÝ LAYMA.NET (CHUẨN 100% GIAO DIỆN HÌNH 3 - MADE BY DUYZOZ)
     * ========================================================================= */
    function initLayMaPanel() {
        if (!window.location.hostname.includes('layma.net')) return;
        if (document.getElementById('duyzoz-layma-panel')) return;

        console.log("[Duyzoz Engine] Đang dựng giao diện LayMa.net chuẩn Hình 3...");

        // 1. Tự động bóc tách Link ảnh hướng dẫn và Từ khóa có trên trang
        let guideImgUrl = "";
        let searchKeyword = "Không có từ khóa";

        // Quét ảnh
        const imgs = document.querySelectorAll('img');
        for (const img of imgs) {
            if (img.src && (img.src.includes('layma.net/media') || img.src.includes('posts') || img.src.includes('images'))) {
                guideImgUrl = img.src;
                break;
            }
        }
        if (!guideImgUrl && imgs.length > 0) {
            for (const img of imgs) {
                if (img.width > 220 || img.height > 80) {
                    guideImgUrl = img.src;
                    break;
                }
            }
        }

        // Quét từ khóa
        const allElements = document.querySelectorAll('div, p, b, strong, span');
        for (const el of allElements) {
            const txt = el.innerText || "";
            if (txt.includes('sunwin') || txt.includes('88bet') || txt.includes('w88') || txt.includes('bk8')) {
                const words = txt.trim().split(/\s+/);
                if (words.length <= 3) {
                    searchKeyword = txt.trim();
                    break;
                }
            }
        }

        // 2. CSS Giao diện chuẩn xác theo Hình 3
        GM_addStyle(`
            #duyzoz-layma-panel {
                position: fixed;
                top: 15px;
                right: 25px;
                width: 480px;
                max-width: 95vw;
                background: #ffffff;
                border: 1px solid #fde68a;
                border-radius: 16px;
                box-shadow: 0 20px 45px rgba(0,0,0,0.18), 0 0 0 1px rgba(245, 158, 11, 0.25);
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #334155;
                padding: 16px;
                box-sizing: border-box;
                animation: panelFadeIn 0.3s ease-out;
            }

            @keyframes panelFadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
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
                font-size: 22px;
                font-weight: 800;
                color: #d946ef;
                letter-spacing: -0.01em;
                margin-bottom: 3px;
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

        // 3. Render HTML
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
                    <label class="dz-toggle"><input type="checkbox"><span class="dz-slider"></span></label>
                </div>
                <div class="dz-setting-row">
                    <span>Đổi NV blacklist:</span>
                    <label class="dz-toggle"><input type="checkbox" checked><span class="dz-slider"></span></label>
                </div>
                <div class="dz-setting-row">
                    <span>Mở link tự động:</span>
                    <label class="dz-toggle"><input type="checkbox"><span class="dz-slider"></span></label>
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
                    <input type="number" id="dz-wait-seconds" class="dz-time-input" value="85">
                </div>
            </div>

            <!-- NHIỆM VỤ -->
            <div class="dz-quest-card">
                <div class="dz-alert-box" id="dz-status-alert">
                    <strong>Không lấy được link Quest tự động!</strong><br>
                    Bạn có thể nhập thông tin nhiệm vụ thủ công để tiếp tục.
                </div>

                <label class="dz-field-label">Link ảnh hướng dẫn</label>
                <input type="text" class="dz-field-input" id="dz-guide-img-input" value="${guideImgUrl}" readonly>

                ${guideImgUrl ? `<img src="${guideImgUrl}" class="dz-img-box" alt="Ảnh hướng dẫn">` : ''}

                <label class="dz-field-label">Từ khóa</label>
                <input type="text" class="dz-field-input" id="dz-keyword-input" value="${searchKeyword}" readonly>

                <label class="dz-field-label">Link Quest thủ công</label>
                <input type="text" class="dz-field-input" id="dz-manual-url" placeholder="https://..." style="border: 2px solid #f59e0b;">

                <button class="dz-btn-continue" id="dz-btn-submit-quest">Tiếp tục với link này</button>
                <button class="dz-btn-change" id="dz-btn-reload-quest">Đổi nhiệm vụ</button>
            </div>
        `;

        document.body ? document.body.appendChild(panel) : document.documentElement.appendChild(panel);

        document.getElementById('dz-close-btn').onclick = () => panel.remove();
        document.getElementById('dz-btn-reload-quest').onclick = () => window.location.reload();

        // 4. BẤM TIẾP TỤC VỚI LINK NÀY
        const submitBtn = document.getElementById('dz-btn-submit-quest');
        const manualInput = document.getElementById('dz-manual-url');
        const alertBox = document.getElementById('dz-status-alert');

        submitBtn.onclick = () => {
            const questUrl = manualInput.value.trim();
            if (!questUrl.startsWith('http')) {
                alert("Vui lòng nhập đường link đầy đủ bắt đầu bằng https://");
                manualInput.focus();
                return;
            }

            const waitTime = parseInt(document.getElementById('dz-wait-seconds').value) || 85;
            submitBtn.disabled = true;
            alertBox.innerHTML = `<strong>⚡ Đang kết nối ngầm tới:</strong> ${questUrl}<br>Đang bóc tách mã chiến dịch LayMa...`;

            // Gửi ngầm request tới web nhiệm vụ
            GM_xmlhttpRequest({
                method: "GET",
                url: questUrl,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                onload: (res) => {
                    const html = res.responseText;
                    let token = "e9VJokISt";

                    const tokenMatch = html.match(/api\.layma\.net[^\'\"]*keytoken=([a-zA-Z0-9]+)/i) || 
                                       html.match(/Traffic\/Index\/([a-zA-Z0-9]+)/i) ||
                                       html.match(/['"]([a-zA-Z0-9]{8,12})['"][^>]*layma/i);

                    if (tokenMatch) token = tokenMatch[1];

                    console.log("[Duyzoz Engine] Đã có keytoken:", token);
                    alertBox.innerHTML = `<strong>✅ Đã kết nối phiên thành công!</strong><br>Đang giữ phiên an toàn trong ${waitTime} giây...`;

                    // Bắt đầu đếm ngược thời gian
                    let remaining = waitTime;
                    const timerId = setInterval(() => {
                        remaining--;
                        submitBtn.innerText = `Đang đếm ngược: ${remaining}s`;

                        if (remaining <= 0) {
                            clearInterval(timerId);
                            submitBtn.innerText = "Đang xin mã từ máy chủ LayMa...";

                            // Hết giờ -> Gọi API xin mã
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: `https://api.layma.net/api/admin/campain?keytoken=${token}&flatform=google`,
                                headers: { 'Host': 'api.layma.net' },
                                onload: (cRes) => {
                                    let campId = 102026;
                                    try {
                                        const cData = JSON.parse(cRes.responseText);
                                        campId = cData.id || 102026;
                                    } catch(e) {}

                                    GM_xmlhttpRequest({
                                        method: "POST",
                                        url: "https://api.layma.net/api/admin/codemanager/getcode",
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Origin': questUrl,
                                            'Referer': questUrl
                                        },
                                        data: JSON.stringify({
                                            uuid: String(Math.floor(100000 + Math.random() * 900000)),
                                            browser: 'Chrome',
                                            browserVersion: '120',
                                            screen: '1920 x 1080',
                                            trafficid: campId,
                                            solution: '1'
                                        }),
                                        onload: (codeRes) => {
                                            try {
                                                const codeJson = JSON.parse(codeRes.responseText);
                                                const rawHtml = codeJson.html || "";
                                                const m = rawHtml.match(/\d{4,8}/);

                                                if (m) {
                                                    const finalCode = m[0];
                                                    alertBox.innerHTML = `<strong style="color:#059669; font-size:14px;">🎉 LẤY MÃ THÀNH CÔNG: ${finalCode}</strong><br>Đang tự động điền vào LayMa...`;
                                                    submitBtn.innerText = `Mã: ${finalCode}`;
                                                    GM_setClipboard(finalCode);

                                                    // Tự động điền vào ô mã trên LayMa
                                                    const codeInp = document.querySelector('input[name="code"], input[id="code"], input[placeholder*="mã"], input[placeholder*="code"]');
                                                    if (codeInp) {
                                                        codeInp.value = finalCode;
                                                        codeInp.dispatchEvent(new Event('input', { bubbles: true }));
                                                        codeInp.dispatchEvent(new Event('change', { bubbles: true }));

                                                        const subBtn = document.querySelector('button[type="submit"], #btn-submit, .btn-submit');
                                                        if (subBtn) setTimeout(() => subBtn.click(), 800);
                                                    }
                                                } else {
                                                    alertBox.innerHTML = `<span>Server trả về: ${rawHtml}</span>`;
                                                }
                                            } catch(e) {
                                                alertBox.innerHTML = `<span>Lỗi xử lý mã: ${e.message}</span>`;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }, 1000);
                },
                onerror: () => {
                    alertBox.innerHTML = `<span style="color:red;">Lỗi kết nối tới web nhiệm vụ!</span>`;
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Tiếp tục với link này";
                }
            });
        };
    }

    // Tự động kích hoạt ngay khi tải trang (không chờ load event)
    function run() {
        scanHtmlScripts();
        initLayMaPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    // Quét bổ sung định kỳ cho trang SPA/load chậm
    setInterval(run, 1500);

})();
