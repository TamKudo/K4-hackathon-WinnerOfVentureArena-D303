# Reflection — Trương Minh Tâm · 2A202602005

> Điền 4 mục dưới. Rubric chấm: vai trò + phần mình làm + AI hỗ trợ thế nào + **một bài học từ case fail của chính nhóm**.
> **Vibe-coding rule:** bị hỏi ngẫu nhiên tại CP5/CP6 mà không giải thích được phần có tên mình → 0 điểm phần cá nhân liên quan.

## 1. Vai trò trong nhóm

Phụ trách **bằng chứng** — mining chatlog để chứng minh pain có thật, chạy khảo sát 20 học viên, và dẫn phỏng vấn ở vòng validation. Nhóm phân như vậy vì cả ba việc đều là "đi hỏi người thật rồi ghi lại trung thực", và người đã quen đọc dữ liệu thô thì cũng biết chỗ nào dễ đọc sai. Ở vòng validation, tôi dẫn phỏng vấn còn Phạm Hải Yến ghi log song song để có hai bản ghi độc lập đối chiếu.

> ⚠️ *Đây là bản nháp dựng từ artifact trong repo — Tâm tự sửa lại theo trải nghiệm thật của mình trước khi nộp.*

## 2. Phần mình làm

Theo phân công: **Mining bằng chứng chatlog · khảo sát · dẫn phỏng vấn validation**.

Artifact có tên bạn trong repo:
- `spec.md` §1 — số liệu mining: 142/1.261 lượt hỏi tóm tắt, 99/369 học viên, 86/142 lượt tutor fail
- `validation/survey-log.md` — khảo sát 20 người
- `validation/feedback-log.md` — các phiên user test

**Cách đếm (phải lặp lại được, không phải ước lượng):** lọc trong 1.261 turn của `chat_history_anonymized_for_hackathon.csv` các tin nhắn học viên có nội dung xin tóm tắt/tổng hợp → được **142 lượt (~11%)**, thuộc **99/369 học viên (~27%)**. Trong 142 lượt đó, kiểm tiếp xem tutor có từ chối hoặc báo không tìm được nội dung không → **86/142 (~60,6%)**. Lọc riêng các câu hỏi thẳng về "cái gì quan trọng/trọng tâm cần nắm" → **~25 lượt**. Loại tay các câu nhiễu kiểu jailbreak trước khi đếm.

**Khảo sát 20 học viên** (`validation/survey-log.md`) — 4 câu, kết quả chính: 75% "phải xem lại toàn bộ slide rất tốn thời gian", 70% "không nhớ giảng viên nhấn mạnh phần nào", 75% "AI không tóm tắt được nội dung slide", và **90% chọn "trích xuất top 3 kiến thức cốt lõi kèm trích dẫn"** khi chỉ có 15 phút trước Lab/Quiz.

**Hai giới hạn tôi tự ghi vào spec thay vì giấu:**
- 100% hội thoại trong chatlog thuộc `in_class`, còn JTBD nhắm vào lúc ôn **sau** buổi — hai bối cảnh khác nhau, chỉ dùng được để chứng minh nhu cầu gốc "không biết đâu là trọng tâm".
- Trong 20 phản hồi khảo sát có 2 thành viên trong nhóm, 1 người trả lời trùng, 1 phản hồi ẩn danh sai định dạng mã HV → mẫu ngoài nhóm thật chỉ **16–17 người**, chưa đủ ngưỡng 20 của evidence chuẩn A. Không làm tròn thành "khảo sát 20 người ngoài nhóm".

*[Tâm bổ sung: gặp khó gì khi lọc dữ liệu, có lần nào đếm ra số khác rồi phải kiểm lại không]*

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

**Case chọn: field `misconceptions` có sẵn trong hệ thống nhưng 0/1.261 lần được dùng.**

Khi chọn hướng ở §2, ứng viên C là "kiểm tra hiểu bài / phát hiện hiểu lầm cuối buổi". Nghe rất hợp lý, và hệ thống VLearn **đã có sẵn** field `misconceptions` — tức là ai đó từng nghĩ tính năng này quan trọng đủ để dựng chỗ chứa dữ liệu. Nhưng khi đếm thật trong 1.261 turn: **0 lần** field đó có dữ liệu.

**Bài học:** "tính năng đã được build" không đồng nghĩa với "có nhu cầu thật". Nếu nhóm chọn hướng C chỉ vì thấy hệ thống đã có chỗ cho nó, chúng tôi sẽ dành cả ngày build một thứ chưa có bằng chứng nào cho thấy người dùng cần — và không có cách nào đo được impact vì không có dữ liệu nền để so.

Điều này cũng dạy tôi cách viết phần loại ứng viên: **loại bằng số, không loại bằng cảm tính**. Ứng viên B bị loại dù bằng chứng fail rất mạnh (86/142 = 60,6%) — không phải vì nó kém, mà vì nó chỉ giải quyết nửa sau của job (trả lời đúng khi học viên *đã* hỏi), không giải quyết nửa trước (học viên còn chưa biết nên hỏi gì).

Lần sau, trước khi tin vào một tín hiệu gián tiếp (như "hệ thống đã có field này"), tôi sẽ đi tìm **dữ liệu hành vi thật** trước — nếu không đếm được thì coi như chưa có bằng chứng.
