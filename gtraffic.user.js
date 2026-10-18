// ==UserScript==
// @name         GTraffic Bypass (Duyzoz)
// @namespace    https://gtraffic.io/
// @version      2.3.0
// @description  Công cụ bypass tự động GTraffic All-In-One với OCR nhận diện ảnh & chạy tab ngầm lấy mã tự động bởi Duyzoz
// @match        https://gtraffic.io/*
// @match        http://gtraffic.io/*
// @match        *://*/*
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/assets/icon.png
// @author       Duyzoz (@duyzoz)
// @updateURL    https://github.com/duyzoz/BYPASS-ALL-IN-ONE/raw/refs/heads/main/gtraffic.user.js
// @downloadURL  https://github.com/duyzoz/BYPASS-ALL-IN-ONE/raw/refs/heads/main/gtraffic.user.js
// @require      https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/gtraffic.js
// @connect      api.ocr.space
// @connect      cdn.gtraffic.io
// @connect      *
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @grant        GM_addValueChangeListener
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @grant        window.close
// ==/UserScript==

/**
 * GTraffic Bypass All-In-One (Duyzoz Edition)
 * Source repo: https://github.com/duyzoz/BYPASS-ALL-IN-ONE
 * Cài đặt file chính này vào Tampermonkey / Violentmonkey trên trình duyệt.
 */
console.log("[GTraffic Bypass] Userscript Loader v2.3.0 đã sẵn sàng!");
