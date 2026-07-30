# LectureFocus — bản có backend (dùng cho vòng validation)

Bản thứ hai của prototype, song song với `codebase/lecturefocus.html`. Cùng lát cắt, cùng
dữ liệu (`eval/run-2/ai-output.json` cho Day 1), nhưng UI (`client/`) fetch dữ liệu qua API
từ server (`server/`) thay vì đọc biến JS nhúng cứng — cần bản này để có link deploy cho
willing user bấm thử thật ở CP5 (`lecturefocus.html` chỉ chạy local, không đưa link được).

`server/` không tự gọi AI lúc runtime — chỉ đọc lại `server/data/lessons.json` (dữ liệu tĩnh,
sinh từ `codebase/wire-ai-output-to-ui.mjs` cùng nguồn dữ liệu với bản HTML). Xem `spec.md` §4/§9.

## Chạy local

```
# Terminal 1 — server (port 8787)
cd codebase/webapp/server
npm install
npm run dev

# Terminal 2 — client (port 5173, proxy /api sang :8787)
cd codebase/webapp/client
npm install
npm run dev
```

Hoặc chạy một service duy nhất (giống lúc deploy): build client rồi để server tự serve luôn
bản build (xem `server/index.js`, phần `express.static`):

```
cd codebase/webapp/client && npm run build
cd ../server && npm start
# mở http://localhost:8787
```

## Cập nhật dữ liệu

Nếu chạy lượt AI mới (`eval/run-N/ai-output.json`), cập nhật `lecturefocus.html` trước bằng
`node codebase/wire-ai-output-to-ui.mjs eval/run-N/ai-output.json`, sau đó chạy lại đoạn trích
DATA (xem lịch sử commit script trích) để refresh `server/data/lessons.json` — chưa tự động hoá
bước này vì chỉ có 1 lượt cần đồng bộ tính tới thời điểm hiện tại.

## Deploy

Chưa deploy — cần chọn nền tảng (Render/Fly/Railway cho server, hoặc gộp chung một service)
và đăng nhập tài khoản, việc này cần làm thủ công.
