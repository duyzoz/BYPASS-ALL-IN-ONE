# 🚀 GTRAFFIC & TRAFFICSO1 BYPASS ALL-IN-ONE (DUYZOZ EDITION)

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-v4.0+-black.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Version](https://img.shields.io/badge/Version-3.5.0-cyan.svg)

**Công cụ bypass tự động nhiệm vụ Traffic chuyên dụng, thông minh & an toàn nhất**  
*Hỗ trợ 3 nền tảng: `trafficso1.com` • `direct.gtraffic.io` • `gtraffic.io`*  
*Giả lập gõ phím & lướt trang người thật • Bắt logo G Đỏ & Xanh • Tự đổi nhiệm vụ khi lỗi*  
*Phát triển bởi **Duyzoz***

[📥 Cài đặt ngay](#-cài-đặt-nhanh-userscript) • [✨ Tính năng 3 nền tảng](#-hỗ-trợ-song-song-3-nền-tảng) • [💬 Discord](#-hỗ-trợ--cộng-đồng)

</div>

---

## 📥 Cài đặt nhanh Userscript

Bấm vào đường link bên dưới để cài đặt trực tiếp vào **Tampermonkey** hoặc **Violentmonkey**:

👉 **[CÀI ĐẶT BYPASS USERSCRIPT v3.5.0 (CLICK ĐỂ UPDATE)](https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/gtraffic.user.js?v=3.5.0)**

*(Nếu bạn đang dùng bản cũ, mở link trên rồi nhấn **Reinstall / Update** để cập nhật lên v3.5.0).*

---

## ✨ Hỗ trợ song song 3 nền tảng

### 1. 🌐 Nền tảng `trafficso1.com` (Mới)
- **Quét CDN & OCR AI thông minh:** Nhận diện ảnh nhiệm vụ từ `cdn.gtraffic.io` với thuộc tính `alt="Anh tim kiem"`.
- **Ghép tên miền Title-Fusion:** Tự động kết hợp tiền tố thương hiệu với tiêu đề bài viết (ví dụ: `Fun88` + `Yoko` ➔ `fun88yoko.com`, `188BET` + `Marandu` ➔ `188betmarandu.com`), khắc phục triệt để tình trạng tên miền bị che vạch đỏ/chấm lửng.
- **Giả lập gõ phím & lướt chuột người thật:** Gõ từng ký tự tên miền chậm rãi vào HUD (75ms/ký tự), dừng 1.2s trước khi mở tab, tự cuộn từng nấc và phát sự kiện rung chuột ngẫu nhiên (`mousemove jitter`) tránh bị hệ thống chống bot nhận diện là máy.

### 2. ⚡ Nền tảng `direct.gtraffic.io` (Auto Leak Domain - Không cần OCR)
- **Tự động trích xuất Domain:** Tự dò thẻ `<span class="notranslate break-all">` ở Bước 1 để lấy trực tiếp domain đích (ví dụ: `rajabandar99.net`) mà không tốn lượt quét OCR.
- **Xử lý nút Logo SVG `#avt-d-btn` / `#trade-d-btn`:**
  - Nhận diện cơ chế delay 2-6 giây của nút lấy mã trên trang web đích.
  - Vòng lặp polling 400ms tự động chờ logo xuất hiện hoàn toàn.
  - Tự động cuộn đến tọa độ nút và kích hoạt chuỗi sự kiện click chuẩn (`pointerdown` ➔ `mousedown` ➔ `mouseup` ➔ `click`).

### 3. 🤖 Nền tảng `gtraffic.io` tiêu chuẩn (OCR AI + Token Caching)
- **OCR AI Engine:** Tự động lấy ảnh Bước 2 gửi API OCR.space nhận diện tên miền chính xác.
- **Pool Database theo Token ảnh:** Mỗi ảnh nhiệm vụ có một Token riêng (`t_...`), đảm bảo quét chính xác từng nhiệm vụ mà không bị gán nhầm domain cũ.

---

## 🔥 Các cải tiến cốt lõi trong v3.5.0

| Tính năng | Chi tiết hoạt động |
|---|---|
| **Human Scroll & Anti-Bot** | Cuộn trang mượt từng đoạn 280-550px, kết hợp `mousemove` ngẫu nhiên giúp kích hoạt mã thật từ file theo dõi `btd.js`. |
| **Bắt Logo G Đa Sắc** | Nhận diện cả **Logo G Đỏ / Cam** (`#E5572D`, `#E3572D`) và **Logo G Xanh** (`#22C55E`, `#10B981`). |
| **Tự động đổi nhiệm vụ** | Nếu trang đích không xuất hiện logo G sau **12 giây**, script tự động bấm nút `[🔄 ĐỔI TỪ KHÓA MỚI]` trên trang chủ để chuyển nhiệm vụ khác. |
| **Đồng bộ thời gian thực** | Bắt SVG đếm ngược `#trade-d-btn__content` hoặc `.logo-dr-svg-us`, đồng bộ số giây còn lại trực tiếp về màn hình HUD chính. |
| **Cyber Vault trả mã** | Khi nhận được mã xác thực, hiển thị khung Cyber Vault neon nổi bật, tự động copy vào Clipboard và tự điền vào ô kết quả. |
| **Anti-Freeze 60 FPS** | Chặn các sự kiện `visibilitychange`, `blur`, `pagehide`, duy trì `requestAnimationFrame` giúp tab ngầm đếm ngược tốc độ tối đa. |

---

## 💬 Hỗ trợ & Cộng đồng

- Báo lỗi hoặc nhận bản cập nhật mới nhất tại Discord: [discord.gg/vnbp](https://discord.gg/vnbp)
