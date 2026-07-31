# Reflection — Trương Minh Tâm · 2A202602005

> Điền 4 mục dưới. Rubric chấm: vai trò + phần mình làm + AI hỗ trợ thế nào + **một bài học từ case fail của chính nhóm**.
> **Vibe-coding rule:** bị hỏi ngẫu nhiên tại CP5/CP6 mà không giải thích được phần có tên mình → 0 điểm phần cá nhân liên quan.

## 1. Vai trò trong nhóm

[Điền: bạn nhận vai gì, vì sao nhóm phân như vậy]

## 2. Phần mình làm

Theo phân công: **Mining bằng chứng chatlog · khảo sát · dẫn phỏng vấn validation**.

Artifact có tên bạn trong repo:
- `spec.md` §1 — số liệu mining: 142/1.261 lượt hỏi tóm tắt, 99/369 học viên, 86/142 lượt tutor fail
- `validation/survey-log.md` — khảo sát 20 người
- `validation/feedback-log.md` — các phiên user test

[Điền cụ thể: bạn đếm bằng cách nào, lọc câu nhiễu ra sao, gặp khó gì khi mining]

**Cần giải thích được nếu bị hỏi:**
- Con số **142/1.261** đếm bằng cách nào? Lọc theo tiêu chí gì? Người khác lặp lại có ra cùng số không?
- Vì sao loại tay các câu nhiễu kiểu jailbreak?
- **86/142 (60,6%)** là tutor "từ chối" hay "không tìm được nội dung" — phân biệt thế nào?
- Vì sao spec ghi rõ "không có cơ sở nối một hội thoại chatlog với một transcript cụ thể"? (đây là điểm trung thực đáng giá — đừng bỏ qua khi bị hỏi)
- 100% hội thoại thuộc `in_class` nhưng JTBD nhắm vào lúc ôn sau buổi — vì sao vẫn dùng làm bằng chứng được?

## 3. AI hỗ trợ mình thế nào

[Điền: dùng AI vào việc gì, chỗ nào AI giúp được, chỗ nào phải tự sửa lại vì AI làm sai/không hiểu bối cảnh]

## 4. Một bài học từ case fail của nhóm

Gợi ý — chọn một fail có thật:

- **Field `misconceptions` có sẵn trong hệ thống nhưng 0/1.261 lần được dùng**: dạy nhóm rằng "tính năng đã build" không đồng nghĩa "có nhu cầu thật" — đó là lý do loại ứng viên C.
- **Chatlog và transcript không nối được với nhau**: nhóm phải chấp nhận bằng chứng gián tiếp thay vì bịa ra mapping.
- **Lượt 3 tụt điểm dù sửa đúng chẩn đoán** (59,4% → 48,5%).

[Điền: bạn chọn case nào, bạn rút ra gì, lần sau sẽ làm khác thế nào]
