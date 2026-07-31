# LectureFocus — Review Map ưu tiên ôn tập

**Nhóm Winner Of Venture Arena** · Zone [điền zone] · Hướng A — VLearn · Tính năng mới

> Học viên sau buổi học muốn ôn nhanh nhưng không biết bài có những kiến thức chính nào và phần nào nên ưu tiên. LectureFocus đọc transcript bài giảng, trích các khái niệm và xếp mức ưu tiên ôn tập **Core / Important / Supporting** kèm trích dẫn gốc trong bài giảng.

## Thành viên & phân công

| Mã HV | Họ tên | Phụ trách phần |
|---|---|---|
| 2A202601812 | Trần Minh Hiển | Spec và Canvas CP1 · tổng hợp changelog |
| 2A202602005 | Trương Minh Tâm | Mining bằng chứng chatlog · khảo sát · dẫn phỏng vấn validation |
| 2A202601152 | Phạm Hải Yến | Prompt sinh Review Map · golden set · ghi log validation |
| 2A202601778 | Trần Hoàng Khôi | Dựng UI ba màn (prototype mock) · vận hành UI khi dry run |
| 2A202601218 | Trần Văn Toàn | Demo script · slide · chủ trì dry run |

## Sản phẩm làm gì

Một quyết định AI duy nhất: **nhận transcript → trích khái niệm → gán mức ưu tiên ôn tập, kèm trích dẫn xác minh được.**

Học viên không phải biết trước mình cần hỏi gì — mở lên là thấy ngay bản đồ ba tầng, chọn quỹ thời gian (15/30/60 phút) để rút gọn danh sách.

## Cấu trúc repo

| Đường dẫn | Nội dung |
|---|---|
| `spec.md` | AI Spec 9 mục — deliverable trung tâm |
| `docs/lecturefocus-product-spec.md` | Chi tiết UI, flow, mock data |
| `codebase/lecturefocus.html` | Prototype Mock — 3 màn bấm được, dữ liệu nhúng cứng từ output AI thật |
| `codebase/generate-review-map.mjs` | CLI chạy lượt AI thật, ghi kết quả ra `eval/run-N/` |
| `codebase/lib/reviewMapGenerator.mjs` | Pipeline gọi Groq: prompt, gộp trùng lặp, kiểm tra trích dẫn |
| `eval/golden-set.md` | 36 case kiểm thử tự xây |
| `eval/run-1..5/` | Output 5 lượt chạy AI thật + trace + citation check |
| `eval/run-*-results.md` | Bảng chấm 36 case từng lượt, đối chiếu quality bar |
| `validation/` | Log khảo sát + feedback log từ vòng user test |
| `reflection/` | Mỗi người 1 file |
| `demo-slides.pdf` | Slide 6 trang |

## Kết quả đo

**Quality bar (chốt trong `spec.md` §7 trước 23:59 N1, giữ nguyên):** ≥70% case golden set đạt, và 100% case không chứa khái niệm bịa đặt hoặc tuyên bố vượt phạm vi.

| Lượt | % đạt | Thay đổi chính |
|---|---|---|
| 1 | 46,9% (15/32) | Lượt đầu, chunk cố định 18 đoạn |
| 2 | 59,4% (19/32) | Chunk theo heading, giới hạn core, thêm ví dụ hedge |
| 3 | 48,5% (16/33) | Tách vòng gộp: AI chỉ gán tier, gộp bằng code |
| 4 | 57,6% (19/33) | Nới điều kiện gộp — chưa có tác dụng |
| 5 | **63,6% (21/33)** | Gộp theo tập từ lõi — hoạt động (26→21 khái niệm) |

**Kết quả chính thức: 63,6% — chưa đạt bar 70%**, thiếu khoảng 2 case. Ghi nhận trung thực đầy đủ mọi case kể cả case fail, kèm phân tích nguyên nhân trong `eval/run-5-results.md`.

Điều kiện tuyệt đối: nhóm ③ (ngoài phạm vi — không sinh quiz, không đoán đề thi, không phán học viên hiểu/chưa hiểu) đạt **3/3 ở cả 5 lượt**. Trích dẫn nguyên văn đạt 93,5%, chưa đủ 100%.

## Chạy thử

**Xem prototype:** mở `codebase/lecturefocus.html` bằng trình duyệt. Không cần cài gì, không gọi mạng.

**Chạy lại lượt AI thật:** cần Node.js ≥18 và API key Groq ([console.groq.com/keys](https://console.groq.com/keys)).

```powershell
# PowerShell
$env:GROQ_API_KEY = "gsk_..."
node codebase/generate-review-map.mjs
```

```bash
# Bash
export GROQ_API_KEY=gsk_...
node codebase/generate-review-map.mjs
```

Kết quả ghi ra `eval/run-N/`. Script không hardcode khái niệm hay tier nào — mỗi lượt chạy ra kết quả khác nhau. Free tier Groq giới hạn token/phút nên script tự chia lô và chờ/thử lại khi bị rate limit.

## Lưu ý

- Dữ liệu trong `data/` là dữ liệu thật đã ẩn danh của khoá học, chỉ dùng trong phạm vi hackathon — không chia sẻ ra ngoài.
- Không commit API key. `.env` đã nằm trong `.gitignore`.