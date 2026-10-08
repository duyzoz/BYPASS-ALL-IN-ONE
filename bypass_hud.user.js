// ==UserScript==
// @name         Bypass Link All-in-One HUD (Duyzoz Edition)
// @namespace    https://github.com/duyzoz/BYPASS-ALL-IN-ONE
// @version      2.1.0
// @description  Tự động vượt link rút gọn Link4Sub, LayMa.net (Giao diện chuẩn Duyzoz), đếm ngược an toàn và tự điền mã.
// @author       Duyzoz
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/bypass_hud.user.js
// @downloadURL  https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/bypass_hud.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const currentUrl = window.location.href;

    /* =========================================================================
     *  PHẦN 1: BỘ XỬ LÝ LINK4SUB (Bao gồm cả các domain bọc như onthitracnghiem.com)
     * ========================================================================= */
    function detectAndHandleLink4Sub() {
        // Kiểm tra xem trang có phải là Link4Sub không (qua URL, text, logo, footer)
        const isLink4Sub = (
            currentUrl.includes('link4sub.com') ||
            document.body.innerText.includes('Link4Sub') ||
            document.querySelector('img[src*="link4sub"], a[href*="link4sub"], footer:has(span:contains("Link4Sub"))') ||
            document.title.includes('Link4Sub')
        );

        if (!isLink4Sub) return false;

        console.log("[Duyzoz Engine] Phát hiện hệ thống Link4Sub!");

        // Tiêm thông báo hỗ trợ trên đầu trang
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white; padding: 10px 24px; border-radius: 999px;
            font-family: sans-serif; font-size: 13px; font-weight: bold;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 99999999;
            display: flex; align-items: center; gap: 8px;
        `;
        banner.innerHTML = `<span>⚡ Made by Duyzoz: Đang tự động mở khoá Link4Sub...</span>`;
        document.body.appendChild(banner);

        // Chặn popup mở tab YouTube/Mạng xã hội không cần thiết
        const origOpen = window.open;
        window.open = function(url, target, features) {
            if (url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('facebook.com') || url.includes('tiktok.com'))) {
                console.log("[Duyzoz Engine] Đã chặn popup mạng xã hội:", url);
                banner.innerHTML = `<span>✅ Đã vượt bước xác minh YouTube. Đang mở khoá nút tiếp theo...</span>`;
                return null;
            }
            return origOpen.call(this, url, target, features);
        };

        // Tự động kích hoạt nút nhiệm vụ và mở khoá bước tiếp theo
        setTimeout(() => {
            // 1. Tự động click vào các nút nhiệm vụ màu đỏ nếu có
            const taskBtns = document.querySelectorAll('button, a, .btn');
            taskBtns.forEach(btn => {
                const txt = btn.innerText || "";
                if (txt.includes('Đăng ký kênh') || txt.includes('Subscribe') || txt.includes('Theo dõi')) {
                    console.log("[Duyzoz Engine] Tự động kích hoạt nhiệm vụ:", txt);
                    btn.click();
                }
            });

            // 2. Tự động kiểm tra và mở khoá nút "Bước tiếp theo"
            setInterval(() => {
                const nextBtns = document.querySelectorAll('button, a, .btn');
                nextBtns.forEach(btn => {
                    const txt = btn.innerText || "";
                    if (txt.includes('Bước tiếp theo') || txt.includes('Mở khoá link') || txt.includes('Get Link') || txt.includes('Lấy link')) {
                        // Gỡ bỏ disabled / pointer-events: none nếu có
                        btn.removeAttribute('disabled');
                        btn.style.pointerEvents = 'auto';
                        btn.style.opacity = '1';

                        // Nếu nút đã sẵn sàng (chuyển màu xanh) thì click
                        if (!btn.classList.contains('disabled') && !btn.hasAttribute('disabled')) {
                            console.log("[Duyzoz Engine] Đang bấm nút chuyển tiếp!");
                            banner.innerHTML = `<span>🎉 Đang chuyển hướng đến link đích...</span>`;
                            btn.click();
                        }
                    }
                });
            }, 1000);

        }, 1200);

        return true;
    }


    /* =========================================================================
     *  PHẦN 2: BỘ XỬ LÝ LAYMA.NET (GIAO DIỆN CHUẨN 100% Y HỆT HÌNH 3)
     * ========================================================================= */
    function handleLayMaNet() {
        if (!currentUrl.includes('layma.net')) return false;

        console.log("[Duyzoz Engine] Phát hiện LayMa.net. Đang dựng giao diện điều khiển...");

        // Tìm link ảnh hướng dẫn và từ khoá có sẵn trên trang layma.net
        let guideImgUrl = "";
        let searchKeyword = "Không có từ khóa";

        const imgEl = document.querySelector('img[src*="layma.net/media"], img[src*="posts"], .guide-img, img[src*="images"]');
        if (imgEl) guideImgUrl = imgEl.src;

        const bodyText = document.body.innerText;
        const kwMatch = bodyText.match(/từ kh[oó]a[:\s]+([^\n\r]+)/i);
        if (kwMatch) searchKeyword = kwMatch[1].trim();

        // 1. Tiêm CSS giao diện chuẩn Hình 3
        GM_addStyle(`
            #duyzoz-layma-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 480px;
                max-width: 95vw;
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.18), 0 0 0 1px rgba(245, 158, 11, 0.2);
                z-index: 99999999;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #334155;
                overflow: hidden;
                animation: panelSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes panelSlide {
                from { opacity: 0; transform: translateY(-15px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* CARD 1: HEADER */
            .dz-header-card {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 12px;
                margin: 16px 16px 12px 16px;
                padding: 16px;
                text-align: center;
            }
            .dz-brand-title {
                font-size: 20px;
                font-weight: 800;
                color: #d946ef;
                letter-spacing: 0.02em;
                margin-bottom: 4px;
            }
            .dz-brand-link {
                color: #3b82f6;
                font-size: 13px;
                font-weight: 600;
                text-decoration: none;
            }
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
                margin: 0 16px 12px 16px;
                padding: 14px 16px;
                font-size: 13px;
                color: #b45309;
            }
            .dz-settings-title {
                font-weight: 700;
                margin-bottom: 10px;
                color: #92400e;
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
                width: 38px;
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
            .dz-toggle input:checked + .dz-slider:before { transform: translateX(16px); }

            .dz-link-helper {
                font-size: 11px;
                color: #b45309;
                text-decoration: underline;
                display: block;
                margin-top: 4px;
                cursor: pointer;
            }
            .dz-timer-input-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 8px;
            }
            .dz-time-box {
                width: 65px;
                padding: 4px 8px;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                text-align: center;
                font-weight: bold;
                background: white;
                color: #92400e;
            }

            /* CARD 3: NHIỆM VỤ */
            .dz-quest-card {
                background: #ffffff;
                border: 1px solid #fed7aa;
                border-radius: 12px;
                margin: 0 16px 16px 16px;
                padding: 16px;
            }
            .dz-quest-alert {
                background: #fff7ed;
                border: 1px solid #ffedd5;
                border-radius: 8px;
                padding: 10px 12px;
                margin-bottom: 14px;
                font-size: 12px;
                color: #ea580c;
                line-height: 1.4;
            }
            .dz-label {
                font-size: 12px;
                font-weight: 600;
                color: #475569;
                margin-bottom: 4px;
                display: block;
            }
            .dz-input {
                width: 100%;
                box-sizing: border-box;
                padding: 8px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 13px;
                color: #334155;
                background: #f8fafc;
                margin-bottom: 12px;
            }
            .dz-input:focus {
                outline: none;
                border-color: #f59e0b;
                background: white;
            }

            .dz-img-preview {
                width: 100%;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                margin-bottom: 12px;
                max-height: 120px;
                object-fit: contain;
                background: #f1f5f9;
                display: block;
            }

            .dz-btn-yellow {
                width: 100%;
                padding: 12px;
                background: #f59e0b;
                color: white;
                font-weight: 700;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                transition: background .2s;
                margin-bottom: 8px;
            }
            .dz-btn-yellow:hover { background: #d97706; }
            .dz-btn-red {
                width: 100%;
                padding: 10px;
                background: #ef4444;
                color: white;
                font-weight: 700;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                cursor: pointer;
                transition: background .2s;
            }
            .dz-btn-red:hover { background: #dc2626; }
            .dz-btn-close {
                position: absolute; top: 12px; right: 16px;
                background: transparent; border: none; font-size: 18px; color: #94a3b8; cursor: pointer;
            }
        `);

        // 2. Tạo DOM
        const panel = document.createElement('div');
        panel.id = 'duyzoz-layma-panel';
        panel.innerHTML = `
            <button class="dz-btn-close" id="dz-btn-close">✕</button>

            <!-- CARD 1 -->
            <div class="dz-header-card">
                <div class="dz-brand-title">Made by Duyzoz ✦</div>
                <a href="https://github.com/duyzoz/BYPASS-ALL-IN-ONE" target="_blank" class="dz-brand-link">Bypass Engine v2.1</a>
                <div class="dz-brand-sub">Cộng Đồng Chia Sẻ Và Hỗ Trợ Nhanh. Tool Bypass Link VN Siêu Nhanh</div>
            </div>

            <!-- CARD 2: CÀI ĐẶT BYPASS -->
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

                <div class="dz-timer-input-row">
                    <div>
                        <div style="font-weight: 600;">Thời gian chờ (giây):</div>
                        <div style="font-size: 11px; font-style: italic;">(Khuyến dùng >70s để tránh bị cấm)</div>
                    </div>
                    <input type="number" id="dz-wait-time" class="dz-time-box" value="85">
                </div>
            </div>

            <!-- CARD 3: NHIỆM VỤ -->
            <div class="dz-quest-card">
                <div class="dz-quest-alert" id="dz-alert-box">
                    <strong>Không lấy được link Quest tự động!</strong><br>
                    Bạn có thể nhập thông tin nhiệm vụ thủ công để tiếp tục.
                </div>

                <label class="dz-label">Link ảnh hướng dẫn</label>
                <input type="text" class="dz-input" id="dz-img-url" value="${guideImgUrl}" readonly>

                ${guideImgUrl ? `<img src="${guideImgUrl}" class="dz-img-preview" alt="Preview ảnh hướng dẫn">` : ''}

                <label class="dz-label">Từ khóa</label>
                <input type="text" class="dz-input" id="dz-keyword" value="${searchKeyword}" readonly>

                <label class="dz-label">Link Quest thủ công</label>
                <input type="text" class="dz-input" id="dz-quest-url" placeholder="https://..." style="border: 2px solid #f59e0b;">

                <button class="dz-btn-yellow" id="dz-btn-start">Tiếp tục với link này</button>
                <button class="dz-btn-red" id="dz-btn-change">Đổi nhiệm vụ</button>
            </div>
        `;

        document.body.appendChild(panel);

        document.getElementById('dz-btn-close').onclick = () => panel.remove();
        document.getElementById('dz-btn-change').onclick = () => window.location.reload();

        // 3. XỬ LÝ SỰ KIỆN: TIẾP TỤC VỚI LINK NÀY
        const startBtn = document.getElementById('dz-btn-start');
        const questInput = document.getElementById('dz-quest-url');
        const alertBox = document.getElementById('dz-alert-box');

        startBtn.onclick = () => {
            const questUrl = questInput.value.trim();
            if (!questUrl.startsWith('http')) {
                alert("Vui lòng nhập đúng đường link bắt đầu bằng https://");
                questInput.focus();
                return;
            }

            const waitTime = parseInt(document.getElementById('dz-wait-time').value) || 85;
            startBtn.disabled = true;
            alertBox.innerHTML = `<strong>⚡ Đang kết nối ngầm tới:</strong> ${questUrl}<br>Đang bóc tách mã chiến dịch LayMa...`;

            // BƯỚC A: Tải ngầm HTML của Web nhiệm vụ để tìm token
            GM_xmlhttpRequest({
                method: "GET",
                url: questUrl,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                onload: (res) => {
                    const html = res.responseText;
                    
                    // Regex tìm token layma trong mã nguồn trang nhiệm vụ
                    let token = null;
                    const tokenMatch = html.match(/api\.layma\.net[^\'\"]*keytoken=([a-zA-Z0-9]+)/i) || 
                                       html.match(/Traffic\/Index\/([a-zA-Z0-9]+)/i) ||
                                       html.match(/['"]([a-zA-Z0-9]{8,12})['"][^>]*layma/i);

                    if (tokenMatch) {
                        token = tokenMatch[1];
                    } else {
                        // Token mặc định nếu trang giấu kín
                        token = "e9VJokISt"; 
                    }

                    console.log("[Duyzoz Engine] Đã lấy keytoken:", token);
                    alertBox.innerHTML = `<strong>✅ Đã kết nối phiên thành công!</strong><br>Đang giữ phiên an toàn trong ${waitTime} giây...`;

                    // BƯỚC B: Bắt đầu đếm ngược thời gian an toàn
                    let remaining = waitTime;
                    const timerInterval = setInterval(() => {
                        remaining--;
                        startBtn.innerText = `Đang đếm ngược an toàn: ${remaining}s`;

                        if (remaining <= 0) {
                            clearInterval(timerInterval);
                            startBtn.innerText = "Đang xin mã từ máy chủ LayMa...";

                            // BƯỚC C: Gọi API xin mã sau khi đã chờ đủ thời gian
                            requestLayMaCode(token, questUrl);
                        }
                    }, 1000);
                },
                onerror: () => {
                    alertBox.innerHTML = `<span style="color:red;">Lỗi kết nối tới web nhiệm vụ! Vui lòng thử lại.</span>`;
                    startBtn.disabled = false;
                    startBtn.innerText = "Tiếp tục với link này";
                }
            });
        };

        // 4. HÀM GỌI API LAYMA XIN MÃ VÀ TỰ ĐỘNG ĐIỀN
        function requestLayMaCode(token, questUrl) {
            alertBox.innerHTML = `<strong>Đang yêu cầu mã từ máy chủ...</strong>`;

            // Gọi campaign để lấy traffic ID
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://api.layma.net/api/admin/campain?keytoken=${token}&flatform=google`,
                headers: { 'Host': 'api.layma.net' },
                onload: (cRes) => {
                    let campId = null;
                    try {
                        const campData = JSON.parse(cRes.responseText);
                        campId = campData.id;
                    } catch(e) {
                        campId = 102026;
                    }

                    // Gọi codemanager/getcode để lấy mã thực sự
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
                                const match = rawHtml.match(/\d{4,8}/);

                                if (match) {
                                    const finalCode = match[0];
                                    alertBox.innerHTML = `<strong style="color:#059669; font-size:14px;">🎉 LẤY MÃ THÀNH CÔNG: ${finalCode}</strong><br>Đang tự động điền vào LayMa...`;
                                    startBtn.innerText = `Mã: ${finalCode}`;
                                    GM_setClipboard(finalCode);

                                    // Tự động tìm ô input trên trang LayMa và điền
                                    const codeInp = document.querySelector('input[name="code"], input[id="code"], input[placeholder*="mã"], input[placeholder*="code"]');
                                    if (codeInp) {
                                        codeInp.value = finalCode;
                                        codeInp.dispatchEvent(new Event('input', { bubbles: true }));
                                        codeInp.dispatchEvent(new Event('change', { bubbles: true }));
                                        
                                        // Tự động submit
                                        const subBtn = document.querySelector('button[type="submit"], #btn-submit, .btn-submit, button:contains("Xác nhận")');
                                        if (subBtn) {
                                            setTimeout(() => subBtn.click(), 1000);
                                        }
                                    }
                                } else {
                                    alertBox.innerHTML = `<span>Server trả về: ${rawHtml}. Vui lòng copy mã nếu có.</span>`;
                                }
                            } catch(e) {
                                alertBox.innerHTML = `<span>Không bóc tách được mã: ${e.message}</span>`;
                            }
                        }
                    });
                }
            });
        }

        return true;
    }

    // KHỞI CHẠY HỆ THỐNG
    window.addEventListener('load', () => {
        // Ưu tiên kiểm tra Link4Sub trước
        if (detectAndHandleLink4Sub()) return;

        // Sau đó kiểm tra LayMa.net
        if (handleLayMaNet()) return;
    });

})();
