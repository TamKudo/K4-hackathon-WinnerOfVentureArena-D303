# LectureFocus — bản có backend (dùng cho vòng validation + demo trực tiếp)

Bản thứ hai của prototype, song song với `codebase/lecturefocus.html`. Cùng lát cắt, nhưng UI
(`client/`) fetch dữ liệu qua API từ server (`server/`) thay vì đọc biến JS nhúng cứng — cần
bản này để có link deploy cho willing user bấm thử thật ở CP5 (`lecturefocus.html` chỉ chạy
local, không đưa link được).

Server có hai đường dữ liệu:

- `GET /api/lessons`, `GET /api/lessons/:id` — serve lại dữ liệu tĩnh đã có (`server/data/lessons.json`,
  sinh từ `eval/run-2/ai-output.json` cùng nguồn với bản HTML) cho 2 bài học catalog (Day 1, Day 2).
- `POST /api/generate` — **gọi AI thật lúc runtime**, dùng cho màn "Demo trực tiếp" trên client.
  Nhận `{ transcriptId }` là 1 trong 6 transcript có sẵn ở `data/vlearn-pack/transcript/` (không
  nhận text tự do từ client, để tránh tốn quota Groq ngoài kiểm soát), chạy qua
  `codebase/lib/reviewMapGenerator.mjs` (dùng chung với `codebase/generate-review-map.mjs`), trả
  kết quả trực tiếp — không cache, mỗi lần bấm là một lượt gọi AI mới. Dựng để đáp ứng CP6:
  "giám khảo chạy 1 case lạ tại chỗ" (`04-rubric.md`). Xem `spec.md` §4/§9.

## Chạy local

Cần `GROQ_API_KEY` cho server (chỉ `/api/generate` dùng, `/api/lessons` không cần):

```
# Terminal 1 — server (port 8787)
cd codebase/webapp/server
npm install
$env:GROQ_API_KEY = "gsk_..."   # PowerShell — hoặc export GROQ_API_KEY=gsk_... (bash)
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

## Cập nhật dữ liệu catalog (Day 1/Day 2)

Nếu chạy lượt AI mới cho transcript Day 1 (`eval/run-N/ai-output.json`), cập nhật
`lecturefocus.html` trước bằng `node codebase/wire-ai-output-to-ui.mjs eval/run-N/ai-output.json`,
sau đó trích lại `DATA` từ file đó để refresh `server/data/lessons.json` — chưa tự động hoá bước
này vì chỉ có 1 lượt cần đồng bộ tính tới thời điểm hiện tại.

Đường `/api/generate` không cần bước này — nó gọi AI thật trực tiếp, không đọc `lessons.json`.

## Deploy (Render)

`render.yaml` ở gốc repo đã cấu hình sẵn (Blueprint). Sau khi deploy lần đầu, vào Render
dashboard → service `lecturefocus-webapp` → **Environment** → thêm `GROQ_API_KEY` (không nằm
trong `render.yaml` vì không commit key vào repo — khai báo `sync: false` nên Render sẽ hỏi nhập
tay). Thiếu key thì `/api/lessons` vẫn chạy bình thường, chỉ `/api/generate` báo lỗi 500.
