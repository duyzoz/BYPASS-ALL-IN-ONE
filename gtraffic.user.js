// ==UserScript==
// @name         GTraffic Bypass (Duyzoz)
// @namespace    https://gtraffic.io/
// @version      2.4.0
// @description  Bypass tự động GTraffic - OCR nhận diện ảnh, tab ngầm đếm ngược, tự copy mã
// @match        https://gtraffic.io/*
// @match        http://gtraffic.io/*
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/assets/icon.png
// @author       Duyzoz
// @updateURL    https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/gtraffic.user.js
// @downloadURL  https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/gtraffic.user.js
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

// Loader – core logic nằm trong gtraffic.js (required ở trên)
// Tampermonkey tự inject @require trước khi chạy file này
