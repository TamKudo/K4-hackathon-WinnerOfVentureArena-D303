# Reflection — Trần Hoàng Khôi · 2A202601778

> Điền 4 mục dưới. Rubric chấm: vai trò + phần mình làm + AI hỗ trợ thế nào + **một bài học từ case fail của chính nhóm**.
> **Vibe-coding rule:** bị hỏi ngẫu nhiên tại CP5/CP6 mà không giải thích được phần có tên mình → 0 điểm phần cá nhân liên quan.

## 1. Vai trò trong nhóm

[Điền: bạn nhận vai gì, vì sao nhóm phân như vậy]

## 2. Phần mình làm

Theo phân công: **Dựng UI ba màn (prototype mock) · vận hành UI khi dry run**.

Artifact có tên bạn trong repo:
- `codebase/lecturefocus.html` — 3 màn: Lesson → Review Map → Concept Detail
- `docs/lecturefocus-product-spec.md` — chi tiết UI và flow

[Điền cụ thể: bạn dựng màn nào trước, quyết định thiết kế nào khó nhất]

**Cần giải thích được nếu bị hỏi:**
- Dữ liệu trong HTML lấy từ đâu? (từ `eval/run-N/ai-output.json` — output AI thật, **không phải dựng tay**)
- Phần nào là **mock**? (chọn nhiều bài học, nút "Hỏi AI Tutor", nghe lại audio, lưu tiến độ)
- Bộ lọc quỹ thời gian 15/30/60 phút hoạt động thế nào? Có gọi AI lại không? (**không** — lọc bằng code phía client)
- **4 nguyên tắc HAX** ở §4 spec nằm ở đâu trên UI? Chỉ được vị trí cụ thể:
  - G1 (làm rõ phạm vi) — câu ghi rõ đây không phải dự đoán đề thi
  - G2 (mức độ tin cậy) — trích dẫn cạnh mỗi khái niệm
  - G10 (thu hẹp khi nghi ngờ) — nhãn "tín hiệu chưa chắc"
  - G11 (giải thích vì sao) — khối lý do trong Concept Detail
  - G8 (dễ bỏ qua) — học viên đổi quỹ thời gian / bỏ qua khái niệm tuỳ ý
- **4 đường đi trải nghiệm** (happy / low-confidence / failure / correction) thể hiện ở đâu trên UI? *(Rubric R3 cho 3đ mục này — cần chỉ được chỗ cụ thể, không chỉ nói có trong spec)*

## 3. AI hỗ trợ mình thế nào

[Điền: dùng AI vào việc gì, chỗ nào AI giúp được, chỗ nào phải tự sửa lại vì AI làm sai/không hiểu bối cảnh]

## 4. Một bài học từ case fail của nhóm

Gợi ý — chọn một fail có thật:

- **Nhóm từng dựng `codebase/webapp/` (React + Express, có deploy) rồi xoá hẳn trong cùng một ngày**: bỏ non-goal "không xây backend" để có link cho user test, rồi quay lại non-goal gốc. Bài học về giữ phạm vi và cái giá của việc đổi hướng giữa chừng.
- **UI đang nhúng dữ liệu run-2 (11 khái niệm) trong khi số liệu chính thức là run-5 (21 khái niệm)**: demo và báo cáo trỏ về hai lượt khác nhau.
- **Lượt 3 tụt điểm dù sửa đúng chẩn đoán**.

[Điền: bạn chọn case nào, bạn rút ra gì, lần sau sẽ làm khác thế nào]
