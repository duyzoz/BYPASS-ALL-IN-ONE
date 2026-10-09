// ==UserScript==
// @name         Bypass Link All-in-One HUD (Made by Duyzoz)
// @namespace    https://github.com/duyzoz/BYPASS-ALL-IN-ONE
// @version      3.8.0
// @description  Bypass LayMa.net 100% chuẩn quy trình base projectscript112247 (Lắng nghe xác thực QCaptcha đa tầng, tự động lấy mã, auto submit LayMa & chuyển hướng link đích) & Link4Sub True Bypass.
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
// ==/UserScript==

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

    function scanLink4SubScripts() {
        if (!window.location.hostname.includes('link4sub.com')) return;
        document.querySelectorAll('script').forEach(s => {
            if (s.textContent) scanTextForEncodedUrl(s.textContent);
        });
        if (document.documentElement) scanTextForEncodedUrl(document.documentElement.innerHTML);
    }

    hookNetworkForLink4Sub();
    if (window.location.hostname.includes('link4sub.com')) {
        setInterval(scanLink4SubScripts, 1500);
    }


    /* =========================================================================
     *  PHẦN 2: BỘ GIẢI MÃ LAYMA.NET (CHUẨN 100% BASE PROJECTSCRIPT112247)
     * ========================================================================= */

    // 1. Dữ liệu Image Map & Blacklist Offline (tích hợp sẵn toàn bộ domain từ DB)
    const OFFLINE_IMAGE_MAP = {
        "https://api.layma.net/media/images/posts/082026/Screenshot_41.png": "https://marketingoffice.co.in",
        "https://api.layma.net/media/images/posts/082026/Screenshot_151.png": "https://workwithaarti.in",
        "https://api.layma.net/media/images/posts/082026/sunkt1008.png": "https://sunwinkt.com/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_150.png": "https://codecubicle.co.in/",
        "https://api.layma.net/media/images/posts/062026/sunvvgg.png": "https://sunwinvv.com/",
        "https://api.layma.net/media/images/posts/062026/sunmbgg.png": "https://sunwinmb.com/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_157.png": "https://stockmarketdigest.in/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_155.png": "https://caadda.co.in/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_158.png": "https://stockmarketdigest.in/",
        "https://api.layma.net/media/images/posts/082026/sunH2008.png": "https://caadda.co.in/",
        "https://api.layma.net/media/images/posts/062026/mbtt.png": "https://sunwinmb.com/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_162.png": "https://casaactores.com.co/",
        "https://api.layma.net/media/images/posts/082026/sunL2608.png": "https://10pets.com.co/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_166.png": "https://helloalvie.co/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_45.png": "https://propmastery.co/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_175.png": "https://1gallery.com.co/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_43.png": "https://www.marcushanda.co/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_48.png": "https://1bellanarithebrand.com.co/",
        "https://api.layma.net/media/images/posts/082026/Screenshot_47.png": "https://rubensbits.co/",
        "https://api.layma.net/media/images/posts/092026/Screenshot_54.png": "https://black-sheep.com.co/",
        "https://api.layma.net/media/images/posts/092026/Screenshot_55.png": "https://bituplast.com.co/",
        "https://api.layma.net/media/images/posts/092026/Screenshot_52.png": "https://black-sheep.com.co/",
        "https://api.layma.net/media/images/posts/092026/Screenshot_53.png": "https://bituplast.com.co/",
        "https://api.layma.net/media/images/posts/092026/2a21d78813f146bfb0c7115e5c06a6d9.png": "https://sunwin.1bellanarithebrand.com.co/",
        "https://api.layma.net/media/images/posts/092026/go88gh.png": "https://go88gh.com/",
        "https://api.layma.net/media/images/posts/092026/go88yt.png": "https://go88yt.com/",
        "https://api.layma.net/media/images/posts/092026/go88en.png": "https://go88en.com/",
        "https://api.layma.net/media/images/posts/092026/6a0f6123fa7c490fa4015448b1e8039b.png": "https://citricosavila.com.co/",
        "https://api.layma.net/media/images/posts/092026/d14ededf0afc4f57aab2d9193ff6b64a.png": "https://www.brsystems.com.co/",
        "https://api.layma.net/media/images/posts/092026/b53324ccdb2c4093825222a8b33a9c63.png": "https://talemtos.com.co/",
        "https://api.layma.net/media/images/posts/072026/sunkt.png": "https://sunwinkt.com",
        "https://api.layma.net/media/images/posts/072026/sunbvL.png": "https://sunwinbv.com",
        "https://api.layma.net/media/images/posts/092026/55fd0dd049b044a0840f6b257f0a28d4.png": "https://smileitsolutions.co.in",
        "https://api.layma.net/media/images/posts/092026/df2ba3f6a8b4432c88890e246b6245c3.png": "https://smileitsolutions.co.in/",
        "https://api.layma.net/media/images/posts/092026/0acae078e4284dd4a04fa99cbb72f95f.png": "https://onlinejob.com.co",
        "https://api.layma.net/media/images/posts/092026/98cc168aeaa240b7b1ff273e388442bd.png": "https://nasons.co.in",
        "https://api.layma.net/media/images/posts/092026/e5f83326b0154fea90114939d24b29ab.png": "https://nasons.co.in/",
        "https://api.layma.net/media/images/posts/092026/580ecfafcd4b4e278503ca1e5097d5d4.png": "https://tambor.com.co",
        "https://api.layma.net/media/images/posts/092026/c73a39098e274cb5996f3cb924abb808.png": "https://socialbar.co.in/",
        "https://api.layma.net/media/images/posts/092026/bbd7419209ea4f6bafa8e88c31f1d803.png": "https://www.agilafc.com/",
        "https://api.layma.net/media/images/posts/092026/fa86234458274d59963c65f794c39283.png": "https://alikafuel.co.in",
        "https://api.layma.net/media/images/posts/092026/1126d65b88c94ede9199c19280132d3e.png": "https://ideassimples.com.co",
        "https://api.layma.net/media/images/posts/092026/d16e3653235b416cbd77ae6c4c47d85a.png": "https://hpssonpur.co.in",
        "https://api.layma.net/media/images/posts/092026/07fae7c8aede4a2ca4633b9cc3316b96.png": "https://corrsa.co.in",
        "https://api.layma.net/media/images/posts/092026/2e5db2b140274749bf709f0553caacbf.png": "https://ideaswebcreator.com.co",
        "https://api.layma.net/media/images/posts/092026/cfa50a9c5bbd438f9d451c3c7e3fa9b1.png": "https://corrsa.co.in",
        "https://api.layma.net/media/images/posts/092026/946fdc8a5504451e8a8b66686072891e.png": "https://adroitengineering.co.in",
        "https://api.layma.net/media/images/posts/102026/3b9b943772184a44bce4c65a4ed028c4.png": "https://idelec.com.co",
        "3b9b943772184a44bce4c65a4ed028c4.png": "https://idelec.com.co",
        "e7f840270537844": "https://kslsdesign.com.co",
        "kslsdesign.com.co": "https://kslsdesign.com.co"
    };
    const OFFLINE_BLACKLIST = ["codecubicle.co.in", "aligninterio.co.in"];

    // 2. Bộ ánh xạ tự động bypass vĩnh viễn qua Từ Khóa (Persistent All-in-One auto-bypass)
    const KEYWORD_AUTO_MAP = {
        "102pets": "https://idelec.com.co",
        "102pet": "https://idelec.com.co",
        "nasons": "https://nasons.co.in",
        "smileit": "https://smileitsolutions.co.in",
        "corrsa": "https://corrsa.co.in",
        "tambor": "https://tambor.com.co",
        "agila": "https://www.agilafc.com/",
        "ideassimples": "https://ideassimples.com.co",
        "hpssonpur": "https://hpssonpur.co.in",
        "adroit": "https://adroitengineering.co.in",
        "caadda": "https://caadda.co.in/",
        "casaactores": "https://casaactores.com.co/",
        "helloalvie": "https://helloalvie.co/",
        "rubensbits": "https://rubensbits.co/",
        "black-sheep": "https://black-sheep.com.co/",
        "bituplast": "https://bituplast.com.co/",
        "citricos": "https://citricosavila.com.co/",
        "brsystems": "https://www.brsystems.com.co/",
        "talemtos": "https://talemtos.com.co/",
        "socialbar": "https://socialbar.co.in/",
        "alikafuel": "https://alikafuel.co.in",
        "ideaswebcreator": "https://ideaswebcreator.com.co",
        "marketingoffice": "https://marketingoffice.co.in",
        "workwithaarti": "https://workwithaarti.in",
        "stockmarket": "https://stockmarketdigest.in/",
        "propmastery": "https://propmastery.co/",
        "1gallery": "https://1gallery.com.co/",
        "marcushanda": "https://www.marcushanda.co/",
        "1bellanari": "https://1bellanarithebrand.com.co/",
        "onlinejob": "https://onlinejob.com.co",
        "go88gh": "https://go88gh.com/",
        "go88yt": "https://go88yt.com/",
        "go88en": "https://go88en.com/",
        "sunkt": "https://sunwinkt.com/",
        "sunmb": "https://sunwinmb.com/",
        "sunvv": "https://sunwinvv.com/",
        "sunbv": "https://sunwinbv.com"
    };

    let liveImageMap = Object.assign({}, OFFLINE_IMAGE_MAP);
    let liveBlacklist = [...OFFLINE_BLACKLIST];

    const DEFAULT_QCAPTCHA_SITEKEY = "facd4b6c-53e6-44a2-9b27-b01844a6bd75";
    const DEFAULT_QCAPTCHA_SCRIPT = "https://js.103-141-140-153.sslip.io/api.js?render=explicit&compat=hcaptcha";

    // Cấu hình lưu trữ
    function getSetting(key, def) {
        try {
            const v = localStorage.getItem('duyzoz_' + key);
            return v !== null ? JSON.parse(v) : def;
        } catch (e) {
            return def;
        }
    }
    function setSetting(key, val) {
        try { localStorage.setItem('duyzoz_' + key, JSON.stringify(val)); } catch (e) {}
    }

    // Bộ nhớ cache link thủ công đã lưu
    function getSavedManualMap() {
        try {
            const v = localStorage.getItem('duyzoz_manual_map');
            return v ? JSON.parse(v) : {};
        } catch (e) {
            return {};
        }
    }
    function saveManualMap(imgUrl, questUrl) {
        try {
            const map = getSavedManualMap();
            map[imgUrl] = questUrl;
            localStorage.setItem('duyzoz_manual_map', JSON.stringify(map));
        } catch (e) {}
    }

    // Tải cấu hình từ cloud Pastefy
    function syncCloudConfig() {
        if (typeof GM_xmlhttpRequest === "undefined") return;

        GM_xmlhttpRequest({
            method: "GET",
            url: "https://pastefy.app/TKphHBjA/raw?t=" + Date.now(),
            onload: (res) => {
                try {
                    const parsed = JSON.parse(res.responseText);
                    if (parsed && typeof parsed === "object") {
                        liveImageMap = Object.assign(liveImageMap, parsed);
                        console.log("[Duyzoz Engine] Đã đồng bộ " + Object.keys(parsed).length + " ảnh nhiệm vụ từ cloud.");
                    }
                } catch (e) {}
            }
        });

        GM_xmlhttpRequest({
            method: "GET",
            url: "https://pastefy.app/ZR3kGQZp/raw?t=" + Date.now(),
            onload: (res) => {
                try {
                    const parsed = JSON.parse(res.responseText);
                    if (Array.isArray(parsed)) {
                        liveBlacklist = parsed;
                        console.log("[Duyzoz Engine] Đã đồng bộ Blacklist từ cloud:", liveBlacklist);
                    }
                } catch (e) {}
            }
        });
    }

    // 2. Chèn CSS dọn sạch sẽ trang LayMa (Không mờ, không overlay, ẩn hoàn toàn form gốc)
    function injectLaymaCleanStyles() {
        const css = `
            /* ẨN TRIỆT ĐỂ TOÀN BỘ CÁC PHẦN TỬ CŨ CỦA LAYMA ĐỂ THAY THẾ HOÀN TOÀN */
            .heading, .box-step-note, .box-step-link, .box-step-title,
            .box-copy, .box-google, .box-step-getCode, .box-video, #videohd, #xuong,
            .box-linkFB-wrap, .box-btn-copy, .box-google-note, #btn-xac-nhan, #btn-baoloi,
            .box-step-footer, .box-footer, footer, div.mt-2, span.text-danger, p.fadeInUp.visible,
            #qcaptcha-checkcode, .box-form-button, .g-recaptcha, .h-captcha, .box-form-wrap,
            .box-step-wrap img#hinh_nv, .box-step-wrap img.img-fluid,
            .box-step-wrap > *:not([id^="native-override-"]):not(.box-form),
            .box-form > *:not(#native-override-captcha-box),
            #modalThongbao {
                display: none !important;
            }

            /* Container chuẩn giữa màn hình */
            .box-step-wrap {
                margin: 24px auto !important;
                padding: 24px !important;
                background: #ffffff !important;
                border: 1px solid #e2e8f0 !important;
                border-radius: 16px !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
                max-width: 620px !important;
                min-height: 0px !important;
                height: auto !important;
                max-height: none !important;
                box-sizing: border-box !important;
            }

            @keyframes shimmerEffect {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            .fancy-top-header {
                margin: 0 0 16px 0;
                padding: 14px 18px;
                background: #eff6ff;
                border-radius: 12px;
                text-align: center;
                border: 1px solid #bfdbfe;
                box-shadow: 0 4px 15px rgba(2, 132, 199, 0.16);
            }

            .vnbypass-title {
                display: block;
                color: #2563eb;
                font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: clamp(23px, 6vw, 32px);
                font-weight: 900;
                letter-spacing: 1px;
                line-height: 1.3;
                background: linear-gradient(90deg, #2563eb, #9333ea, #db2777, #0891b2, #2563eb);
                background-size: 300% auto;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shimmerEffect 4s linear infinite;
                text-shadow: 0 0 18px rgba(147, 51, 234, 0.18);
            }
            .vnbypass-title::after {
                content: ' ✦';
                -webkit-text-fill-color: #f59e0b;
                color: #f59e0b;
                font-size: 0.7em;
                vertical-align: super;
            }

            .vnbypass-discord {
                display: inline-block;
                margin-top: 5px;
                color: #5865f2;
                font-weight: 700;
                font-size: 13px;
                text-decoration: none;
            }
            .vnbypass-discord:hover {
                text-decoration: underline;
            }

            .vnbypass-intro {
                margin-top: 4px;
                color: #475569;
                font-size: 12px;
                line-height: 1.4;
            }

            /* Switches */
            .switch {
                position: relative;
                display: inline-block;
                width: 36px;
                height: 20px;
                margin: 0;
            }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: #cbd5e1; transition: .3s; border-radius: 20px;
            }
            .slider:before {
                position: absolute; content: ''; height: 16px; width: 16px; left: 2px; bottom: 2px;
                background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            input:checked + .slider { background-color: #d97706; }
            input:checked + .slider:before { transform: translateX(16px); }

            /* Progress Bar */
            .dz-progress-track {
                width: 100%;
                height: 8px;
                background: #e2e8f0;
                border-radius: 999px;
                overflow: hidden;
                margin-top: 12px;
            }
            .dz-progress-bar {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #06b6d4);
                border-radius: 999px;
                transition: width 1s linear;
            }
        `;

        if (typeof GM_addStyle !== "undefined") {
            GM_addStyle(css);
        } else {
            const style = document.createElement('style');
            style.id = 'duyzoz-custom-clean-style';
            style.innerHTML = css;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    // 3. Tải SDK QCaptcha an toàn tuyệt đối
    function loadQCaptchaSdk() {
        return new Promise((resolve) => {
            const getApi = () => pageWin.hcaptcha || pageWin.qcaptcha || window.hcaptcha || window.qcaptcha;
            if (getApi()) {
                return resolve(getApi());
            }

            let scriptUrl = pageWin.qCaptchaScriptUrl || DEFAULT_QCAPTCHA_SCRIPT;
            if (!scriptUrl.includes("compat=hcaptcha")) {
                const sep = scriptUrl.includes("?") ? "&" : "?";
                scriptUrl += sep + "render=explicit&compat=hcaptcha";
            }

            const s = document.createElement('script');
            s.src = scriptUrl;
            s.async = true;
            s.defer = true;
            s.onload = () => {
                setTimeout(() => {
                    resolve(getApi());
                }, 200);
            };
            s.onerror = () => {
                const s2 = document.createElement('script');
                s2.src = "https://hcaptcha.com/1/api.js?render=explicit";
                s2.async = true;
                s2.onload = () => setTimeout(() => resolve(getApi()), 200);
                s2.onerror = () => resolve(null);
                document.head.appendChild(s2);
            };
            document.head.appendChild(s);

            setTimeout(() => {
                if (!getApi()) resolve(null);
            }, 5000);
        });
    }

    function getQCaptchaSiteKey() {
        const container = document.getElementById('qcaptcha-checkcode');
        if (container && container.getAttribute('data-sitekey')) {
            return container.getAttribute('data-sitekey');
        }
        if (pageWin.qCaptchaSiteKey) {
            return pageWin.qCaptchaSiteKey;
        }
        return DEFAULT_QCAPTCHA_SITEKEY;
    }

    // 4. Trích xuất từ khóa nhiệm vụ
    function extractKeyword() {
        const el = document.querySelector('#TK1, #TK2, .box-copy-content, .box-copy-code, [data-clipboard-text]');
        if (el) {
            const clip = el.getAttribute('data-clipboard-text');
            if (clip && clip.trim()) return clip.trim();
            const txt = el.innerText || el.textContent;
            if (txt && txt.trim()) return txt.trim();
        }
        const boxCopy = document.querySelector('.box-copy');
        if (boxCopy) {
            const txt = boxCopy.innerText || boxCopy.textContent;
            if (txt) {
                const cleaned = txt.replace(/từ khóa\s*:?/i, '').trim();
                if (cleaned) return cleaned;
            }
        }
        return "Không có từ khóa";
    }

    // 5. Kiểm tra ảnh có phải là ảnh minh họa chung / thanh search hay không
    function isGenericIllustration(url) {
        if (!url) return true;
        const lower = url.toLowerCase();
        return lower.includes('tim-kiem') ||
               lower.includes('search') ||
               lower.includes('laymabutton') ||
               lower.includes('logo') ||
               lower.includes('icon') ||
               lower.includes('video') ||
               lower.includes('close') ||
               lower.includes('play') ||
               lower.includes('avatar') ||
               lower.endsWith('.svg');
    }

    // 6. Trích xuất link ảnh hướng dẫn THỰC SỰ
    function extractTaskImage() {
        // A. Ưu tiên #hinh_nv nếu có src và không phải ảnh thanh search
        const hinhNv = document.querySelector('#hinh_nv');
        if (hinhNv) {
            const src = hinhNv.currentSrc || hinhNv.src || hinhNv.getAttribute('data-src') || hinhNv.getAttribute('data-lazy-src') || '';
            if (src && !isGenericIllustration(src)) return src;
        }

        // B. Tìm các ảnh trong thư mục posts/ hoặc Screenshot_
        const postImgs = document.querySelectorAll('img[src*="/media/images/posts/"], img[src*="Screenshot_"], img[src*="sun"]');
        for (const img of postImgs) {
            const src = img.currentSrc || img.src || img.getAttribute('data-src') || '';
            if (src && !isGenericIllustration(src)) return src;
        }

        // C. Quét toàn bộ ảnh trong .box-step-wrap hoặc .box-form-wrap, bỏ qua các ảnh thanh search / logo
        const allImgs = document.querySelectorAll('.box-step-wrap img, .box-form-wrap img, img.img-fluid');
        for (const img of allImgs) {
            const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
            if (src && !isGenericIllustration(src)) {
                return src;
            }
        }
        return "";
    }

    // 7. Nhận diện Link Quest từ Ảnh, DB, Từ khóa hoặc DOM
    function detectQuestUrl() {
        const imgSrc = extractTaskImage();
        const keyword = extractKeyword().toLowerCase().trim();

        // A. Kiểm tra trong manual cache đã lưu
        const manualMap = getSavedManualMap();
        if (imgSrc && manualMap[imgSrc]) {
            return { url: manualMap[imgSrc], method: 'SAVED_CACHE', imgSrc: imgSrc };
        }

        // B. Kiểm tra trong liveImageMap (tất cả ảnh và hash)
        if (imgSrc) {
            const cleanSrc = imgSrc.split('?')[0];
            const filename = cleanSrc.substring(cleanSrc.lastIndexOf('/') + 1);

            for (const key in liveImageMap) {
                const cleanKey = key.split('?')[0];
                const keyFilename = cleanKey.substring(cleanKey.lastIndexOf('/') + 1);
                if (cleanSrc.includes(cleanKey) || cleanKey.includes(cleanSrc) || (filename && keyFilename && (filename === keyFilename || filename.includes(keyFilename) || keyFilename.includes(filename)))) {
                    return { url: liveImageMap[key], method: 'IMAGE_MAP', imgSrc: imgSrc };
                }
            }
        }

        // C. TỰ ĐỘNG BỎ QUA BẰNG TỪ KHÓA (Persistent All-in-One auto-bypass)
        if (keyword && keyword !== "không có từ khóa") {
            for (const kwKey in KEYWORD_AUTO_MAP) {
                if (keyword.includes(kwKey) || kwKey.includes(keyword)) {
                    console.log(`[Duyzoz Engine] Tự động giải mã Quest qua Từ khóa (${keyword}) -> ${KEYWORD_AUTO_MAP[kwKey]}`);
                    return { url: KEYWORD_AUTO_MAP[kwKey], method: 'KEYWORD_AUTO_MAP', imgSrc: imgSrc };
                }
            }
        }

        // D. Tìm trong linkWeb hoặc các thẻ text
        const linkEl = document.querySelector('#linkWeb, #TK1, #TK2');
        if (linkEl && linkEl.innerText) {
            let txt = linkEl.innerText.trim();
            if (txt.startsWith('http')) return { url: txt, method: 'DOM_LINK', imgSrc: imgSrc };
            if (txt.includes('.')) return { url: 'https://' + txt, method: 'DOM_LINK', imgSrc: imgSrc };
        }

        return { url: null, method: 'UNRESOLVED', imgSrc: imgSrc };
    }

    // 8. Kiểm tra Blacklist
    function isUrlBlacklisted(url) {
        if (!url) return false;
        try {
            const host = new URL(url).hostname.toLowerCase();
            for (const b of liveBlacklist) {
                if (host.includes(b.toLowerCase())) return true;
            }
        } catch (e) {
            for (const b of liveBlacklist) {
                if (url.includes(b)) return true;
            }
        }
        return false;
    }

    // 9. Nhấp đổi nhiệm vụ & Tự động Xác nhận Modal (Khắc phục rate-limit và vòng lặp treo)
    let lastChangeTime = 0;
    function triggerChangeTask(reason) {
        const now = Date.now();
        if (now - lastChangeTime < 3000) {
            console.warn("[Duyzoz Engine] Đang chờ cooldown đổi nhiệm vụ...");
            return;
        }
        lastChangeTime = now;
        console.warn("[Duyzoz Engine] Thực hiện đổi nhiệm vụ vì:", reason);

        // Gọi trực tiếp API native nếu có
        if (typeof pageWin.executeChangeMission === 'function') {
            try {
                pageWin.executeChangeMission();
                return;
            } catch(e) {}
        }

        // Nhấp nút đổi nhiệm vụ gốc
        const btn = document.querySelector('#btn-baoloi, a#btn-baoloi, button.btn-danger, button[onclick*="baoloi"]');
        if (btn) {
            btn.click();
        }

        // Tự động nhấn "Xác nhận" trên Modal Đổi Nhiệm Vụ ngay lập tức
        autoConfirmTaskModal();
    }

    function autoConfirmTaskModal() {
        const clickConfirm = () => {
            const confirmBtn = document.querySelector('#btnXacNhanDoiNhiemVu, #modalNhiemVu button.btn-primary, .modal button.btn-warning, button[onclick*="doiNhiemVu"]');
            if (confirmBtn) {
                confirmBtn.click();
                return true;
            }
            return false;
        };

        if (!clickConfirm()) {
            setTimeout(clickConfirm, 100);
            setTimeout(clickConfirm, 300);
            setTimeout(clickConfirm, 700);
        }
    }

    // Tự động đóng modal thông báo lỗi hoặc rate limit của Layma để không che màn hình
    setInterval(() => {
        const modalNv = document.getElementById('modalNhiemVu');
        if (modalNv && modalNv.style.display !== 'none' && modalNv.style.display !== '') {
            autoConfirmTaskModal();
        }

        const thongBao = document.getElementById('modalThongbao');
        if (thongBao && thongBao.style.display !== 'none' && thongBao.style.display !== '') {
            const btnClose = document.getElementById('btnDongThongBao') || thongBao.querySelector('button, .close');
            if (btnClose) btnClose.click();
            thongBao.style.display = 'none';
        }
    }, 400);

    // 10. Khởi tạo Giao diện Đè trực tiếp
    function initLayMaNativeUI() {
        const isLayma = window.location.hostname.includes('layma') || !!document.querySelector('.box-step-wrap, #hinh_nv, #qcaptcha-checkcode');
        if (!isLayma) return;

        const wrap = document.querySelector('.box-step-wrap') || document.querySelector('.box-form-wrap') || document.body;
        if (!wrap || document.getElementById('native-override-top-header')) return;

        console.log("[Duyzoz Engine] Đang gắn giao diện Made by Duyzoz đè trực tiếp lên LayMa.net...");
        injectLaymaCleanStyles();

        // Ẩn tất cả con cũ trong wrap
        Array.from(wrap.children).forEach(ch => {
            if (!ch.id.startsWith('native-override-') && !ch.classList.contains('box-form')) {
                ch.style.display = 'none';
            }
        });

        // A. Header Shimmer
        const topHeader = document.createElement('div');
        topHeader.id = 'native-override-top-header';
        topHeader.className = 'fancy-top-header';
        topHeader.innerHTML = `
            <span class="vnbypass-title">Made by Duyzoz ✦</span>
            <a class="vnbypass-discord" href="https://github.com/duyzoz/BYPASS-ALL-IN-ONE" target="_blank" rel="noopener noreferrer">Tham gia Discord</a>
            <div class="vnbypass-intro">Cộng Đồng Chia Sẻ Và Hỗ Trợ Nhanh. Tool Bypass Link VN Siêu Nhanh</div>
        `;
        wrap.insertBefore(topHeader, wrap.firstChild);

        // B. Cài đặt Bypass
        const autoChange = getSetting('auto_change', false);
        const blacklistAutoChange = getSetting('blacklist_auto_change', true);
        const autoOpen = getSetting('auto_open', true);
        const autoSave = getSetting('auto_save', false);
        const waitTime = getSetting('wait_time', 85);

        const settingsBox = document.createElement('div');
        settingsBox.id = 'native-override-settings';
        settingsBox.style.cssText = `
            margin-bottom: 16px; padding: 14px; background: rgb(255, 251, 235);
            border: 1px solid rgb(253, 230, 138); border-radius: 8px; text-align: left;
            font-size: 14px; line-height: 1.6; display: flex; flex-direction: column; gap: 10px;
        `;
        settingsBox.innerHTML = `
            <div style="font-weight: bold; color: #d97706; margin-bottom: 4px;">Cài đặt Bypass</div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <label style="cursor: pointer; margin: 0; color: #92400e; font-weight: 600;">Đổi NV khi lỗi:</label>
                <label class="switch"><input type="checkbox" id="toggle-auto-change" ${autoChange ? 'checked' : ''}><span class="slider"></span></label>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <label style="cursor: pointer; margin: 0; color: #92400e; font-weight: 600;">Đổi NV blacklist:</label>
                <label class="switch"><input type="checkbox" id="toggle-blacklist-auto-change" ${blacklistAutoChange ? 'checked' : ''}><span class="slider"></span></label>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <label style="cursor: pointer; margin: 0; color: #92400e; font-weight: 600;">Mở link tự động:</label>
                <label class="switch"><input type="checkbox" id="toggle-auto-open-link" ${autoOpen ? 'checked' : ''}><span class="slider"></span></label>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <label style="cursor: pointer; margin: 0; color: #92400e; font-weight: 600;">Lưu link đã nhập:</label>
                <label class="switch"><input type="checkbox" id="toggle-auto-save-manual-link" ${autoSave ? 'checked' : ''}><span class="slider"></span></label>
            </div>
            <button type="button" id="show-manual-link-cache" style="border:0; padding:0; background:transparent; color:#b45309; cursor:pointer; text-align:left; font-size:11px; text-decoration:underline;">Xem link nhiệm vụ đã lưu</button>
            <button type="button" id="show-blacklist-list" style="border:0; padding:0; background:transparent; color:#b45309; cursor:pointer; text-align:left; font-size:11px; text-decoration:underline;">Xem nhiệm vụ bị blacklist tại đây</button>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; flex-direction: column;">
                    <label for="input-wait-time" style="margin: 0; color: #92400e; font-weight: 600;">Thời gian chờ (giây):</label>
                    <span style="font-size: 11px; color: #b45309; font-style: italic;">(Khuyên dùng &gt;70s để tránh bị cấm)</span>
                </div>
                <input type="number" id="input-wait-time" value="${waitTime}" style="width: 65px; padding: 4px; border: 1px solid #d97706; border-radius: 4px; text-align: center; margin-left: 10px; font-weight: bold; color: #92400e;">
            </div>
        `;
        topHeader.after(settingsBox);

        // Gắn sự kiện lưu settings
        document.getElementById('toggle-auto-change').onchange = (e) => setSetting('auto_change', e.target.checked);
        document.getElementById('toggle-blacklist-auto-change').onchange = (e) => setSetting('blacklist_auto_change', e.target.checked);
        document.getElementById('toggle-auto-open-link').onchange = (e) => setSetting('auto_open', e.target.checked);
        document.getElementById('toggle-auto-save-manual-link').onchange = (e) => setSetting('auto_save', e.target.checked);
        document.getElementById('input-wait-time').onchange = (e) => setSetting('wait_time', parseInt(e.target.value) || 85);
        document.getElementById('show-blacklist-list').onclick = () => alert("Danh sách Blacklist:\n" + liveBlacklist.join("\n"));
        document.getElementById('show-manual-link-cache').onclick = () => {
            const map = getSavedManualMap();
            const keys = Object.keys(map);
            if (keys.length === 0) {
                alert("Chưa có link nhiệm vụ thủ công nào được lưu.");
            } else {
                alert(`Đã lưu ${keys.length} nhiệm vụ:\n` + keys.map(k => `${k} -> ${map[k]}`).join("\n\n"));
            }
        };

        // C. Quest Info Box
        const questInfoBox = document.createElement('div');
        questInfoBox.id = 'native-override-quest-info';
        questInfoBox.style.cssText = `
            margin-bottom: 16px; padding: 14px; background: rgb(248, 250, 252);
            border: 1px solid rgb(226, 232, 240); border-radius: 8px; text-align: left;
            font-size: 14px; line-height: 1.6;
        `;
        settingsBox.after(questInfoBox);

        // D. Captcha Box
        const captchaBox = document.createElement('div');
        captchaBox.id = 'native-override-captcha-box';
        captchaBox.style.cssText = `
            margin: 12px 0px; padding: 14px; background: rgb(248, 250, 252);
            border: 1px solid rgb(219, 234, 254); border-radius: 8px; min-height: 60px; text-align: center;
        `;
        questInfoBox.after(captchaBox);

        // Tiến hành giải mã và chạy Bypass
        executeLaymaBypass();
    }

    // 11. Thực thi toàn bộ chu trình Bypass LayMa
    function executeLaymaBypass() {
        const questInfoBox = document.getElementById('native-override-quest-info');
        const captchaBox = document.getElementById('native-override-captcha-box');
        if (!questInfoBox || !captchaBox) return;

        const detected = detectQuestUrl();
        const autoChangeOnError = getSetting('auto_change', false);
        const autoChangeBlacklist = getSetting('blacklist_auto_change', true);
        const imgSrc = detected.imgSrc || extractTaskImage();
        const keyword = extractKeyword();

        // TRƯỜNG HỢP 1: Không tìm thấy link nhiệm vụ tự động -> Cho phép dán BẤT KỲ tên miền nào
        if (!detected || !detected.url) {
            console.warn("[Duyzoz Engine] Không tìm thấy link nhiệm vụ tự động, hiển thị form nhập thủ công.");

            // Nếu bật "Đổi NV khi lỗi" -> Tự động đổi nhiệm vụ
            if (autoChangeOnError) {
                captchaBox.style.display = 'block';
                captchaBox.innerHTML = "<div style='color:#dc2626; font-weight:bold;'>Không nhận diện được ảnh! Đang tự động đổi nhiệm vụ...</div>";
                setTimeout(() => triggerChangeTask("Không tìm thấy ảnh trong DB"), 1500);
                return;
            }

            // Nếu tắt "Đổi NV khi lỗi" -> Hiển thị Giao diện Hình 2 chuẩn 100% của base projectscript112247
            captchaBox.style.display = 'none';

            questInfoBox.innerHTML = `
                <div style="background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; padding:10px 14px; border-radius:6px; margin-bottom:12px;">
                    <b>Không lấy được link Quest tự động!</b><br>
                    <span style="font-size:12px; color:#c2410c;">Bạn có thể nhập thông tin nhiệm vụ thủ công để tiếp tục.</span>
                </div>

                <label for="manual-quest-image" style="display:block; font-weight:bold; margin-bottom:4px; font-size:13px; color:#334155;">Link ảnh hướng dẫn</label>
                <input id="manual-quest-image" type="url" value="${imgSrc}" placeholder="https://..." autocomplete="off" readonly style="width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:10px; background:#f1f5f9; color:#64748b; cursor:not-allowed; font-size:13px;">

                ${imgSrc ? `<img id="manual-quest-image-preview" src="${imgSrc}" alt="Ảnh hướng dẫn quest" style="display:block; max-width:100%; max-height:180px; object-fit:contain; margin:0 auto 12px; border:1px solid #e2e8f0; border-radius:6px;">` : ''}

                <label for="manual-quest-keyword" style="display:block; font-weight:bold; margin-bottom:4px; font-size:13px; color:#334155;">Từ khóa</label>
                <input id="manual-quest-keyword" type="text" value="${keyword}" readonly autocomplete="off" style="width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:12px; background:#f1f5f9; color:#64748b; cursor:not-allowed; font-size:13px;">

                <label for="manual-quest-link" style="display:block; font-weight:bold; margin-bottom:4px; font-size:13px; color:#334155;">Link Quest thủ công</label>
                <input id="manual-quest-link" type="text" placeholder="https://..." autocomplete="off" style="width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:12px; font-size:13px;">

                <button type="button" id="btn-manual-quest" style="width:100%; font-weight:bold; background:#eab308; color:#ffffff; padding:10px; border:none; border-radius:6px; cursor:pointer; font-size:14px; box-shadow:0 2px 6px rgba(234,179,8,0.3);">Tiếp tục với link này</button>
                <button type="button" id="btn-manual-change-quest" style="width:100%; margin-top:10px; font-weight:bold; background:#dc2626; color:#ffffff; padding:10px; border:none; border-radius:6px; cursor:pointer; font-size:14px;">Đổi nhiệm vụ</button>
            `;

            // Xử lý nút Tiếp tục với link này - CHẤP NHẬN TẤT CẢ TÊN MIỀN
            document.getElementById('btn-manual-quest').onclick = () => {
                const linkInput = document.getElementById('manual-quest-link');
                let customUrl = linkInput.value.trim();

                if (!customUrl) {
                    alert("Vui lòng nhập Link Quest thủ công để tiếp tục!");
                    return;
                }

                if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
                    customUrl = 'https://' + customUrl;
                    linkInput.value = customUrl;
                }

                // Nếu bật lưu link đã nhập
                if (getSetting('auto_save', false) && imgSrc) {
                    saveManualMap(imgSrc, customUrl);
                    console.log("[Duyzoz Engine] Đã lưu link nhiệm vụ vào cache:", imgSrc, "->", customUrl);
                }

                // Chạy luồng bypass với link đã nhập
                startCampaignFlow(customUrl);
            };

            // Xử lý nút Đổi nhiệm vụ
            document.getElementById('btn-manual-change-quest').onclick = () => {
                triggerChangeTask("Người dùng bấm Đổi nhiệm vụ từ Form hướng dẫn");
            };

            return;
        }

        const questUrl = detected.url;

        // TRƯỜNG HỢP 2: Nhiệm vụ nằm trong blacklist
        if (isUrlBlacklisted(questUrl)) {
            console.warn("[Duyzoz Engine] Nhiệm vụ nằm trong Blacklist:", questUrl);
            if (autoChangeBlacklist) {
                captchaBox.style.display = 'block';
                captchaBox.innerHTML = `<div style='color:#dc2626; font-weight:bold;'>Phát hiện nhiệm vụ Blacklist (${questUrl})! Đang tự động đổi...</div>`;
                setTimeout(() => triggerChangeTask("Nhiệm vụ Blacklist"), 1500);
                return;
            }
        }

        // TRƯỜNG HỢP 3: Nhiệm vụ hợp lệ -> Bắt đầu luồng bypass tự động
        startCampaignFlow(questUrl);
    }

    // 12. Luồng Campaign & Kết nối API ngầm (Đảm bảo chạy thành công cho TẤT CẢ tên miền)
    function startCampaignFlow(questUrl) {
        const questInfoBox = document.getElementById('native-override-quest-info');
        const captchaBox = document.getElementById('native-override-captcha-box');
        if (!questInfoBox || !captchaBox) return;

        captchaBox.style.display = 'block';

        const bodyTxt = document.body ? document.body.innerText : "";
        const platform = (bodyTxt.includes('truy cập Google.com') || bodyTxt.includes('Gõ từ khóa')) ? "GOOGLE" : "TRUCTIEP";

        questInfoBox.innerHTML = `
            <div><b>Link Quest:</b> <a href="${questUrl}" target="_blank" style="color:#0284c7; word-break:break-all;">${questUrl}</a></div>
            <div style="margin-top:4px;"><b>Platform:</b> <span style="color:#d97706; font-weight:bold; text-transform:uppercase;">${platform}</span></div>
        `;

        captchaBox.innerHTML = "<div style='color:#0284c7; font-weight:bold;'>Đang lấy thông tin Traffic Key...</div>";

        function connectCampaignWithToken(keyToken) {
            console.log("[Duyzoz Engine] Khởi tạo session với KeyToken:", keyToken);

            GM_xmlhttpRequest({
                method: "POST",
                url: "https://api.layma.net/api/traffic/session",
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ keyToken: keyToken }),
                onload: (sRes) => {
                    let sessionToken = "";
                    try {
                        const sj = JSON.parse(sRes.responseText);
                        sessionToken = sj.sessionToken || sj.SessionToken;
                    } catch (e) {}

                    const platParam = platform === "GOOGLE" ? "google" : "tructiep";
                    const campUrl = `https://api.layma.net/api/admin/campain?keytoken=${keyToken}&flatform=${platParam}&waitMode=1&requiredPageVisits=1`;

                    GM_xmlhttpRequest({
                        method: "GET",
                        url: campUrl,
                        headers: {
                            'X-Traffic-Session': sessionToken,
                            'Origin': questUrl,
                            'Referer': questUrl
                        },
                        onload: (cRes) => {
                            let trafficId = "";
                            let serverWait = parseInt(document.getElementById('input-wait-time')?.value) || 85;
                            try {
                                const cj = JSON.parse(cRes.responseText);
                                trafficId = cj.id;
                                if (cj.requiredWaitSeconds) serverWait = Math.max(serverWait, cj.requiredWaitSeconds);
                            } catch (e) {}

                            if (!trafficId) {
                                console.warn("[Duyzoz Engine] Campaign ID null/invalid, triggering fail-fast!");
                                showFailAndRetry("❌ Khởi tạo chiến dịch thất bại trên máy chủ LayMa. Vui lòng đổi nhiệm vụ!");
                                return;
                            }

                            // BẮT ĐẦU ĐẾM NGƯỢC THẬT SỰ
                            runCountdown(serverWait, keyToken, sessionToken, trafficId, questUrl);
                        },
                        onerror: () => {
                            showFailAndRetry("❌ Khởi tạo chiến dịch thất bại trên máy chủ LayMa. Vui lòng đổi nhiệm vụ!");
                        }
                    });
                },
                onerror: () => {
                    showFailAndRetry("Không thể kết nối Traffic Session!");
                }
            });
        }

        // Trích xuất KeyToken: Ưu tiên thẻ #tokenId trên DOM của LayMa trước
        let keyToken = document.getElementById('tokenId')?.innerText?.trim() || "";
        if (!keyToken) {
            const path = window.location.pathname.replace(/^\//, '').trim();
            if (path && path.length >= 5 && !path.includes('/')) {
                keyToken = path;
            }
        }

        if (keyToken) {
            console.log("[Duyzoz Engine] Tìm thấy KeyToken trực tiếp từ LayMa DOM/Path:", keyToken);
            connectCampaignWithToken(keyToken);
        } else {
            // Gửi GET lấy traffic key từ trang đích nếu chưa có trong DOM
            GM_xmlhttpRequest({
                method: "GET",
                url: questUrl,
                headers: {
                    'User-Agent': navigator.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                onload: (res) => {
                    const html = res.responseText || "";
                    const m = html.match(/Traffic\/Index\/([a-zA-Z0-9_-]+)/i) || 
                              html.match(/keytoken=([a-zA-Z0-9_-]+)/i) ||
                              html.match(/layma\.net\/Traffic\/Index\/([a-zA-Z0-9_-]+)/i);

                    if (m) keyToken = m[1];
                    if (!keyToken) {
                        console.warn("[Duyzoz Engine] Không tìm thấy key token trên trang web đích.");
                        showFailAndRetry("❌ Nhiệm vụ trên LayMa đã hết hạn hoặc không khả dụng. Vui lòng bấm Đổi nhiệm vụ!");
                        return;
                    }
                    connectCampaignWithToken(keyToken);
                },
                onerror: () => {
                    showFailAndRetry("❌ Không thể tải trang web đích. Vui lòng kiểm tra mạng hoặc Đổi nhiệm vụ!");
                }
            });
        }
    }

    function showFailAndRetry(msg) {
        const captchaBox = document.getElementById('native-override-captcha-box');
        if (!captchaBox) return;
        captchaBox.style.display = 'block';
        captchaBox.innerHTML = `
            <div style='background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:12px; border-radius:8px; text-align:left; font-weight:bold; margin-bottom:10px;'>
                ${msg}
            </div>
            <div style='display:flex; gap:10px; width:100%;'>
                <button type='button' id='btn-native-retry' style='flex:1; padding:8px; background:#f59e0b; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer;'>Thử lại</button>
                <button type='button' id='btn-native-change' style='flex:1; padding:8px; background:#ef4444; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer;'>Đổi nhiệm vụ</button>
            </div>
        `;
        document.getElementById('btn-native-retry').onclick = () => executeLaymaBypass();
        document.getElementById('btn-native-change').onclick = () => triggerChangeTask("Người dùng bấm Đổi NV");
    }

    // 13. Đếm ngược thật
    function runCountdown(totalSeconds, keyToken, sessionToken, trafficId, questUrl) {
        const captchaBox = document.getElementById('native-override-captcha-box');
        if (!captchaBox) return;

        let left = totalSeconds;
        captchaBox.style.display = 'block';
        captchaBox.innerHTML = `
            <div style="font-size: 13px; font-weight: 700; color: #0284c7; letter-spacing: 0.05em; margin-bottom: 4px;">ĐANG ĐẾM NGƯỢC</div>
            <div style="font-size: 42px; font-weight: 800; color: #0284c7; font-variant-numeric: tabular-nums;" id="dz-countdown-timer">${left}s</div>
            <div class="dz-progress-track">
                <div class="dz-progress-bar" id="dz-countdown-bar" style="width: 0%;"></div>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Đang giữ session hợp lệ, vui lòng đợi hết thời gian để nhận mã...</div>
        `;

        const timerDisplay = document.getElementById('dz-countdown-timer');
        const progressBar = document.getElementById('dz-countdown-bar');

        const interval = setInterval(() => {
            left--;
            if (timerDisplay) timerDisplay.innerText = left + 's';
            if (progressBar) {
                const pct = ((totalSeconds - left) / totalSeconds) * 100;
                progressBar.style.width = pct + '%';
            }

            if (left <= 0) {
                clearInterval(interval);
                step1LoadQCaptcha(keyToken, sessionToken, trafficId, questUrl);
            }
        }, 1000);
    }

    // 14. Bước 1: Render QCaptcha & Lắng nghe xác thực đa tầng (Watcher + Callback + Nút bấm)
    async function step1LoadQCaptcha(keyToken, sessionToken, trafficId, questUrl) {
        const captchaBox = document.getElementById('native-override-captcha-box');
        if (!captchaBox) return;

        captchaBox.style.display = 'block';
        captchaBox.innerHTML = `
            <div style="font-size: 14px; font-weight: bold; color: #7c3aed; margin-bottom: 6px;">🛡️ Xác minh bảo mật - QCAPTCHA</div>
            <div style="font-size: 12px; color: #6b21a8; margin-bottom: 12px;">Vui lòng hoàn thành QCaptcha bên dưới để tự động lấy mã và vượt link:</div>
            <div id="qcaptcha-native-container" style="display: flex; justify-content: center; min-height: 78px;">
                <div style="color: #7c3aed; font-size: 13px;">Đang nạp QCaptcha...</div>
            </div>
            <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
                <button type="button" id="dz-btn-proceed-captcha" style="width: 100%; padding: 10px; background: #10b981; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 6px rgba(16,185,129,0.3); display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <span>✅ Xác nhận & Tiếp tục Vượt Link ➜</span>
                </button>
                <div style="font-size: 11px; color: #64748b; text-align: center;">Hệ thống sẽ tự động chuyển tiếp ngay khi có tích xanh [✔]. Nếu chưa tự nhảy, bấm nút trên.</div>
            </div>
        `;

        const api = await loadQCaptchaSdk();
        const sitekey = getQCaptchaSiteKey();

        if (api && typeof api.render === 'function') {
            const container = document.getElementById('qcaptcha-native-container');
            container.innerHTML = "";
            let solved = false;
            let widgetId = null;
            let pollInterval = null;

            const onCaptchaSuccess = (token) => {
                if (solved || !token) return;
                solved = true;
                if (pollInterval) clearInterval(pollInterval);
                console.log("[Duyzoz Engine] Đã bắt được token QCaptcha thành công:", token.substring(0, 30) + "...");

                // Đồng bộ token sang LayMa
                pageWin.qCaptchaTokenValue = token;
                try {
                    const laymaContainer = document.getElementById('qcaptcha-checkcode');
                    if (laymaContainer) {
                        const tas = laymaContainer.querySelectorAll('textarea, input');
                        tas.forEach(t => t.value = token);
                    }
                } catch(e) {}

                // Thực thi lấy mã và submit LayMa
                processCaptchaSolvedAndSubmit(token, sessionToken, trafficId, questUrl);
            };

            // Hàm trích xuất token từ mọi nguồn khả dĩ
            const extractTokenNow = () => {
                let token = "";
                // 1. Từ api.getResponse(widgetId)
                try {
                    if (api && typeof api.getResponse === 'function' && widgetId !== null) {
                        token = api.getResponse(widgetId);
                    }
                } catch(e) {}
                if (token && token.length > 20) return token;

                // 2. Từ window.hcaptcha / window.qcaptcha
                const getWinApi = () => pageWin.hcaptcha || pageWin.qcaptcha || window.hcaptcha || window.qcaptcha;
                const winApi = getWinApi();
                if (winApi && typeof winApi.getResponse === 'function' && widgetId !== null) {
                    try { token = winApi.getResponse(widgetId); } catch(e) {}
                }
                if (token && token.length > 20) return token;

                // 3. Từ textarea / input trong container
                if (container) {
                    const tas = container.querySelectorAll('textarea[name*="response"], textarea[name*="captcha"], input[type="hidden"]');
                    for (const ta of tas) {
                        if (ta.value && ta.value.length > 20) return ta.value;
                    }
                }

                // 4. Từ pageWin.qCaptchaTokenValue
                if (pageWin.qCaptchaTokenValue && pageWin.qCaptchaTokenValue.length > 20) {
                    return pageWin.qCaptchaTokenValue;
                }

                return "";
            };

            // Gắn callback vào window để tránh rào cản sandbox Tampermonkey
            pageWin.__dz_captcha_callback = function(tok) {
                onCaptchaSuccess(tok);
            };

            try {
                widgetId = api.render(container, {
                    sitekey: sitekey,
                    callback: function(tok) {
                        onCaptchaSuccess(tok);
                    },
                    'expired-callback': function() {
                        solved = false;
                    },
                    'error-callback': function() {
                        solved = false;
                    }
                });
            } catch(e) {
                console.error("[Duyzoz Engine] Lỗi khi render QCaptcha:", e);
            }

            // Polling Watcher: Kiểm tra mỗi 200ms
            pollInterval = setInterval(() => {
                if (solved) {
                    clearInterval(pollInterval);
                    return;
                }
                const found = extractTokenNow();
                if (found) {
                    onCaptchaSuccess(found);
                }
            }, 200);

            // Nút bấm xác nhận thủ công
            const proceedBtn = document.getElementById('dz-btn-proceed-captcha');
            if (proceedBtn) {
                proceedBtn.onclick = () => {
                    const manualTok = extractTokenNow();
                    if (manualTok) {
                        onCaptchaSuccess(manualTok);
                    } else {
                        alert("Vui lòng hoàn thành xác minh QCaptcha trước khi tiếp tục!");
                    }
                };
            }

        } else {
            showCaptchaErrorUI(keyToken, sessionToken, trafficId, questUrl);
        }
    }

    function showCaptchaErrorUI(keyToken, sessionToken, trafficId, questUrl) {
        const captchaBox = document.getElementById('native-override-captcha-box');
        if (!captchaBox) return;
        captchaBox.innerHTML = `
            <div style="color:#dc2626; font-weight:bold; margin-bottom:10px;">Không thể tải thư viện QCaptcha do mạng hoặc máy chủ.</div>
            <div style="display:flex; gap:10px;">
                <button type="button" id="btn-retry-qcaptcha" style="flex:1; padding:8px; background:#f59e0b; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">Thử tải lại QCaptcha</button>
                <button type="button" id="btn-reload-page" style="flex:1; padding:8px; background:#ef4444; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">Tải lại trang</button>
            </div>
        `;
        document.getElementById('btn-retry-qcaptcha').onclick = () => step1LoadQCaptcha(keyToken, sessionToken, trafficId, questUrl);
        document.getElementById('btn-reload-page').onclick = () => window.location.reload();
    }

    // 15. Nhận token -> Lấy mã -> Điền form LayMa -> Tự động submit -> Bắt link đích
    function processCaptchaSolvedAndSubmit(qCaptchaToken, sessionToken, trafficId, questUrl) {
        const captchaBox = document.getElementById('native-override-captcha-box');
        if (captchaBox) {
            captchaBox.style.display = 'block';
            captchaBox.innerHTML = `
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; text-align: center;">
                    <div style="font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 6px;">⚡ ĐANG LẤY MÃ TỪ SERVER...</div>
                    <div style="font-size: 12px; color: #3b82f6;">Đã xác minh QCaptcha! Đang tải mã xác thực và nộp vào LayMa...</div>
                </div>
            `;
        }

        // Hook window.open trên pageWin để bắt ngay link chuyển hướng đích của LayMa
        hookLaymaRedirection();

        // Hàm hoàn tất khi nhận được mã
        const handleReceivedCode = (codeReceived) => {
            console.log("[Duyzoz Engine] Đã nhận mã thành công:", codeReceived);
            try { GM_setClipboard(codeReceived); } catch (e) {}

            // Điền mã vào TẤT CẢ các input code của Layma
            const codeInputs = document.querySelectorAll('#codeInput, #qcaptcha-checkcode, input[name="code"], input[type="text"]');
            codeInputs.forEach(inp => {
                inp.value = codeReceived;
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                inp.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // Đồng bộ token cho LayMa
            pageWin.qCaptchaTokenValue = qCaptchaToken;

            // Hiển thị giao diện nộp mã & kết quả
            if (captchaBox) {
                captchaBox.innerHTML = `
                    <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 14px; margin-bottom: 12px; text-align: center;">
                        <div style="font-size: 13px; font-weight: bold; color: #1e40af;">🎉 ĐÃ LẤY MÃ THÀNH CÔNG</div>
                        <div style="font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: 0.12em; margin: 6px 0;">${codeReceived}</div>
                        <div style="font-size: 11px; color: #64748b;">(Đã tự động sao chép mã và điền vào hệ thống LayMa)</div>
                    </div>
                    <div id="dz-submit-status" style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 10px;">
                        <div style="font-size: 14px; font-weight: bold; color: #16a34a;">🚀 ĐANG TỰ ĐỘNG NỘP MÃ VÀO LAYMA...</div>
                        <div style="font-size: 12px; color: #15803d; margin-top: 4px;">Vui lòng đợi LayMa phản hồi link đích...</div>
                    </div>
                    <button type="button" id="dz-btn-force-submit" style="width: 100%; padding: 10px; background: #2563eb; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        Bấm đây nếu LayMa chưa tự chuyển hướng ➜
                    </button>
                `;

                const forceBtn = document.getElementById('dz-btn-force-submit');
                if (forceBtn) {
                    forceBtn.onclick = () => triggerLaymaSubmit(qCaptchaToken);
                }
            }

            // Tự động gọi nộp mã LayMa sau 500ms
            setTimeout(() => {
                triggerLaymaSubmit(qCaptchaToken);
            }, 500);
        };

        // Gửi POST lấy mã tới /api/traffic/getcode
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
                qCaptchaToken: qCaptchaToken
            }),
            onload: (res) => {
                let codeReceived = "";
                try {
                    const json = JSON.parse(res.responseText);
                    const raw = json.html || json.code || json.data || "";
                    const m = raw.match(/[a-zA-Z0-9]{4,10}/);
                    if (m) codeReceived = m[0];
                    else if (raw) codeReceived = raw.trim();
                } catch (e) {}

                if (!codeReceived) {
                    // Thử fallback sang admin/codemanager/getcode
                    tryFallbackGetCode(trafficId, questUrl, qCaptchaToken, handleReceivedCode);
                } else {
                    handleReceivedCode(codeReceived);
                }
            },
            onerror: () => {
                tryFallbackGetCode(trafficId, questUrl, qCaptchaToken, handleReceivedCode);
            }
        });
    }

    function tryFallbackGetCode(trafficId, questUrl, qCaptchaToken, onSuccess) {
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
                browserMajorVersion: 120,
                cookies: true,
                mobile: false,
                os: 'Windows',
                osVersion: '10',
                screen: '1920 x 1080',
                referrer: questUrl,
                trafficid: trafficId,
                solution: '1'
            }),
            onload: (res) => {
                let codeReceived = "";
                try {
                    const json = JSON.parse(res.responseText);
                    const raw = json.html || json.code || "";
                    const m = raw.match(/[a-zA-Z0-9]{4,10}/);
                    if (m) codeReceived = m[0];
                } catch(e) {}
                if (!codeReceived) {
                    showFailAndRetry("❌ Không thể lấy mã từ máy chủ LayMa. Vui lòng thử lại hoặc đổi nhiệm vụ!");
                } else {
                    onSuccess(codeReceived);
                }
            },
            onerror: () => {
                showFailAndRetry("❌ Kết nối máy chủ lấy mã thất bại. Vui lòng thử lại!");
            }
        });
    }

    function triggerLaymaSubmit(token) {
        console.log("[Duyzoz Engine] Đang kích hoạt nộp mã LayMa...");
        pageWin.qCaptchaTokenValue = token;

        // 1. Nếu có hàm redeemCode native trên LayMa, gọi trực tiếp với token!
        if (typeof pageWin.redeemCode === 'function') {
            try {
                pageWin.redeemCode(null, token);
                return;
            } catch(e) {
                console.warn("[Duyzoz Engine] Lỗi khi gọi pageWin.redeemCode:", e);
            }
        }

        // 2. Nếu có submitCode, gọi submitCode
        if (typeof pageWin.submitCode === 'function') {
            try {
                pageWin.submitCode();
                return;
            } catch(e) {
                console.warn("[Duyzoz Engine] Lỗi khi gọi pageWin.submitCode:", e);
            }
        }

        // 3. Click nút Xác nhận của LayMa
        const submitBtn = document.querySelector('#btn-xac-nhan, button[onclick*="submitCode"], button.btn-primary');
        if (submitBtn) {
            submitBtn.click();
        }
    }

    let hasHookedRedirection = false;
    function hookLaymaRedirection() {
        if (hasHookedRedirection) return;
        hasHookedRedirection = true;

        // Hook window.open trên trang
        const origOpen = pageWin.open;
        pageWin.open = function(url, target, features) {
            if (url && typeof url === 'string' && (url.includes('http') || url.includes('/api/traffic/go/'))) {
                console.log("[Duyzoz Engine] Đã bắt được URL chuyển hướng từ window.open:", url);
                showFinalSuccessUI(url);
                if (getSetting('auto_open', true)) {
                    return origOpen.call(pageWin, url, target, features);
                }
                return null;
            }
            return origOpen.call(pageWin, url, target, features);
        };

        // Hook jQuery ajax nếu có trên trang để bắt kết quả checkcode
        try {
            if (pageWin.$ && pageWin.$.ajaxSetup) {
                pageWin.$(document).ajaxComplete(function(event, xhr, settings) {
                    if (settings && settings.url && settings.url.includes('/api/traffic/checkcode')) {
                        try {
                            const res = JSON.parse(xhr.responseText);
                            const destUrl = res.redirectUrl || res.RedirectUrl || (typeof res === 'string' ? res : '');
                            if (destUrl) {
                                console.log("[Duyzoz Engine] Bắt được URL từ checkcode ajax:", destUrl);
                                showFinalSuccessUI(destUrl);
                            }
                        } catch(e) {}
                    }
                });
            }
        } catch(e) {}

        // Theo dõi sự thay đổi của modal hoặc countRedirect
        const redirectObserver = new MutationObserver(() => {
            const redirectBtn = document.getElementById('redirect');
            if (redirectBtn && redirectBtn.getAttribute('href')) {
                showFinalSuccessUI(redirectBtn.getAttribute('href'));
            }
        });
        redirectObserver.observe(document.body || document.documentElement, { childList: true, subtree: true, attributes: true });
    }

    // 16. Bước cuối: Hoàn tất Bypass & Hiển thị Link đích
    function showFinalSuccessUI(destinationUrl) {
        const captchaBox = document.getElementById('native-override-captcha-box');
        if (!captchaBox) return;

        const targetUrl = destinationUrl || window.location.href;
        const autoOpen = getSetting('auto_open', true);

        captchaBox.style.display = 'block';
        captchaBox.innerHTML = `
            <div style="border: 1px solid #86efac; background: #f0fdf4; border-radius: 10px; padding: 18px; text-align: center; box-shadow: 0 4px 15px rgba(22, 163, 74, 0.15);">
                <div style="font-size: 20px; font-weight: 800; color: #16a34a; margin-bottom: 8px;">🎉 BYPASS THÀNH CÔNG!</div>
                <div style="font-size: 12px; color: #15803d; margin-bottom: 6px;">Đã vượt qua toàn bộ xác minh LayMa. Link đích:</div>
                <div style="background: white; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; font-size: 13px; word-break: break-all; color: #15803d; font-family: monospace; font-weight: bold; margin-bottom: 14px;" id="final-destination-link">${targetUrl}</div>
                <div style="display: flex; gap: 10px;">
                    <button type="button" id="dz-btn-copy-final" style="flex: 1; padding: 11px; background: #e11d48; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 6px rgba(225,29,72,0.3);">Copy Link</button>
                    <button type="button" id="dz-btn-open-final" style="flex: 1; padding: 11px; background: #16a34a; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 6px rgba(22,163,74,0.3);">Mở Link ➜</button>
                </div>
                ${autoOpen ? `<div style="font-size: 11px; color: #16a34a; margin-top: 8px;" id="dz-auto-redirect-msg">⏱️ Sẽ tự động chuyển hướng sau 2 giây...</div>` : ''}
            </div>
        `;

        const copyBtn = document.getElementById('dz-btn-copy-final');
        if (copyBtn) {
            copyBtn.onclick = () => {
                try { GM_setClipboard(targetUrl); } catch (e) {}
                alert("Đã sao chép liên kết đích vào bộ nhớ tạm!");
            };
        }

        const openBtn = document.getElementById('dz-btn-open-final');
        if (openBtn) {
            openBtn.onclick = () => {
                window.location.href = targetUrl;
            };
        }

        if (autoOpen && targetUrl && targetUrl !== window.location.href) {
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 2000);
        }
    }

    // 18. Khởi động Engine trên LayMa
    syncCloudConfig();

    const laymaInitInterval = setInterval(() => {
        const isLayma = window.location.hostname.includes('layma') || !!document.querySelector('.box-step-wrap, #hinh_nv, #qcaptcha-checkcode');
        if (isLayma) {
            if (document.querySelector('.box-step-wrap') || document.body) {
                initLayMaNativeUI();
            }
        }
    }, 250);

})();
