# 🚀 BYPASS ALL-IN-ONE TOOL (JavaScript & Tampermonkey Edition)

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-v4.0+-black.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Version](https://img.shields.io/badge/Version-2.0.0-orange.svg)

**Công cụ bypass link rút gọn & nhiệm vụ traffic tự động đa nền tảng**  
*Phiên bản nâng cấp toàn diện bằng JavaScript & Userscript HUD Glassmorphism bởi **Duyzoz***

[📖 Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng) • [⚡ Cài đặt](#-cài-đặt-nhanh) • [🎨 Giao diện HUD](#-tính-năng-tampermonkey-hud) • [🤝 Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục lục

- [🌟 Tính năng nổi bật](#-tính-năng-nổi-bật)
- [🎨 Tính năng Tampermonkey HUD](#-tính-năng-tampermonkey-hud)
- [⚡ Cài đặt nhanh](#-cài-đặt-nhanh)
- [🎯 Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
  - [1. Chạy CLI bằng JavaScript (Node.js)](#1-chạy-cli-bằng-javascript-nodejs)
  - [2. Cài đặt Userscript cho Trình duyệt](#2-cài-đặt-userscript-cho-trình-duyệt)
- [🔧 Các nền tảng được hỗ trợ](#-các-nền-tảng-được-hỗ-trợ)
- [🚀 Cách tự động Push lên GitHub](#-cách-tự-động-push-lên-github)
- [📄 Giấy phép](#-giấy-phép)
- [⭐ Star History](#-star-history)

---

## 🌟 Tính năng nổi bật

### ✨ **Đa dạng phương thức hoạt động**
1. **Node.js CLI (`bypass_tool.js`)**: Chạy trực tiếp từ dòng lệnh máy tính, giải mã nhanh chóng không cần mở trình duyệt.
2. **In-Browser HUD Userscript (`bypass_hud.user.js`)**: Tiêm giao diện Glassmorphism che toàn bộ trang rút gọn, giữ phiên ngầm an toàn 60–70s, tự động lấy và điền mã.

### 🛡️ **Cải tiến trong phiên bản v2.0 của Duyzoz**
- 🚀 **Viết lại 100% bằng JavaScript**: Tối ưu hóa hiệu năng, tương thích hoàn toàn với hệ sinh thái Node.js và Browser.
- 🎨 **Giao diện HUD Cyber/Glassmorphism**: Đè mờ trang web gốc, ẩn mọi quảng cáo độc hại và pop-up rác.
- ⏱️ **Safe Countdown Controller**: Giữ thời gian chờ 60–70s chuẩn xác giúp tránh bị hệ thống backend phát hiện gian lận hoặc chặn IP.
- 🔓 **Giải mã động & XOR Native**: Tự động giải mã chuỗi Base64 và thuật toán XOR chuỗi trực tiếp.
- 📋 **Tự động sao chép & Auto-fill**: Tự động đưa mã vào Clipboard và submit form khi hoàn thành.

---

## 🎨 Tính năng Tampermonkey HUD

Khi cài đặt file `bypass_hud.user.js` vào tiện ích Tampermonkey hoặc Violentmonkey:
- **Không cần chuyển sang web khác**: Script sử dụng `GM_xmlhttpRequest` để kích hoạt nhiệm vụ ngầm ở chế độ background.
- **Tiến trình trực quan**: Hiển thị thanh tiến trình đếm ngược kèm log chi tiết từng bước.
- **Tự động điền biểu mẫu**: Tự tìm ô nhập mã trên trang rút gọn và tự động bấm nút tiếp tục.

---

## ⚡ Cài đặt nhanh

### Yêu cầu
- Đối với CLI: **Node.js 18+**
- Đối với Trình duyệt: Tiện ích **Tampermonkey** hoặc **Violentmonkey** trên Chrome/Firefox/Edge.

### 1. Tải Repository
```bash
git clone https://github.com/duyzoz/BYPASS-ALL-IN-ONE.git
cd BYPASS-ALL-IN-ONE
```

---

## 🎯 Hướng dẫn sử dụng

### 1. Chạy CLI bằng JavaScript (Node.js)

Khởi động công cụ:
```bash
node bypass_tool.js
```
Hoặc:
```bash
npm start
```

**Menu điều khiển:**
```
============================================================
       BYPASS SHORT LINK ALL-IN-ONE (JS EDITION)
       Tác giả: Duyzoz
       Repo: https://github.com/duyzoz/BYPASS-ALL-IN-ONE
============================================================

Các chế độ hỗ trợ:
  [1] YeuMoney  - Bypass nhiệm vụ YeuMoney / Traffic-User
  [2] Link4M    - Bypass link traffic Link4M (What-on)
  [3] FunLink   - Bypass link FunLink.io
  [4] LinkTot   - Bypass link LinkTot.net (XOR Decrypt)
  [5] Link4Sub  - Bypass link Link4Sub.com (Instant)
  [6] LaymaNet  - Bypass link LayMa.net
  [0] Thoát
============================================================
```

### 2. Cài đặt Userscript cho Trình duyệt
Bạn có thể cài đặt trực tiếp vào Tampermonkey qua URL:
👉 **[Cài đặt Bypass HUD UserScript](https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/bypass_hud.user.js)**

Hoặc cài thủ công:
1. Mở tiện ích mở rộng [Tampermonkey](https://www.tampermonkey.net/) trên trình duyệt.
2. Chọn **Tiện ích $\to$ Thêm script mới (Add a new script)** hoặc **Cài đặt từ URL (Install from URL)**.
3. Dán đường link:
   ```
   https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/bypass_hud.user.js
   ```
4. Bấm **Install** (Cài đặt).
5. Khi bạn truy cập vào các trang LayMa.net hoặc Link4Sub, script sẽ tự động kích hoạt giao diện **Made by Duyzoz ✦** đè trực tiếp sạch sẽ (không làm mờ trang web).

---

### 🔥 Tính năng đặc sắc V3.2.0 (Duyzoz Edition):
- 💎 **Đè trực tiếp lên trang (Clean In-Page DOM)**: Loại bỏ hoàn toàn lớp mờ toàn màn hình gây khó chịu. Toàn bộ nội dung rác cũ của Layma được xóa/ẩn sạch sẽ, nhường chỗ cho giao diện hiện đại với hiệu ứng Shimmer gradient độc quyền.
- 🎯 **Nhận diện nhiệm vụ qua ảnh thông minh (Image-to-Quest AI Mapping)**: Nhận diện hơn 47+ ảnh nhiệm vụ Layma, tự động chuyển đổi sang URL đích.
- 🔁 **Tự động đổi nhiệm vụ lỗi & Blacklist**: Tự động lọc các trang web lỗi hoặc blacklist (`codecubicle`, `aligninterio`), tự động click đổi nhiệm vụ cho tới khi tìm được link bypass ngon.
- 🛡️ **Chuẩn quy trình QCaptcha 2 bước**:
  - **Bước 1**: Đếm ngược thật theo phiên backend $\to$ Hiện QCaptcha giải mã $\to$ Tự động gửi API nhận mã code.
  - **Bước 2**: Tự động điền mã $\to$ Xác thực QCaptcha nộp mã $\to$ Click nút hoàn tất và hiển thị link đích.
- ⚡ **Link4Sub True Instant Bypass**: Tự động đọc payload Base64 và chuyển hướng ngay lập tức mà không cần click sub/like.

## 🔧 Các nền tảng được hỗ trợ

| Nền tảng | Phương thức xử lý | Thời gian chờ | Tự động hóa |
| :--- | :--- | :--- | :--- |
| **Link4Sub** | Giải mã Base64 + URL unquote trực tiếp | **0 giây** | ⚡ Tức thì |
| **LinkTot** | Ping ngầm + Giải mã thuật toán XOR (`1ThDrStTr`) | 80 giây | 🔄 Tự động |
| **FunLink** | Khởi tạo phiên ngầm + Giả lập device fingerprint | 60 giây | 🔄 Tự động |
| **YeuMoney** | Gọi API traffic-user với mã xác thực | Nhanh chóng | 🔄 Tự động |
| **Link4M** | Đọc session từ widget What-on JS | 90 giây | 🔄 Tự động |
| **LaymaNet** | Lấy campaign token và trích xuất HTML code | Nhanh chóng | 🔄 Tự động |

---

## 🚀 Cách tự động Push lên GitHub

Dự án tích hợp sẵn công cụ đẩy mã nguồn tự động thông qua GitHub REST API (không yêu cầu cài đặt phần mềm Git):

```bash
python push_to_github.py
```
> Nhập GitHub Personal Access Token (PAT) có quyền `repo` khi được hỏi để đồng bộ tất cả mã nguồn lên repo [duyzoz/BYPASS-ALL-IN-ONE](https://github.com/duyzoz/BYPASS-ALL-IN-ONE).

---

## 📄 Giấy phép

Phát hành dưới giấy phép [MIT License](LICENSE).  
Bản quyền thuộc về **Duyzoz** (2024–2026).

---

## ⭐ Star History

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=duyzoz/BYPASS-ALL-IN-ONE&type=Date)](https://star-history.com/#duyzoz/BYPASS-ALL-IN-ONE&Date)

**⚡ Developed with passion by Duyzoz**

</div>
