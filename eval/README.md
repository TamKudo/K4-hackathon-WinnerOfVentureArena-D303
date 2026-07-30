# eval/ — Kiểm thử Review Map (LectureFocus)

## Nội dung

- `golden-set.md` — 36 case kiểm thử (≥20 yêu cầu), xây tay trên `data/vlearn-pack/transcript/transcript-04-clean.md` (Day 1 — Foundation). Mỗi case có quy tắc pass/fail cụ thể để hai người chấm độc lập ra cùng kết quả.
- `run-1/` — kết quả lượt gọi AI thật đầu tiên (sinh sau khi chạy script), gồm:
  - `ai-output.json` — Review Map do model sinh ra
  - `trace.json` — log đầy đủ: system prompt, model, thời điểm, raw response từ OpenRouter
  - `citation-check.json` — kết quả kiểm tra tự động: mọi `segmentId`/`quote` model trích có thật trong transcript không (lớp chỗ khó ① Nguồn sự thật)
- `run-1-results.md` — bảng chấm 36 case theo golden set, đối chiếu quality bar trong `spec.md` §7.

## Cách chạy lượt AI thật

Yêu cầu: Node.js ≥18 (đã có `fetch` built-in), một API key Groq (https://console.groq.com/keys).

```
# PowerShell
$env:GROQ_API_KEY = "gsk_..."
node codebase/generate-review-map.mjs

# Bash
export GROQ_API_KEY=gsk_...
node codebase/generate-review-map.mjs
```

Free tier Groq giới hạn 6.000-12.000 token/phút, trong khi cả transcript ~20.000 token — script tự chia thành nhiều lô nhỏ và gọi AI 2 vòng (vòng 1: rút khái niệm nháp theo từng lô · vòng 2: gộp thành Review Map cuối), có tự động chờ/thử lại khi bị rate limit. Có thể đổi model bằng `GROQ_MODEL` (mặc định `llama-3.3-70b-versatile`) hoặc đổi kích thước lô bằng `CHUNK_SIZE` (mặc định 18 đoạn/lô). Script không hardcode bất kỳ khái niệm/tier nào — toàn bộ `ai-output.json` là kết quả model sinh ra tại thời điểm chạy, khác nhau giữa các lượt.

## Quality bar (từ `spec.md` §7)

- ≥70% case trong golden set đạt (pass)
- 100% case không chứa khái niệm bịa đặt hoặc lời tuyên bố vượt phạm vi (nhóm ① và ③ phải đạt tuyệt đối)
