// ==UserScript==
// @name         Link4m Bypass — Remake (deobf + patches)
// @namespace    http://tampermonkey.net/
// @version      0.6.2
// @description  Remake tu ban deobf Link4m (n1ulls): giu 100% UI + luong goc, kem 3 patch v0.6 — _traffic_cid_ tu sinh/luu, kiem tra mat na Buoc 3 cho OCR, chi dien ma (khong tu nop, khong tu giai captcha)
// @author       n1ulls (Deobfuscated by Community) — Remake by Duyzoz
// @updateURL    https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/link4m-remake.user.js
// @downloadURL  https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/link4m-remake.user.js
// @match        https://link4m.net/*
// @match        https://link4m.com/*
// @match        https://*.link4m.net/*
// @match        https://*.link4m.com/*
// @match        https://link4m.org/*
// @match        https://*.link4m.org/*
// @match        https://link4m.app/*
// @match        https://*.link4m.app/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_info
// @connect      *
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // 1. CAU HINH HE THONG & DANH SACH TEN MIEN TLD TOAN CAU (178 TLDs)
    // =========================================================================
    const CONFIG = {
        storeUrl: "https://robuxvien.com/home",
        serverUrl: "https://discord.gg/rcRBbzTfqB",
        ocrSpaceApiKey: "helloworld",
        ocrSpaceEndpoint: "https://api.ocr.space/parse/image",
        tesseractCdn: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",
        defaultTimeout: 15000,
        reCaptchaTimeout: 300000 // 5 phut
    };

    const TLDS = [
        "com.vn", "net.vn", "edu.vn", "org.vn", "gov.vn", "info.vn", "pro.vn", "ac.vn", "health.vn", "name.vn",
        "co.uk", "org.uk", "com.au", "com.sg", "com.my", "com.ph", "co.jp", "co.kr", "co.id", "co.th", "com.br",
        "vn", "com", "net", "org", "io", "co", "me", "xyz", "app", "dev", "top", "site", "online", "store", "club",
        "pro", "tv", "cc", "gg", "asia", "biz", "us", "uk", "ca", "de", "jp", "kr", "sg", "id", "th", "my", "ph",
        "lat", "icu", "fun", "space", "tech", "website", "lol", "click", "link", "live", "news", "blog", "shop",
        "vip", "win", "work", "world", "zone", "ai", "to", "sh", "fm", "ly", "gl", "it", "es", "fr", "ru", "br",
        "in", "au", "nl", "se", "no", "pl", "cz", "ch", "at", "be", "dk", "fi", "gr", "hk", "tw", "nz", "za", "mx",
        "ar", "cl", "pe", "ve", "ua", "ro", "hu", "tr", "sa", "ae", "pk", "bd", "lk", "np", "mm", "kh", "la", "bn",
        "mobi", "name", "page", "life", "today", "cloud", "digital", "media", "network", "systems", "solutions",
        "services", "games", "game", "apk", "download"
    ];

    // =========================================================================
    // 2. CLIENT FINGERPRINT & ENVIRONMENT DETECTION (jscd)
    // =========================================================================
    const jscd = {
        screen: `${window.screen.width}x${window.screen.height}`,
        browser: '',
        browserVersion: '',
        browserMajorVersion: 0,
        mobile: false,
        os: '',
        osVersion: '',
        cookies: navigator.cookieEnabled,
        lang: navigator.language || navigator.userLanguage || ''
    };

    (function initJSCD() {
        const ua = navigator.userAgent;
        jscd.mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(ua);

        // Detect OS
        if (/Windows/.test(ua)) {
            if (/(Windows 10.0|Windows NT 10.0)/.test(ua)) jscd.os = 'Windows 10';
            else if (/(Windows 8.1|Windows NT 6.3)/.test(ua)) jscd.os = 'Windows 8.1';
            else if (/(Windows 8|Windows NT 6.2)/.test(ua)) jscd.os = 'Windows 8';
            else if (/(Windows 7|Windows NT 6.1)/.test(ua)) jscd.os = 'Windows 7';
            else if (/Windows NT 6.0/.test(ua)) jscd.os = 'Windows Vista';
            else if (/(Windows NT 5.1|Windows XP)/.test(ua)) jscd.os = 'Windows XP';
            else jscd.os = 'Windows';
        } else if (/Android/.test(ua)) {
            jscd.os = 'Android';
            const m = ua.match(/Android ([._\d]+)/);
            if (m) jscd.osVersion = m[1];
        } else if (/(iPhone|iPad|iPod)/.test(ua)) {
            jscd.os = 'iOS';
            const m = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
            if (m) jscd.osVersion = `${m[1]}.${m[2]}`;
        } else if (/Mac OS X/.test(ua)) {
            jscd.os = 'Mac OS X';
            const m = ua.match(/Mac OS X (10[._\d]+)/);
            if (m) jscd.osVersion = m[1];
        } else if (/(Linux|X11)/.test(ua)) {
            jscd.os = 'Linux';
        }

        // Detect Browser
        if (/OPR\/|Opera/.test(ua)) {
            jscd.browser = 'Opera';
        } else if (/Chrome/.test(ua) && !/Edge|Edg|OPR/.test(ua)) {
            jscd.browser = 'Chrome';
        } else if (/Firefox/.test(ua)) {
            jscd.browser = 'Firefox';
        } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
            jscd.browser = 'Safari';
        } else if (/Edg|Edge/.test(ua)) {
            jscd.browser = 'Edge';
        } else if (/Trident\/|MSIE/.test(ua)) {
            jscd.browser = 'IE';
        } else {
            jscd.browser = 'Unknown';
        }
    })();

    // [PATCH v0.6 P1] _traffic_cid_: ban deobf khong co _traffic_cid_ o bat cu cho nao
    // (da grep: 0 hit trong file nay, 0 hit trong cac file khac cua Dut, chuoi goc nam trong
    // kho string ma hoa cua VM 445KB nen khong doc duoc). Ham nay chi SINH + LUU id cuc bo
    // (dinh dang giong ban dump goc: 'cid-' + random hex + timestamp hex) qua GM_getValue /
    // GM_setValue duoi khoa '_traffic_cid_'. KHONG gan id vao bat cu request nao — khong co
    // file deobf nao cho thay request nao mang cid, nen vi tri tren day (wire placement) doi
    // quan sat live tab Network tren link4m.org/go/VDcp1 roi moi gan, khong bia param.
    function getClientId() {
        try {
            let id = (typeof GM_getValue === 'function') ? GM_getValue('_traffic_cid_', null) : null;
            if (!id) {
                id = 'cid-' + Math.random().toString(16).slice(2) + Date.now().toString(16);
                if (typeof GM_setValue === 'function') GM_setValue('_traffic_cid_', id);
            }
            return id;
        } catch (e) { return null; }
    }

    // =========================================================================
    // 3. HTTP NETWORKING WRAPPER (GM / fetch fallback)
    // =========================================================================
    function httpReq(options) {
        return new Promise((resolve, reject) => {
            const reqFn = typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest :
                          (typeof GM !== 'undefined' && GM.xmlHttpRequest ? GM.xmlHttpRequest : null);

            if (reqFn) {
                reqFn({
                    method: (options.method || 'GET').toUpperCase(),
                    url: options.url,
                    // [PATCH v0.6.1] Header giong trinh duyet that, khong giong bot.
                    // Bang chung live 2026-11-08 tren 789-club.cc (Cloudflare):
                    // curl voi header kieu GM_xhr cu (Accept: */*, khong Referer)
                    // bi cat ket noi tan goc (HTTP 000 = onerror trong GM_xhr),
                    // trong khi tab Chrome that mo ngon (navigation + cookie
                    // cf_clearance sau khi qua thu thach). Header cu la tin hieu
                    // bot ro nhat nen doi: Accept dang text/html nhu tab that,
                    // them Referer tu trang link4m, bo Cache-Control/Pragma
                    // no-cache (cung la dau hieu bot). GM_xmlhttpRequest van gui
                    // cookie cua domain (ke ca cf_clearance) nen mo tab trang
                    // dich qua kiem tra 1 lan roi bam lai co the qua duoc.
                    headers: Object.assign({
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                        'Accept-Language': 'vi,en;q=0.9,en-US;q=0.8',
                        'Referer': (typeof location !== 'undefined' ? location.href : '')
                    }, options.headers || {}),
                    data: options.data || null,
                    responseType: options.responseType || '',
                    timeout: options.timeout || CONFIG.defaultTimeout,
                    onload: function (res) {
                        resolve({
                            status: res.status,
                            statusText: res.statusText,
                            responseText: res.responseText,
                            response: res.response,
                            finalUrl: res.finalUrl || options.url
                        });
                    },
                    // [PATCH v0.6.1] Loi mang kem luon URL de lan sau nhin la biet
                    // request nao chet, khong phai doan.
                    onerror: function (err) { reject(new Error((err.statusText || 'Loi mang khi gui request') + ' — URL: ' + options.url)); },
                    ontimeout: function () { reject(new Error('Het thoi gian cho ket noi (Timeout)')); },
                    onabort: function () { reject(new Error('Yeu cau bi huy (Abort)')); }
                });
            } else {
                fetch(options.url, {
                    method: options.method || 'GET',
                    headers: options.headers || {},
                    body: options.data || null
                })
                .then(async r => {
                    let text = '';
                    try { text = await r.text(); } catch (e) {}
                    resolve({
                        status: r.status,
                        statusText: r.statusText,
                        responseText: text,
                        finalUrl: r.url
                    });
                })
                .catch(reject);
            }
        });
    }

    // =========================================================================
    // 4. SHADOW DOM CYBERPUNK UI SUBSYSTEM
    // =========================================================================
    const UI = {
        host: null,
        shadow: null,
        panel: null,
        fab: null,
        status: null,
        statusText: null,
        spin: null,
        cdline: null,
        cdfill: null,
        notice: null,
        noticeText: null,
        iform: null,
        urlwrap: null,
        urlInput: null,
        goBtn: null,
        btnStore: null,
        btnServer: null,
        btnSubmitNow: null,
        // [PATCH v0.6.2] O dan tay URL widget.
        wfallback: null,
        wurlInput: null,
        btnWidgetGo: null,
        btnMin: null,
        resultBox: null,
        rurl: null,
        rCopy: null,
        rOpen: null,
        version: "0.6.0",

        init() {
            if (document.getElementById('l4m-bypass-host')) return;

            try {
                if (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) {
                    this.version = GM_info.script.version;
                }
            } catch (e) {}

            this.host = document.createElement('div');
            this.host.id = 'l4m-bypass-host';
            this.host.style.cssText = 'position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:2147483647;';
            this.shadow = this.host.attachShadow({ mode: 'open' });

            const style = document.createElement('style');
            style.textContent = `
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.panel {
    position: relative;
    width: min(372px, calc(100vw - 24px));
    border-radius: 20px;
    overflow: hidden;
    color: #e9f4fa;
    line-height: 1.5;
    border: 1px solid transparent;
    background: linear-gradient(180deg, #0c141d, #05080d 62%) padding-box, linear-gradient(160deg, rgba(125,216,245,.75), rgba(150,235,255,.3) 45%, rgba(125,216,245,.5)) border-box;
    box-shadow: 0 18px 44px rgba(0,0,0,.55), 0 0 26px rgba(88,196,236,.14), inset 0 1px 0 rgba(255,255,255,.05);
    animation: l4m-pop .26s cubic-bezier(.2,.85,.3,1.1);
}

.panel::before {
    content: "";
    position: absolute;
    top: -70px;
    right: -60px;
    width: 190px;
    height: 190px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(88,196,236,.32), transparent 68%);
    pointer-events: none;
}

.panel::after {
    content: "";
    position: absolute;
    bottom: -80px;
    left: -50px;
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(140,230,255,.16), transparent 70%);
    pointer-events: none;
}

.panel > * {
    position: relative;
    z-index: 1;
}

.head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255,255,255,.06);
}

.title {
    flex: 1;
    min-width: 0;
    font-size: 14.5px;
    font-weight: 800;
    letter-spacing: .2px;
    color: #e9f4fa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ver {
    flex: none;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .5px;
    color: #8fd4ea;
    background: rgba(88,196,236,.16);
    border: 1px solid rgba(150,228,250,.3);
    padding: 2px 7px;
    border-radius: 999px;
}

.min {
    flex: none;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9px;
    color: #93a0b8;
    font-size: 17px;
    cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;
}

.min:hover {
    background: rgba(255,255,255,.08);
    color: #e9f4fa;
    border-color: rgba(255,255,255,.08);
}

.status {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 11px 14px;
    font-size: 13.5px;
    color: #c7dde8;
    border-bottom: 1px solid rgba(255,255,255,.06);
}

#statusText {
    flex: 1;
    min-width: 0;
    word-break: break-word;
    line-height: 1.5;
    font-weight: 600;
    letter-spacing: .1px;
    transition: color .18s ease;
}

.stx.ok {
    color: #83d6a6;
}

.stx.err {
    color: #f2837a;
}

.stx.warn {
    color: #efc67a;
}

.stx.info {
    color: #8fd4f0;
}

.spin {
    display: none;
    width: 12px;
    height: 12px;
    flex: none;
    border: 2px solid rgba(255,255,255,.12);
    border-top-color: #6fd8f5;
    border-radius: 50%;
    animation: l4m-rot .8s linear infinite;
}

.spin.on {
    display: inline-block;
    filter: drop-shadow(0 0 5px rgba(125,216,245,.65));
}

@keyframes l4m-rot {
    to {
    transform: rotate(360deg)
}


}

.cdline {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 3px;
    background: rgba(255,255,255,.05);
    pointer-events: none;
}

.cdline i {
    display: block;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #3fb6dd, #7de8ff);
    box-shadow: 0 0 9px rgba(125,232,255,.55);
    transition: width .25s linear;
}

.cd {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    padding: 3px 11px 3px 9px;
    border-radius: 999px;
    font-size: 12.5px;
    background: linear-gradient(135deg, rgba(88,196,236,.24), rgba(150,235,255,.14));
    border: 1px solid rgba(150,228,250,.45);
    color: #d8f2fc;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: .4px;
}

.cd .cddot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6fd8f5;
    box-shadow: 0 0 6px rgba(125,216,245,.85);
    animation: l4m-pulse 1.1s ease-in-out infinite;
}

@keyframes l4m-pulse {
    0%, 100% {
    opacity: 1;
    transform: scale(1)
}

50% {
    opacity: .55;
    transform: scale(.8)
}


}

.cd.urgent {
    background: linear-gradient(135deg, rgba(233,106,92,.2), rgba(233,106,92,.1));
    border-color: rgba(233,106,92,.5);
    color: #ffc4bd;
}

.cd.urgent .cddot {
    background: #f07a6b;
    box-shadow: 0 0 6px rgba(240,122,107,.8);
}

.notice {
    display: none;
    margin: 12px 14px 0;
    padding: 10px 12px;
    align-items: center;
    gap: 10px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(88,196,236,.18), rgba(150,235,255,.09));
    border: 1px solid rgba(150,228,250,.4);
}

.notice.on {
    display: flex;
    animation: l4m-in .22s ease;
}

.nico {
    flex: none;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    border-radius: 8px;
    background: rgba(88,196,236,.24);
}

.ntx {
    min-width: 0;
    font-size: 13px;
    font-weight: 700;
    color: #d2f1fc;
    letter-spacing: .2px;
}

.inputrow {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px 13px;
}

.urlwrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(7,11,20,.75);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 0 12px;
    transition: border-color .15s, box-shadow .15s;
}

.urlwrap:focus-within {
    border-color: #56c8ea;
    box-shadow: 0 0 0 3px rgba(88,196,236,.18);
}

.uic {
    flex: none;
    font-size: 13px;
    opacity: .6;
}

.url {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: #e9f4fa;
    padding: 12px 0;
    font-size: 14px;
}

.url::placeholder {
    color: #55607a;
}

.url:disabled {
    opacity: .5;
}

.go {
    width: 100%;
    min-height: 44px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    background: linear-gradient(135deg, #7de0ff, #3a9fd8);
    color: #071120;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: .3px;
    box-shadow: 0 6px 18px rgba(88,196,236,.32), inset 0 1px 0 rgba(255,255,255,.25);
    transition: transform .12s, filter .15s, box-shadow .15s, opacity .15s;
}

.go:hover:not(:disabled) {
    filter: brightness(1.07);
    box-shadow: 0 8px 22px rgba(88,196,236,.42), inset 0 1px 0 rgba(255,255,255,.25);
}

.go:active:not(:disabled) {
    transform: scale(.98);
}

.go:disabled {
    opacity: .4;
    cursor: not-allowed;
    box-shadow: none;
}

/* [PATCH v0.6.2] O dan tay URL widget khi khong tai duoc trang dich. */
.wfallback {
    display: none;
    flex-direction: column;
    gap: 8px;
    padding: 0 14px 13px;
}
.wfallback.on {
    display: flex;
}
.wftag {
    font-size: 12px;
    font-weight: 700;
    color: #ffb4a8;
    line-height: 1.4;
}
.wfhelp {
    font-size: 11px;
    line-height: 1.5;
    color: #93a3bd;
}
.wfhelp b {
    color: #e9f4fa;
}

.links {
    display: flex;
    gap: 8px;
    width: 100%;
}

.lbtn {
    flex: 1;
    min-height: 42px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13.5px;
    font-weight: 800;
    letter-spacing: .25px;
    box-shadow: 0 4px 14px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08);
    transition: transform .12s, filter .15s, background .15s, border-color .15s, box-shadow .15s;
}

.lbtn:active {
    transform: scale(.97);
}

.lbtn.store {
    background: linear-gradient(135deg, rgba(88,196,236,.18), rgba(150,235,255,.08));
    border: 1px solid rgba(150,228,250,.38);
    color: #d8f2fc;
}

.lbtn.store:hover {
    background: linear-gradient(135deg, rgba(88,196,236,.28), rgba(150,235,255,.15));
    border-color: rgba(150,228,250,.65);
    box-shadow: 0 6px 18px rgba(88,196,236,.22), inset 0 1px 0 rgba(255,255,255,.14);
    filter: brightness(1.06);
}

.lbtn.server {
    background: linear-gradient(135deg, rgba(114,137,218,.22), rgba(88,101,242,.1));
    border: 1px solid rgba(138,156,245,.42);
    color: #dce2ff;
}

.lbtn.server:hover {
    background: linear-gradient(135deg, rgba(114,137,218,.32), rgba(88,101,242,.18));
    border-color: rgba(156,172,255,.7);
    box-shadow: 0 6px 18px rgba(114,137,218,.24), inset 0 1px 0 rgba(255,255,255,.14);
    filter: brightness(1.06);
}

/* [PATCH v0.6 P3] Nut "Nop ngay": cam, chi bat khi da co ma widget. */
.lbtn.submitnow {
    background: linear-gradient(135deg, rgba(234,88,12,.28), rgba(249,115,22,.12));
    border: 1px solid rgba(251,146,60,.5);
    color: #ffedd5;
}

.lbtn.submitnow:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(234,88,12,.4), rgba(249,115,22,.2));
    border-color: rgba(251,146,60,.8);
    box-shadow: 0 6px 18px rgba(234,88,12,.3), inset 0 1px 0 rgba(255,255,255,.14);
    filter: brightness(1.06);
}

.lbtn:disabled {
    opacity: .45;
    cursor: not-allowed;
}

.result {
    margin: 0 14px 13px;
    display: none;
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(165deg, rgba(88,171,125,.16), rgba(88,171,125,.05));
    border: 1px solid rgba(116,199,149,.32);
}

.result.on {
    display: block;
    animation: l4m-in .22s ease;
}

.rtag {
    padding: 10px 12px 0;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #8fd8ac;
}

.rurl {
    margin: 8px 10px 0;
    padding: 9px 11px;
    background: rgba(4,10,7,.55);
    border: 1px solid rgba(116,199,149,.18);
    border-radius: 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.55;
    color: #c4e8d2;
    word-break: break-all;
    max-height: 80px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(116,199,149,.35) transparent;
}

.rbtns {
    display: flex;
    gap: 8px;
    padding: 10px 10px 11px;
}

.rbtn {
    flex: 1;
    min-height: 42px;
    border: none;
    border-radius: 11px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .2px;
    transition: transform .12s, filter .15s, background .15s, box-shadow .15s;
}

.rbtn:active {
    transform: scale(.97);
}

.rbtn.copy {
    background: linear-gradient(135deg, #66bd90, #4aa274);
    color: #05130b;
    box-shadow: 0 4px 14px rgba(88,171,125,.28);
}

.rbtn.copy:hover {
    filter: brightness(1.06);
}

.rbtn.open {
    background: rgba(116,199,149,.1);
    color: #a4dcbd;
    border: 1px solid rgba(116,199,149,.32);
}

.rbtn.open:hover {
    background: rgba(116,199,149,.18);
}

@keyframes l4m-in {
    from {
    opacity: 0;
    transform: translateY(4px)
}

to {
    opacity: 1;
    transform: none
}


}

@keyframes l4m-pop {
    from {
    opacity: 0;
    transform: translateY(10px) scale(.97)
}

to {
    opacity: 1;
    transform: none
}


}

.fab {
    width: 54px;
    height: 54px;
    border-radius: 17px;
    cursor: pointer;
    border: 1px solid rgba(150,228,250,.34);
    background: linear-gradient(160deg, #0e1c26, #070d13);
    box-shadow: 0 8px 24px rgba(0,0,0,.5), 0 0 16px rgba(88,196,236,.16), inset 0 1px 0 rgba(255,255,255,.07);
    animation: l4m-pop .22s ease;
    transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, filter .16s ease;
}

.fab:hover {
    border-color: rgba(150,228,250,.65);
    box-shadow: 0 10px 26px rgba(0,0,0,.55), 0 0 20px rgba(88,196,236,.3), inset 0 1px 0 rgba(255,255,255,.12);
    filter: brightness(1.12);
}

.fab:active {
    transform: scale(.93);
}

button:focus-visible {
    outline: 2px solid #6fd8f5;
    outline-offset: 2px;
}

@media (max-width: 480px) {
    .panel {
    width: calc(100vw - 14px);
}

.head {
    padding: 11px 12px;
    gap: 9px;
}

.title {
    font-size: 14px;
}

.ver {
    display: none;
}

.status {
    min-height: 42px;
    padding: 10px 12px;
    font-size: 13px;
}

.inputrow {
    gap: 9px;
    padding: 11px 12px 12px;
}

.urlwrap {
    padding: 0 11px;
}

.url {
    font-size: 16px;
    padding: 11px 0;
}

.go {
    min-height: 46px;
    font-size: 13.5px;
}

.lbtn {
    min-height: 44px;
    font-size: 13px;
}

.notice {
    margin: 10px 12px 0;
}

.result {
    margin: 0 12px 11px;
}

.rbtn {
    min-height: 44px;
}


}

@media (pointer: coarse) {
    .url {
    font-size: 16px;
}

.min {
    width: 34px;
    height: 34px;
}

.rbtn, .lbtn {
    min-height: 44px;
}


}

@media (prefers-reduced-motion: reduce) {
    .panel, .fab, .result.on, .notice.on {
    animation: none;
}

.spin {
    animation-duration: 1.6s;
}

.cd .cddot {
    animation: none;
}

.cdline i {
    transition: none;
}


}
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <div class="panel" id="panel">
                    <div class="head">
                        <span class="title">Link4m (Bypass)</span>
                        <span class="ver">v${this.version}</span>
                        <button class="min" id="btnMin" title="Thu nhỏ">−</button>
                    </div>
                    <div class="status" id="status">
                        <span class="spin on" id="spin"></span>
                        <span id="statusText">Đang khởi tạo…</span>
                        <span class="cdline" id="cdline"><i id="cdfill"></i></span>
                    </div>
                    <div class="notice" id="notice">
                        <span class="nico">🔓</span>
                        <span class="ntx" id="noticeText">Hãy giải reCaptcha…</span>
                    </div>
                    <form class="inputrow" id="iform" novalidate>
                        <div class="urlwrap" id="urlwrap">
                            <span class="uic">🔗</span>
                            <input class="url" id="url" type="url" inputmode="url" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Nhập URL (vd: example.com)" disabled>
                        </div>
                        <button class="go" id="go" type="submit" disabled>Bắt đầu</button>
                        <div class="links">
                            <button class="lbtn store" id="btnStore" type="button">My Store</button>
                            <button class="lbtn server" id="btnServer" type="button">My Server</button>
                            <button class="lbtn submitnow" id="btnSubmitNow" type="button" disabled>Nộp ngay</button>
                        </div>
                    </form>
                    <!-- [PATCH v0.6.2] Duong vong khi khong tai duoc trang dich (Cloudflare). -->
                    <div class="wfallback" id="wfallback">
                        <div class="wftag">⛔ Không tải được trang đích (Cloudflare chặn bot) — chạy thẳng widget:</div>
                        <div class="urlwrap">
                            <span class="uic">🧩</span>
                            <input class="url" id="wurl" type="url" inputmode="url" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Dán URL widget (…/widget/service.js?key=…)">
                        </div>
                        <button class="go" id="wgo" type="button">Chạy widget</button>
                        <div class="wfhelp">Mở tab trang đích → Ctrl+U xem source → tìm dòng <b>widget/service.js?key=</b> → copy nguyên URL đó dán vào đây.</div>
                    </div>
                    <div class="result" id="result">
                        <div class="rtag">✓ URL của bạn</div>
                        <div class="rurl" id="rurl"></div>
                        <div class="rbtns">
                            <button class="rbtn copy" id="rCopy">⧉ Copy URL</button>
                            <button class="rbtn open" id="rOpen">↗ Mở URL</button>
                        </div>
                    </div>
                </div>
                <button class="fab" id="fab" title="Mở Link4m (Bypass)" aria-label="Mở Link4m (Bypass)" style="display:none;"></button>
            `;

            this.shadow.appendChild(style);
            this.shadow.appendChild(wrapper);
            document.documentElement.appendChild(this.host);

            this.panel = this.shadow.getElementById('panel');
            this.fab = this.shadow.getElementById('fab');
            this.status = this.shadow.getElementById('status');
            this.statusText = this.shadow.getElementById('statusText');
            this.spin = this.shadow.getElementById('spin');
            this.cdline = this.shadow.getElementById('cdline');
            this.cdfill = this.shadow.getElementById('cdfill');
            this.notice = this.shadow.getElementById('notice');
            this.noticeText = this.shadow.getElementById('noticeText');
            this.iform = this.shadow.getElementById('iform');
            this.urlwrap = this.shadow.getElementById('urlwrap');
            this.urlInput = this.shadow.getElementById('url');
            this.goBtn = this.shadow.getElementById('go');
            this.btnStore = this.shadow.getElementById('btnStore');
            this.btnServer = this.shadow.getElementById('btnServer');
            this.btnSubmitNow = this.shadow.getElementById('btnSubmitNow');
            this.wfallback = this.shadow.getElementById('wfallback');
            this.wurlInput = this.shadow.getElementById('wurl');
            this.btnWidgetGo = this.shadow.getElementById('wgo');
            this.btnMin = this.shadow.getElementById('btnMin');
            this.resultBox = this.shadow.getElementById('result');
            this.rurl = this.shadow.getElementById('rurl');
            this.rCopy = this.shadow.getElementById('rCopy');
            this.rOpen = this.shadow.getElementById('rOpen');

            this.bindEvents();
        },

        bindEvents() {
            this.btnMin.onclick = () => {
                this.panel.style.display = 'none';
                this.fab.style.display = 'block';
            };
            this.fab.onclick = () => {
                this.fab.style.display = 'none';
                this.panel.style.display = 'block';
            };

            this.btnStore.onclick = () => window.open(CONFIG.storeUrl, '_blank');
            this.btnServer.onclick = () => window.open(CONFIG.serverUrl, '_blank');

            // [PATCH v0.6 P3] Nut "Nop ngay": chi khi nguoi dung bam tay moi goi submitFinalLink()
            // (POST /links/get-link-info + cho captcha). Chua co ma thi bao, khong lam gi.
            if (this.btnSubmitNow) {
                this.btnSubmitNow.onclick = () => {
                    if (Engine.pendingCode) {
                        Engine.submitFinalLink(Engine.pendingCode);
                    } else {
                        this.setStatus('Chưa có mã để nộp — chạy widget lấy mã trước', 'warn');
                    }
                };
            }

            this.rCopy.onclick = () => {
                const link = this.rurl.textContent.trim();
                if (typeof GM_setClipboard === 'function') GM_setClipboard(link);
                else navigator.clipboard.writeText(link);
                this.rCopy.textContent = '✓ Đã Copy!';
                setTimeout(() => this.rCopy.textContent = '⧉ Copy URL', 2000);
            };

            this.rOpen.onclick = () => {
                const link = this.rurl.textContent.trim();
                if (link) window.open(link, '_blank');
            };

            this.iform.onsubmit = (e) => {
                e.preventDefault();
                const u = this.urlInput.value.trim();
                if (!u) {
                    this.setStatus('✗ Chưa nhập URL', 'err');
                    return;
                }
                if (/link4m/i.test(u)) {
                    this.setStatus('✗ Đừng nhập URL "Link4m" — hãy nhập URL nhiệm vụ', 'err');
                    return;
                }
                Engine.runManualUrlBypass(u);
            };

            // [PATCH v0.6.2] Nut chay thang widget tu URL dan tay.
            if (this.btnWidgetGo) {
                this.btnWidgetGo.onclick = () => {
                    const u = this.wurlInput ? this.wurlInput.value.trim() : '';
                    if (!u) {
                        this.setStatus('✗ Chưa dán URL widget', 'err');
                        return;
                    }
                    Engine.runWidgetFromUrl(u);
                };
            }
        },

        setStatus(msg, type = 'info', showSpin = false) {
            if (!this.statusText) return;
            this.statusText.textContent = msg;
            this.statusText.className = 'stx ' + type;
            if (this.spin) {
                if (showSpin) this.spin.classList.add('on');
                else this.spin.classList.remove('on');
            }
        },

        showNotice(msg) {
            if (this.notice) {
                this.notice.style.display = 'flex';
                if (this.noticeText) this.noticeText.textContent = msg;
            }
        },

        hideNotice() {
            if (this.notice) this.notice.style.display = 'none';
        },

        // [PATCH v0.6.2] Hien o dan tay URL widget khi khong tai duoc trang dich.
        showWidgetFallback() {
            if (this.wfallback) this.wfallback.classList.add('on');
        },

        setProgress(percent) {
            if (this.cdfill) {
                this.cdfill.style.width = Math.min(100, Math.max(0, percent)) + '%';
            }
        },

        setCountdown(remainingSec, totalSec, label = 'Chờ bước') {
            const pct = totalSec > 0 ? ((totalSec - remainingSec) / totalSec) * 100 : 0;
            this.setProgress(pct);
            const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
            const ss = String(remainingSec % 60).padStart(2, '0');
            this.statusText.innerHTML = `${label} <span class="cd ${remainingSec <= 5 ? 'urgent' : ''}"><i class="cddot"></i>${mm}:${ss}</span>`;
        },

        showResult(url) {
            this.resultBox.classList.add('on');
            this.resultBox.style.display = 'block';
            this.rurl.textContent = url;
            this.setStatus('✓ Lấy URL thành công', 'ok', false);
            this.hideNotice();
            this.setProgress(100);
        },

        // [PATCH v0.6 P3] Bat/tat nut "Nop ngay" theo viec da co ma hay chua.
        enableSubmitNow() {
            if (this.btnSubmitNow) this.btnSubmitNow.disabled = false;
        },

        disableSubmitNow() {
            if (this.btnSubmitNow) this.btnSubmitNow.disabled = true;
        },

        enableInput() {
            if (this.urlInput) this.urlInput.disabled = false;
            if (this.goBtn) {
                this.goBtn.disabled = false;
                this.goBtn.textContent = 'Bắt đầu';
            }
        },

        disableInput(btnText = 'Đang chạy…') {
            if (this.urlInput) this.urlInput.disabled = true;
            if (this.goBtn) {
                this.goBtn.disabled = true;
                this.goBtn.textContent = btnText;
            }
        }
    };

    // =========================================================================
    // 5. OCR & IMAGE PREPROCESSING ENGINE (Canvas + OCR.Space + Tesseract.js)
    // =========================================================================
    const OCREngine = {
        preprocessImageToDataUrl(imgElement) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const w = imgElement.naturalWidth || imgElement.width || 300;
                const h = imgElement.naturalHeight || imgElement.height || 100;
                canvas.width = w;
                canvas.height = h;

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(imgElement, 0, 0, w, h);

                const dataUrl = canvas.toDataURL('image/png');
                resolve(dataUrl);
            });
        },

        async recognizeWithOCRSpace(base64Data) {
            const form = new URLSearchParams();
            form.set('base64Image', base64Data);
            form.set('language', 'eng');
            form.set('isOverlayRequired', 'false');
            form.set('scale', 'true');
            form.set('OCREngine', '2');
            form.set('detectOrientation', 'true');

            const res = await httpReq({
                method: 'POST',
                url: CONFIG.ocrSpaceEndpoint,
                headers: {
                    'apikey': CONFIG.ocrSpaceApiKey,
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: form.toString()
            });

            if (res.status === 200 && res.responseText) {
                const json = JSON.parse(res.responseText);
                if (json.ParsedResults && json.ParsedResults.length > 0) {
                    return json.ParsedResults.map(p => p.ParsedText || '').join('\n').trim();
                }
            }
            throw new Error('OCR.Space khong nhan dien duoc');
        },

        async recognizeWithTesseract(imgDataUrl) {
            if (typeof window.Tesseract === 'undefined') {
                await new Promise((res, rej) => {
                    const script = document.createElement('script');
                    script.src = CONFIG.tesseractCdn;
                    script.onload = res;
                    script.onerror = rej;
                    document.head.appendChild(script);
                });
            }

            const { data } = await window.Tesseract.recognize(imgDataUrl, 'eng');
            return (data && data.text ? data.text.trim() : '');
        },

        async scanAdvertiserImages() {
            const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
                const s = img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
                return /\/uploads\/advertiser\/|img\.link4m\./i.test(s);
            });

            const texts = [];
            for (const img of imgs) {
                try {
                    UI.setStatus('Đang OCR ảnh quảng cáo…', 'info', true);
                    const dataUrl = await this.preprocessImageToDataUrl(img);
                    let text = '';
                    try {
                        text = await this.recognizeWithOCRSpace(dataUrl);
                    } catch (e) {
                        text = await this.recognizeWithTesseract(dataUrl);
                    }
                    if (text) texts.push(text);
                } catch (err) {
                    console.warn('[Link4M OCR] Loi OCR anh:', err);
                }
            }
            return texts.join('\n');
        }
    };

    // =========================================================================
    // 6. DOMAIN EXTRACTION & WILDCARD MATCHING ENGINE
    // =========================================================================
    const DomainMatcher = {
        cleanDomain(d) {
            return d.replace(/^https?:\/\//i, '')
                    .replace(/^www\./i, '')
                    .split('/')[0]
                    .split('?')[0]
                    .split('#')[0]
                    .trim()
                    .toLowerCase();
        },

        extractDomainsFromText(text) {
            if (!text) return [];
            const results = new Map();

            const urlMatches = text.match(/https?:\/\/([a-z0-9][a-z0-9.\-]{1,61}\.[a-z]{2,}(?:\.[a-z]{2,})?)/gi) || [];
            for (const u of urlMatches) {
                const d = this.cleanDomain(u);
                if (this.isValidDomain(d)) results.set(d, (results.get(d) || 0) + 10);
            }

            const tldRegex = new RegExp('\\b([a-z0-9-]{2,61})\\.(' + TLDS.map(t => t.replace('.', '\\.')).join('|') + ')\\b', 'gi');
            let match;
            while ((match = tldRegex.exec(text)) !== null) {
                const d = this.cleanDomain(match[0]);
                if (this.isValidDomain(d)) results.set(d, (results.get(d) || 0) + 5);
            }

            return Array.from(results.entries())
                .sort((a, b) => b[1] - a[1])
                .map(item => item[0]);
        },

        isValidDomain(d) {
            if (!d || d.length < 4 || d.length > 70) return false;
            const ignored = /google|link4m|gstatic|cloudflare|facebook|youtube|recaptcha|catbox|github/i;
            if (ignored.test(d)) return false;
            return true;
        },

        matchMask(rawDomain, maskPattern) {
            if (!maskPattern.includes('*')) return rawDomain === maskPattern;
            const regexStr = '^' + maskPattern.replace(/[.+?^$${}()|[\]\\]/g, '\\$&').replace(/\*+/g, '.*') + '$';
            const re = new RegExp(regexStr, 'i');
            return re.test(rawDomain);
        },

        // [PATCH v0.6 P2] Trich mat na domain o Buoc 3 (vd: 'kqbd***.site') tu text trang.
        // Chi tra ve token co chua '*'; domain day du binh thuong (khong co '*') tra ve null.
        extractMaskFromText(text) {
            if (!text) return null;
            const tokens = text.match(/[a-z0-9][a-z0-9\-*]{1,61}\.[a-z*]{2,}(?:\.[a-z*]{2,})?/gi) || [];
            for (const t of tokens) {
                if (t.includes('*')) return t.toLowerCase();
            }
            return null;
        }
    };

    // =========================================================================
    // 7. WIDGET PROTOCOL & MULTI-STEP COUNTDOWN ENGINE
    // =========================================================================
    const Engine = {
        // [PATCH v0.6 P3] Ma widget lay duoc giu o day cho nut "Nop ngay" bam tay.
        pendingCode: null,

        findWidgetScriptUrls(html) {
            const matches = [];
            const re = /<script[^>]+src=["'](?:https?:)?\/\/([^\/"']+)\/widget\/(service(?:-v\d+)?\.js)\?([^"']*)["']/gi;
            let m;
            while ((m = re.exec(html)) !== null) {
                matches.push({
                    domain: m[1],
                    file: m[2],
                    query: m[3],
                    fullUrl: `https://${m[1]}/widget/${m[2]}?${m[3]}`
                });
            }
            return matches;
        },

        // [PATCH v0.6.2] Parse 1 URL widget dan tay (tu view-source tab trang dich),
        // dung cung regex nhu findWidgetScriptUrls nhung ap cho 1 URL don.
        // Chap nhan co/khong co scheme: https://host/widget/service.js?key=...
        parseWidgetUrl(url) {
            if (!url) return null;
            const m = String(url).trim().match(/^(?:https?:)?\/\/?([^\s\/]+)\/widget\/(service(?:-v\d+)?\.js)\?([^"'\s]*)/i);
            if (!m) return null;
            return { domain: m[1], file: m[2], query: m[3], fullUrl: `https://${m[1]}/widget/${m[2]}?${m[3]}` };
        },

        // [PATCH v0.6.2] Chay thang widget tu URL dan tay, bo qua buoc GET trang dich
        // (buoc dang chet vi Cloudflare cat ket noi tan goc). Sau do van fill-only
        // nhu P3: lay ma -> dien vao o code -> dung, khong tu nop.
        async runWidgetFromUrl(url) {
            const w = this.parseWidgetUrl(url);
            if (!w) {
                UI.setStatus('✗ URL widget không đúng dạng — cần dạng https://<host>/widget/service.js?key=…', 'err');
                return;
            }
            UI.disableInput('Đang chạy widget…');
            try {
                const code = await this.executeWidgetWorkflow(w);
                if (code) this.fillCodeOnly(code);
                else UI.setStatus('⊘ Không lấy được mã từ widget', 'warn');
            } catch (err) {
                const msg = String(err && err.message || err);
                UI.setStatus('✗ Có lỗi xảy ra: ' + msg + (msg.indexOf(w.domain) === -1 ? ' — widget: ' + w.domain : ''), 'err');
            } finally {
                UI.enableInput();
            }
        },

        extractPageTaskData() {
            const html = document.documentElement.innerHTML;
            const text = document.body ? document.body.innerText : '';

            const alias = (document.querySelector('input[name="alias"]') || {}).value || '';
            const campaign_id = (document.querySelector('input[name="campaign_id"]') || {}).value || '';
            const display_id = (document.querySelector('input[name="display_id"]') || {}).value || '';
            const prefix = (document.querySelector('input[name="prefix"]') || {}).value || '';

            let taskId = null;
            const idMatch = html.match(/var\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([0-9a-f]{24})['"]/i);
            if (idMatch) taskId = idMatch[2];

            return { html, text, alias, campaign_id, display_id, prefix, taskId };
        },

        async executeWidgetWorkflow(widgetObj) {
            UI.setStatus(`Đang kết nối widget: ${widgetObj.domain}…`, 'info', true);

            const scriptRes = await httpReq({ method: 'GET', url: widgetObj.fullUrl });
            const sCode = scriptRes.responseText || '';

            const keyMatch = widgetObj.query.match(/(?:^|&)key=([^&"'\s]+)/);
            const key = keyMatch ? keyMatch[1] : '';

            const sessionInitUrl = `https://${widgetObj.domain}/widget/get_code.html?key=${key}&action=init`;
            let sessionRes;
            try {
                sessionRes = await httpReq({ method: 'GET', url: sessionInitUrl });
            } catch (e) {
                sessionRes = await httpReq({ method: 'GET', url: `https://${widgetObj.domain}/widget/get_quest_code.html?key=${key}` });
            }

            let sessionData = {};
            try { sessionData = JSON.parse(sessionRes.responseText); } catch (e) {}

            const totalStep = sessionData.totalStep || 1;
            const waitTime = sessionData.traffic_wait_time || 45;
            const waitTimeStep2 = sessionData.traffic_step_2_wait_time || 30;

            console.log('[Link4M Widget] Khoi tao phien:', { totalStep, waitTime, waitTimeStep2, sessionData });

            for (let rem = waitTime; rem >= 0; rem--) {
                UI.setCountdown(rem, waitTime, `Chờ bước 1/${totalStep}`);
                await new Promise(r => setTimeout(r, 1000));
            }

            if (totalStep >= 2) {
                UI.setStatus('Qua bước 2…', 'info', true);
                const step2Url = `https://${widgetObj.domain}/widget/get_code.html?key=${key}&step=2&traffic_session=${encodeURIComponent(sessionData.session || '')}`;
                await httpReq({ method: 'GET', url: step2Url }).catch(() => {});

                for (let rem = waitTimeStep2; rem >= 0; rem--) {
                    UI.setCountdown(rem, waitTimeStep2, 'Chờ bước 2/2');
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            UI.setStatus('Đang lấy mã xác thực…', 'info', true);
            const verifyUrl = `https://${widgetObj.domain}/widget/get_code.html?key=${key}&action=verify&traffic_session=${encodeURIComponent(sessionData.session || '')}`;
            const verifyRes = await httpReq({ method: 'GET', url: verifyUrl });

            let finalCode = '';
            if (verifyRes.responseText) {
                const jsonMatch = verifyRes.responseText.match(/["']?([A-Za-z0-9_-]{5,25})["']?/);
                if (jsonMatch) finalCode = jsonMatch[1];
            }

            if (!finalCode && sessionData.code) finalCode = sessionData.code;
            return finalCode;
        },

        // [PATCH v0.6 P3] Chi dien ma vao o code cua trang + o nhap cua panel, KHONG POST,
        // KHONG goi submitFinalLink. Nguoi dung tu bam "Nop ngay" de nop + tu giai captcha.
        fillCodeOnly(code) {
            if (!code) return;
            this.pendingCode = code;
            const pageCodeInput = document.querySelector('input[name="code"], input#code, input[placeholder*="mã"], input[placeholder*="code"]');
            if (pageCodeInput) {
                pageCodeInput.value = code;
                pageCodeInput.dispatchEvent(new Event('input', { bubbles: true }));
                pageCodeInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (UI.urlInput) UI.urlInput.value = code;
            UI.enableSubmitNow();
            UI.setStatus('Đã có mã — đã điền, bro tự bấm Nộp + giải captcha để ra link đích', 'ok', false);
        },

        async submitFinalLink(code) {
            UI.setStatus(`Đã có mã: ${code} - Đang nộp lên Link4m…`, 'info', true);
            const task = this.extractPageTaskData();

            let recaptchaToken = '';
            const recaptchaInput = document.querySelector('[name="g-recaptcha-response"], textarea#g-recaptcha-response');
            if (recaptchaInput && recaptchaInput.value) {
                recaptchaToken = recaptchaInput.value.trim();
            } else if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.getResponse === 'function') {
                recaptchaToken = window.grecaptcha.getResponse();
            }

            const hasCaptcha = document.querySelector('[name="g-recaptcha-response"], .g-recaptcha, iframe[src*="recaptcha"]');
            if (hasCaptcha && !recaptchaToken) {
                UI.showNotice('Hãy giải reCaptcha trên trang để nhận link đích…');
                UI.setStatus('Đang chờ bạn giải reCaptcha…', 'warn', false);

                const startWait = Date.now();
                while (!recaptchaToken) {
                    if (Date.now() - startWait > CONFIG.reCaptchaTimeout) {
                        UI.setStatus('✗ Chờ reCaptcha quá 5 phút', 'err');
                        return;
                    }
                    if (recaptchaInput && recaptchaInput.value) {
                        recaptchaToken = recaptchaInput.value.trim();
                        break;
                    }
                    if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.getResponse === 'function') {
                        const token = window.grecaptcha.getResponse();
                        if (token) { recaptchaToken = token; break; }
                    }
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            UI.hideNotice();
            UI.setStatus('Đang lấy URL đích…', 'info', true);

            const postBody = new URLSearchParams();
            postBody.set('password', code);
            postBody.set('alias', task.alias);
            postBody.set('campaign_id', task.campaign_id);
            postBody.set('display_id', task.display_id);
            postBody.set('prefix', task.prefix);
            if (recaptchaToken) postBody.set('g-recaptcha-response', recaptchaToken);

            const linkRes = await httpReq({
                method: 'POST',
                url: '/links/get-link-info',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                data: postBody.toString()
            });

            if (linkRes.status === 200 && linkRes.responseText) {
                try {
                    const resJson = JSON.parse(linkRes.responseText);
                    if (resJson.url) {
                        UI.showResult(resJson.url);
                        return;
                    }
                } catch (e) {}
            }

            const pageCodeInput = document.querySelector('input[name="code"], input#code, input[placeholder*="mã"], input[placeholder*="code"]');
            if (pageCodeInput) {
                pageCodeInput.value = code;
                pageCodeInput.dispatchEvent(new Event('input', { bubbles: true }));
                pageCodeInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            UI.setStatus(`Mã nhiệm vụ: ${code} (Đã tự động điền)`, 'ok', false);
        },

        async runManualUrlBypass(taskUrl) {
            UI.disableInput('Đang tải trang…');
            UI.setStatus('Đang tải trang nhiệm vụ…', 'info', true);

            try {
                const res = await httpReq({ method: 'GET', url: taskUrl });
                // [PATCH v0.6.1] Trang dich dung Cloudflare chan bot: tra 403
                // + trang thu thach "Just a moment..." (chua challenges.cloudflare.com).
                // GM_xhr khong giai duoc thu thach JS, nhung mo tab trang dich qua
                // kiem tra 1 lan se co cookie cf_clearance, bam lai co the qua.
                // Bao ro nguyen nhan thay vi bao chung chung "khong truy cap duoc".
                if (res.status === 403 && /challenges\.cloudflare\.com|Just a moment/i.test(res.responseText || '')) {
                    UI.setStatus('⛔ Trang đích chặn bot (Cloudflare) — mở tab trang đích qua kiểm tra 1 lần rồi bấm Bắt đầu lại, hoặc dán URL widget vào ô dưới để chạy thẳng', 'err');
                    UI.showWidgetFallback();
                    UI.enableInput();
                    return;
                }
                if (res.status !== 200 || !res.responseText) {
                    UI.setStatus('✗ Không truy cập được trang nhiệm vụ', 'err');
                    UI.enableInput();
                    return;
                }

                const widgets = this.findWidgetScriptUrls(res.responseText);
                if (widgets.length === 0) {
                    UI.setStatus('⊘ Không tìm thấy widget lấy mã trên URL này', 'warn');
                    UI.enableInput();
                    return;
                }

                UI.setStatus(`Đang chạy ${widgets.length} widget…`, 'info', true);
                let foundCode = null;
                for (const w of widgets) {
                    try {
                        const code = await this.executeWidgetWorkflow(w);
                        if (code) { foundCode = code; break; }
                    } catch (e) {
                        console.warn('[Link4M] Loi chay widget:', e);
                    }
                }

                // [PATCH v0.6 P3] CHI DIEN MA, KHONG TU NOP: ban deobf tu goi submitFinalLink()
                // ngay khi widget tra ma ve. Thiet ke remake: lay ma -> dien vao o code -> dung;
                // nguoi dung tu bam nut "Nop ngay" (goi submitFinalLink) + tu giai captcha.
                if (foundCode) {
                    this.fillCodeOnly(foundCode);
                } else {
                    UI.setStatus('⊘ Không lấy được mã từ widget', 'warn');
                }
            } catch (err) {
                // [PATCH v0.6.1/0.6.2] Kem URL vao loi (neu loi mang thi URL da co san
                // tu onerror, khong lap lai) + mo o dan tay URL widget de bro chay vong.
                const msg = String(err && err.message || err);
                UI.setStatus('✗ Có lỗi xảy ra: ' + msg + (msg.indexOf(taskUrl) === -1 ? ' — URL: ' + taskUrl : '') + ' — dán URL widget vào ô dưới để chạy thẳng', 'err');
                UI.showWidgetFallback();
            } finally {
                UI.enableInput();
            }
        },

        async runAutoWorkflow() {
            UI.init();
            UI.setStatus('Đang quét nhiệm vụ trang…', 'info', true);

            if (document.title && /chờ một chút|just a moment/i.test(document.title)) {
                UI.setStatus('⏳ Chờ Cloudflare…', 'warn', true);
                return;
            }

            const task = this.extractPageTaskData();

            const wrapper = document.getElementById('advertise-html-wrapper');
            if (wrapper && !wrapper.innerHTML.trim()) {
                UI.setStatus('Chờ nội dung hướng dẫn…', 'info', true);
                await new Promise(r => setTimeout(r, 2000));
            }

            let candidateDomains = DomainMatcher.extractDomainsFromText(task.text);

            // [PATCH v0.6 P2] Mat na Buoc 3: deobf dinh nghia DomainMatcher.matchMask() nhung
            // KHONG BAO GIO goi no (dead code) — OCR lay domain co diem cao nhat roi chay luon,
            // OCR doc sai 1 ky tu cung lay domain sai di tiep. O day neu text co mat na (vd
            // 'kqbd***.site') thi domain ung vien BAT BUOC phai khop mat na, neu khong thi
            // DUNG lai, khong doan domain tu ban doc OCR chua chac chan.
            const step3Mask = DomainMatcher.extractMaskFromText(task.text);
            if (candidateDomains.length === 0 || (step3Mask && !candidateDomains.some(d => DomainMatcher.matchMask(d, step3Mask)))) {
                const ocrText = await OCREngine.scanAdvertiserImages();
                if (ocrText) {
                    candidateDomains = candidateDomains.concat(DomainMatcher.extractDomainsFromText(ocrText));
                }
            }
            if (step3Mask) {
                candidateDomains = candidateDomains.filter(d => DomainMatcher.matchMask(d, step3Mask));
                if (candidateDomains.length === 0) {
                    UI.setStatus('OCR không khớp mặt nạ Bước 3 — dừng, không đoán', 'err');
                    UI.enableInput();
                    return;
                }
            }

            console.log('[Link4M] Danh sach domain ung vien:', candidateDomains);

            if (candidateDomains.length > 0) {
                const targetDomain = candidateDomains[0];
                UI.setStatus(`Mục tiêu: ${targetDomain} - Đang kết nối…`, 'info', true);
                UI.urlInput.value = 'https://' + targetDomain;

                await this.runManualUrlBypass('https://' + targetDomain);
            } else {
                UI.setStatus('Hãy nhập URL trang đích vào ô bên dưới', 'info');
                UI.enableInput();
            }
        }
    };

    // [PATCH v0.6] Test hook cho jsdom (khong anh huong chay that): mo cac doi tuong chinh
    // de test mask / fill-only / _traffic_cid_ ma khong can chay het workflow.
    window.__LINK4M_TEST__ = { getClientId, DomainMatcher, OCREngine, Engine, UI, CONFIG, TLDS };

    function bootstrap() {
        if (window.__LINK4M_LOADED__) return;
        window.__LINK4M_LOADED__ = true;
        // [PATCH v0.6 P1] Sinh/luu _traffic_cid_ ngay khi khoi dong (chi luu cuc bo).
        getClientId();
        Engine.runAutoWorkflow();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        bootstrap();
    } else {
        window.addEventListener('DOMContentLoaded', bootstrap);
        window.addEventListener('load', bootstrap);
    }
})();
