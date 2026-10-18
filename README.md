# 🚀 GTRAFFIC BYPASS ALL-IN-ONE (DUYZOZ EDITION)

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-v4.0+-black.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Version](https://img.shields.io/badge/Version-3.2.0-cyan.svg)

**Công cụ bypass tự động nhiệm vụ GTraffic chuyên dụng & thông minh nhất**  
*Hỗ trợ song song cả 2 nền tảng: `gtraffic.io` (OCR AI) & `direct.gtraffic.io` (Auto Leak Domain)*  
*Phát triển bởi **Duyzoz***

[📥 Cài đặt ngay](#-cài-đặt-nhanh-userscript) • [✨ Tính năng 2 nền tảng](#-hỗ-trợ-song-song-2-nền-tảng) • [💬 Discord](#-hỗ-trợ--cộng-đồng)

</div>

---

## 📥 Cài đặt nhanh Userscript

Bấm vào đường link bên dưới để cài đặt trực tiếp vào **Tampermonkey** hoặc **Violentmonkey**:

👉 **[CÀI ĐẶT GTRAFFIC BYPASS USERSCRIPT v3.2.0](https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/gtraffic.user.js?v=3.2.0)**

*(Nếu bạn đang dùng bản cũ, mở link trên rồi nhấn **Reinstall / Update** để cập nhật lên v3.2.0).*

---

## ✨ Hỗ trợ song song 2 nền tảng

### 1. ⚡ Nền tảng `direct.gtraffic.io` (Auto Leak Domain - Không cần OCR)
- **Tự động bóc tách Domain:** Tự dò thẻ `<span class="notranslate break-all">` ở Bước 1 để lấy trực tiếp domain đích (ví dụ: `rajabandar99.net`) mà không tốn lượt quét OCR!
- **Mở tab ngầm tự động:** Khởi chạy trang đích trong tab ngầm siêu nhẹ.
- **Xử lý nút Logo SVG `#avt-d-btn` / `#trade-d-btn`:**
  - Nhận diện cơ chế delay 2-6 giây của nút lấy mã trên trang web đích.
  - Vòng lặp polling 400ms tự động chờ logo xuất hiện hoàn toàn.
  - Tự động cuộn đến tọa độ nút và kích hoạt chuỗi sự kiện click chuẩn (`pointerdown` ➔ `mousedown` ➔ `mouseup` ➔ `click`).
- **Đọc đếm ngược SVG `#trade-d-btn__content`:** Đồng bộ thời gian thực về HUD.
- **Tự động lấy mã & điền form:** Khi hết giờ, tự copy mã vào Clipboard và điền tự động vào ô xác nhận của `direct.gtraffic.io`.

### 2. 🤖 Nền tảng `gtraffic.io` tiêu chuẩn (OCR AI + Token Caching)
- **OCR AI Engine 2:** Tự động lấy ảnh Bước 2 gửi API OCR.space nhận diện tên miền.
- **Xử lý domain bị che:** Thuật toán Regex thông minh bóc tách các domain bị che dấu chấm/vạch đỏ dạng `188betm...com` hoặc ghép với từ khóa thương hiệu.
- **Pool Database theo Token ảnh:** Mỗi ảnh nhiệm vụ có một Token riêng (`t_...`), đảm bảo quét chính xác từng nhiệm vụ mà không bị gán nhầm domain cũ.

### 3. 🛡️ Tab ngầm chống đóng băng (Anti-Freeze) & Fake Google Referrer
- **Fake Google Referrer:** Ép `document.referrer = 'https://www.google.com/'` ở `document-start`.
- **Anti-Freeze:** Chặn các sự kiện `visibilitychange`, `blur`, `pagehide`, duy trì `requestAnimationFrame` 60 FPS giúp tab ngầm đếm ngược tốc độ tối đa dù đang ẩn.

---

## 💬 Hỗ trợ & Cộng đồng

- Báo lỗi hoặc nhận bản cập nhật mới nhất tại Discord: [discord.gg/vnbp](https://discord.gg/vnbp)
