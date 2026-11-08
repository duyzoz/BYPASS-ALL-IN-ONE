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

---

## 🔗 Link4m Bypass — Remake v0.6.0 (Mới)

**File:** [`link4m-remake.user.js`](https://raw.githubusercontent.com/duyzoz/BYPASS-ALL-IN-ONE/main/link4m-remake.user.js)

Remake từ bản deobf Link4m (n1ulls) — giữ 100% UI cyberpunk + luồng gốc (widget init → get_quest_code → step 2 → verify, OCR.space + Tesseract), kèm 3 patch v0.6:

- **P1 `_traffic_cid_`**: tự sinh + lưu id cục bộ (`cid-...`); chưa gắn vào request nào — vị trí trên dây đợi soi tab Network live trên link4m.org/go/VDcp1.
- **P2 Kiểm tra mặt nạ Bước 3**: domain OCR phải khớp mặt nạ (vd `kqbd***.site`), không khớp thì dừng, không đoán.
- **P3 Chỉ điền mã**: lấy mã qua widget rồi điền vào ô code, KHÔNG tự nộp, KHÔNG tự giải captcha — bro tự bấm nút **Nộp ngay** + tự giải captcha để ra link đích.

**Cài đặt:** mở link raw trên, Tampermonkey sẽ hỏi cài đặt; cập nhật tự động qua `@updateURL` khi có bản mới.

**Test:** `node --check` + jsdom 36/36 PASS (mask / fill-only / `_traffic_cid_` / cấu trúc). Chưa test live — test thật trên link4m.org/go/VDcp1 bằng Chrome của bro.

### v0.6.1 — fix lỗi mạng trên trang đích có Cloudflare (vd 789-club.cc)

Nguyên nhân gốc (chứng minh live 2026-11-08): trang đích đứng sau Cloudflare — request kiểu bot (`Accept: */*`, không Referer) bị cắt kết nối tận gốc (HTTP 000 = `onerror` trong GM_xhr), trong khi tab Chrome thật mở ngon (navigation + cookie `cf_clearance`). Domain đúng, widget còn sống, Tampermonkey không chặn gì cả.

- httpReq đổi sang header giống trình duyệt thật (`Accept: text/html...`, thêm `Referer` từ trang link4m, bỏ `Cache-Control`/`Pragma: no-cache`).
- Gặp 403 + trang thử thách Cloudflare thì báo rõ: "Trang đích chặn bot (Cloudflare) — mở tab trang đích qua kiểm tra 1 lần rồi bấm Bắt đầu lại" (GM_xhr gửi kèm cookie `cf_clearance` nên mở tab qua kiểm tra trước rồi bấm lại có thể qua).
- Lỗi mạng giờ kèm luôn URL bị lỗi để nhìn là biết chết ở đâu.

**Test:** `node --check` + jsdom 42/42 PASS (36 cũ + 6 mới: header / 403 Cloudflare / lỗi kèm URL). Live vẫn cần bro test lại trên VDcp1.

### v0.6.2 — đường vòng khi Cloudflare chặn cả header trình duyệt

v0.6.1 đổi header vẫn lỗi y cũ trên 789-club.cc (bro test live 2026-11-08, badge v0.6.1, lỗi `Loi mang khi gui request — URL: https://789-club.cc/`): tường lửa chặn ở mức TLS/fingerprint, không phải mức header — request từ GM_xhr chết trước cả khi có HTTP response.

- Thêm ô **dán tay URL widget** (hiện ra khi tải trang đích lỗi): mở tab trang đích → Ctrl+U xem source → tìm dòng `widget/service.js?key=` → copy nguyên URL dán vào ô → bấm **Chạy widget**. Script bỏ qua bước GET trang đích, chạy thẳng luồng widget (init → get_quest_code → step 2 → verify) rồi điền mã như cũ, không tự nộp.
- Lưu ý: nếu host widget cũng đứng sau Cloudflare thì bước chạy widget sẽ lỗi mạng tiếp — lúc đó panel sẽ báo rõ domain widget bị lỗi, mình tính tiếp.

**Test:** `node --check` + jsdom 54/54 PASS (42 cũ + 12 mới: parse URL widget / hiện ô fallback / chạy widget không cần GET trang / URL sai báo rõ). Live cần bro test với URL widget thật từ view-source 789-club.cc.

### v0.6.3 — fix mã lấy về chỉ là chữ "success"

Bro test live 2026-11-08: luồng chạy hết (đếm chờ xong bước 1), nhưng mã điền vào ô chỉ là `success`. Nguyên nhân: regex cũ trong bước verify lấy **token alnum đầu tiên** trong response — response JSON bắt đầu bằng `{"success":true,...}` nên nó lấy luôn chữ `success` làm mã. Cùng dạng lỗi "first-token" của Dut mà v0.5 từng sửa.

- `extractVerifyCode` mới: JSON.parse rồi đọc field `code`/`quest_code` (kể cả `data.*`) trước; không có thì quét token nhưng **bỏ qua từ khóa JSON** (`success`, `status`, `result`...); cuối cùng mới lấy `sessionData.code`. Không có gì khớp thì trả rỗng, không đoán.
- Chỉ log **tên field** của response verify ra console (F12) để chẩn đoán, không log giá trị mã thật.

**Test:** `node --check` + jsdom 63/63 PASS (54 cũ + 9 mới: unit parser 7 ca + e2e luồng widget thật trả mã đúng). Bro test lại trên nhiệm vụ đang làm (NG1kcqm1): mã điền vào ô phải là mã thật, không còn là `success` nữa.

### v0.6.4 — ô mã trên trang nuốt mất 1 ký tự

Bro test live 2026-11-08: mã lấy về là mã thật (`u00f4ng`, 7 ký tự, widget báo success), panel cũng hiện đủ 7 ký tự — nhưng ô mã trên trang chỉ còn `u00f4n` (6 ký tự) nên trang báo "Mã không hợp lệ hoặc đã hết hạn". Lần bấm nút xanh đó chỉ gửi mã thiếu, mã thật 7 ký tự chưa bị dùng.

- Điền mã bằng **native setter** (input kiểu React/Vue chỉ cập nhật state khi giá trị đi qua setter gốc, gán `.value` thường bị bỏ qua).
- Đọc lại ngay sau khi điền: nếu ô trên trang nhận thiếu ký tự thì panel báo rõ `Ô mã trên trang chỉ nhận 6/7 ký tự` và chỉ bro bấm **Nộp ngay** trong panel (nó POST mã đầy đủ + token captcha, không đọc ô trên trang).

**Thử ngay với v0.6.3 (không cần đợi update):** giải captcha trên trang trước, rồi bấm **Nộp ngay** trong panel — nó gửi đúng mã `u00f4ng` đầy đủ. Nếu vẫn báo sai mã thì mã lấy về có vấn đề thật, báo lại cho tao.

**Test:** `node --check` + jsdom 70/70 PASS (63 cũ + 7 mới: phát hiện cắt ký tự / native setter / cảnh báo + giữ mã đầy đủ).

### v0.6.5 — mã nào cũng là `u00f4ng` (bịa mã)

Bro test live 2026-11-08: đổi nhiệm vụ mới (niềng răng / nhakhoadangluu) mà mã vẫn `u00f4ng` y cũ — mã này không phải mã thật. Nghi phạm chính: verify response echo lại **widget key** (id của widget, giống nhau mọi nhiệm vụ), vd `{"success":true,"key":"u00f4ng",...}` mà không có field code — parser cũ quét token thì vớ luôn giá trị key làm mã (tên field `key` chỉ có 3 ký tự nên regex bỏ qua, lấy luôn giá trị).

- `extractVerifyCode` thêm tham số loại trừ: widget **key + session không bao giờ được tính là mã**; đọc thêm field `token`/`captcha_code`/`code_text`/`questcode`/`passcode` và `result`/`data` dạng chuỗi; chỉ có key mà không có mã thật thì trả rỗng, không bịa.
- Chống cache: mọi GET widget thêm `&_t=timestamp` (v0.6.1 bỏ header no-cache nên trình duyệt có thể trả response widget cũ).
- Status khi điền mã xong hiện tên widget domain để chụp ảnh là thấy mã lấy từ widget nào.

**Test:** `node --check` + jsdom 80/80 PASS (70 cũ + 10 mới: loại trừ key/session / token + result chuỗi / cache-bust / e2e). Bro update rồi chạy lại nhiệm vụ mới: mã phải khác nhau mỗi nhiệm vụ. Nếu vẫn `u00f4ng`, mở F12 coi dòng `Verify response keys` và báo lại tên field cho tao (chỉ tên field, không gửi mã).
