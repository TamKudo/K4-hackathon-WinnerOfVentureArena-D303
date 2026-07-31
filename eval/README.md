# eval/ — Kiểm thử Review Map (LectureFocus)

## Nội dung

- `golden-set.md` — 36 case kiểm thử (≥20 yêu cầu), xây tay trên `data/vlearn-pack/transcript/transcript-04-clean.md` (Day 1 — Foundation). Mỗi case có quy tắc pass/fail cụ thể để hai người chấm độc lập ra cùng kết quả.
- `run-1/` … `run-5/` — kết quả 5 lượt gọi AI thật (sinh sau khi chạy script), mỗi thư mục gồm:
  - `ai-output.json` — Review Map do model sinh ra
  - `candidates.json` — khái niệm nháp từ vòng 1 (extract), trước khi gán tier/gộp
  - `tagged-candidates.json` — candidate sau khi AI gán tier (từ lượt 3, khi tách vòng gộp)
  - `trace.json` — log đầy đủ: model, cấu hình lô, số lời gọi AI, usage, thời điểm
  - `citation-check.json` — kiểm tra tự động: mọi `segmentId`/`quote` model trích có thật trong transcript không (lớp chỗ khó ① Nguồn sự thật)
- `run-1-results.md` … `run-5-results.md` — bảng chấm 36 case theo golden set từng lượt, đối chiếu quality bar trong `spec.md` §7.

## Diễn biến 5 lượt

| Lượt | % đạt | Thay đổi chính | Lời gọi AI |
|---|---|---|---|
| 1 | 46,9% (15/32) | Lượt đầu, chunk cố định 18 đoạn | 7 (6 extract + 1 consolidate) |
| 2 | 59,4% (19/32) | Chunk theo heading, giới hạn core, ví dụ hedge | 7+ |
| 3 | 48,5% (16/33) | Tách vòng gộp: AI chỉ gán tier, gộp bằng code | 10 (đủ cả 2 vòng) |
| 4 | 57,6% (19/33) | Nới điều kiện gộp — chưa có tác dụng | 1 (dùng lại candidate) |
| 5 | **63,6% (21/33)** | Gộp theo tập từ lõi — hoạt động (26→21) | 1 (dùng lại candidate) |

**Số liệu chính thức: lượt 5 — 63,6%, chưa đạt bar 70%.** Lượt 4 và 5 dùng lại candidate từ lượt trước (`reusedCandidatesFrom` trong `trace.json`) để tiết kiệm quota Groq free tier, nên chỉ đo bước gán tier + gộp. Lượt chạy đủ cả hai vòng AI gần nhất là **lượt 3**.

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
