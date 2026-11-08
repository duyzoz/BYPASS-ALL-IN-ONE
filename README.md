# Link4m Remake — PURE DEOBF (theo lệnh Ethan 2026-11-08)

File `link4m-remake.user.js` hiện là **bản sao y nguyên 100%** file
`link4m.full.deobf.user.js` của Dut (`Dut3ufegfeu/link4m`, commit
`f162b85`, 1.430 dòng, md5 `00d881bc622ac81963d71f7d9c044047`) — **không thêm,
không sửa, không patch gì hết**, theo lệnh của Ethan: chỉ làm userscript.

## Hai hành vi gốc cần biết trước khi test (đã chứng minh live)

1. **Tự nộp (auto-submit):** deobf tự gọi `submitFinalLink()` ngay khi
   widget trả mã về (dòng ~1366), POST tới `/links/get-link-info`. Lệnh cũ
   "chỉ điền, không tự nộp" đã bị lệnh mới này thay thế.
2. **Regex lấy mã:** bước verify dùng regex lấy token alnum đầu tiên
   (`/["']?([A-Za-z0-9_-]{5,25})["']?/`, dòng ~1252). Response JSON bắt đầu
   bằng `{"success":true,...}` nên mã lấy về sẽ là chữ `success` — đã thấy
   live ở bản v0.6.2.

## Khôi phục bản patch (nếu cần)

Bản patch cuối (v0.6.5: fill-only, OCR mask gate, `_traffic_cid_`,
cache-bust, loại trừ widget key) còn nguyên trong lịch sử git của repo này
tại commit `d2506ef`. Muốn quay lại thì báo tao.

## Test cũ

`test-link4m-remake.js` đã ngừng dùng — nó test các patch đã bị xóa. Nội
dung test cũ cũng còn trong lịch sử git tại commit `d2506ef`.
