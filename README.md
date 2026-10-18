# 🚀 GTRAFFIC BYPASS ALL-IN-ONE (DUYZOZ EDITION)

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-v4.0+-black.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Version](https://img.shields.io/badge/Version-2.1.0-cyan.svg)

**Công cụ bypass tự động nhiệm vụ GTraffic chuyên dụng & thông minh nhất**  
*Tích hợp AI OCR nhận diện ảnh, Fake Google Referrer, Chống đóng băng tab ngầm & Tự động lấy mã*  
*Phát triển bởi **Duyzoz***

[📥 Cài đặt ngay](#-cài-đặt-nhanh-userscript) • [✨ Tính năng](#-tính-năng-nổi-bật) • [🔍 Hướng dẫn DevTools](#-hướng-dẫn-soi-ảnh-nhiệm-vụ-trên-firefox-devtools) • [💬 Discord](#-hỗ-trợ--cộng-đồng)

</div>

---

## 📥 Cài đặt nhanh Userscript

Bấm vào đường link bên dưới để cài đặt trực tiếp vào **Tampermonkey** hoặc **Violentmonkey**:

👉 **[CÀI ĐẶT GTRAFFIC BYPASS USERSCRIPT](https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/gtraffic.user.js)**

*(Sau khi bấm, trình duyệt sẽ tự mở màn hình cài đặt của Tampermonkey. Chỉ cần nhấn **Install** là xong).*

---

## ✨ Tính năng nổi bật

### 1. 🤖 Tự động nhận diện ảnh nhiệm vụ bằng OCR.space
- Sử dụng API chính thức của **OCR.space** (`K84564487988957`) với OCR Engine 2 tối ưu hóa độ chính xác.
- Tự động tìm kiếm ảnh nhiệm vụ ở Bước 2, chuyển đổi sang Base64 qua HTML5 Canvas và quét chữ.
- Thuật toán bóc tách Regex tự động nhận diện Domain chuẩn 100% và tiền tố tìm kiếm.

### 2. 🗄️ Hệ thống Key Database & Caching (+Pool)
- Mỗi URL hoặc chiến dịch có một **Key định danh riêng** (lấy từ URL `gtraffic.io/{key}`).
- Khi quét xong, kết quả sẽ được lưu vào cơ sở dữ liệu nội bộ (`+Pool`).
- Lần sau khi gặp lại Key đó, script sẽ **tự động gọi từ Database** mà không cần tốn lượt quét OCR!

### 3. 🛡️ Tab Ngầm Siêu Nhẹ & Chống Đóng Băng (Fix Tab Anti-Freeze)
- Tự động mở website đích ở **chế độ Tab Ngầm (`active: false`)**, người dùng không bị gián đoạn hay nhảy màn hình.
- **Bypass cơ chế dừng đếm ngược:** Ghi đè `EventTarget.addEventListener` (chặn `visibilitychange`, `blur`, `pagehide`), ép `document.hidden = false` và chuyển `requestAnimationFrame` về chu kỳ 16ms (`~60 FPS`). Dù tab đang ẩn, bộ đếm thời gian vẫn chạy với tốc độ tối đa!

### 4. 🌐 Giả mạo nguồn truy cập (Fake Google Referrer)
- Can thiệp ở tầng `document-start`, ép `document.referrer = 'https://www.google.com/'`.
- Giúp website khách hàng tin rằng traffic xuất phát từ việc tìm kiếm tự nhiên trên Google.

### 5. 🎯 Tự động căn giữa & Bấm nút (#avt-btn)
- Tự định vị nút nhận mã `#avt-btn`, viền đỏ cảnh báo, cuộn vào giữa màn hình.
- Giả lập chuỗi sự kiện chuột (`mousedown` ➔ `mouseup` ➔ `click`) để kích hoạt đếm ngược.

### 6. ⏱️ Đồng bộ thời gian thực & Tự động sao chép mã
- Tab ngầm liên tục bắn số giây còn lại (`PING`) về Tab Mẹ GTraffic, hiển thị Badge tiến độ: `Đang ủ (KEY): 45s`.
- Khi đếm xong, mã được tự động lưu vào Clipboard, điền tự động vào ô xác nhận của GTraffic và tự đóng tab ngầm sau 2 giây.

---

## 🖥️ Giao diện Cyber HUD (Duyzoz Edition)

Giao diện được thiết kế hiện đại chuẩn Cyberpunk / Glassmorphism:
- **Badge trạng thái:** Hiển thị `Sẵn sàng`, `Đang quét OCR...`, `Đang ủ (KEY): XXs`, `Hoàn thành!`.
- **Nút "Quét lại" / "Quét Key":** Thao tác thủ công hoặc ép quét lại ảnh nếu cần.
- **Nút "Lấy mã ngay":** Kích hoạt mở tab ngầm làm nhiệm vụ.
- **Nút "+Pool":** Quản lý danh sách Key & URL đã lưu trữ trong database.
- **Hộp Console Log:** Cập nhật diễn biến từng bước minh bạch.

---

## 🔍 Hướng dẫn soi ảnh nhiệm vụ trên Firefox DevTools

Nếu bạn muốn kiểm tra xem ảnh nhiệm vụ trả về từ đâu trong backend của GTraffic:

1. Mở trang nhiệm vụ `https://gtraffic.io/...` trên Firefox.
2. Nhấn phím `F12` (hoặc chuột phải chọn **Kiểm tra / Inspect**).
3. **Kiểm tra DOM (Thẻ Inspector):**
   - Bấm vào biểu tượng con trỏ góc trái DevTools ➔ chỉ vào ảnh kết quả Google ở Bước 2.
   - Bạn sẽ thấy thẻ `<img src="...">` nằm trong thẻ cha chứa chữ `"Bước 02"`.
4. **Kiểm tra Network (Thẻ Mạng):**
   - Chuyển sang tab **Mạng (Network)** ➔ Chọn bộ lọc **Ảnh (Images)** hoặc **Fetch/XHR**.
   - Tải lại trang (F5): Bạn sẽ thấy các request gọi ảnh nhiệm vụ và API chi tiết của chiến dịch.

---

## 💬 Hỗ trợ & Cộng đồng

- **Tác giả:** Duyzoz
- **Discord:** [Tham gia Discord nhận bản cập nhật](https://discord.gg/vnbp)
- **Bản quyền:** MIT License © 2026 Duyzoz
