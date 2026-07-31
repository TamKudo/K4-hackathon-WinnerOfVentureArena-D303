# LectureFocus prototype

Prototype chính: **React (Vite) — Bento Studio** trong `web/`.

## Chạy demo

```bash
cd codebase/web
npm install
npm run dev
```

Mở http://localhost:5173

## Data boundary

| File | Commit? | Nội dung |
|---|---|---|
| `web/src/data/concepts.json` | Có | Lesson + concepts + quote/citation ngắn |
| `web/public/data/transcripts.local.json` | **Không** | Transcript đầy đủ theo segment |

Nếu thiếu transcript local, app vẫn chạy ở chế độ quote-only (Sheet chỉ hiện trích dẫn gắn evidence).

Sao chép transcript local (máy demo):

```bash
cp data/lecturefocus-transcripts.local.json web/public/data/transcripts.local.json
```

## Flow

Landing → Tổng quan → Bài học → Bản đồ ôn tập → Chi tiết khái niệm → panel Bài giảng (highlight + TTS).

## Ghi chú mock

- Bản đồ ôn tập dựng tay từ transcript (chưa gọi AI).
- “Hỏi AI về phần này” là mock.
- TTS = `speechSynthesis` đọc text quote/segment trên trình duyệt, không phải audio/timestamp giảng viên.
- `lecturefocus.html` và NiceGUI cũ không còn là prototype chính.
