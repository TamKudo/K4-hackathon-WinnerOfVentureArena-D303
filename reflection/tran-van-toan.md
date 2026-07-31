# Reflection — Trần Văn Toàn · 2A202601218

> Điền 4 mục dưới. Rubric chấm: vai trò + phần mình làm + AI hỗ trợ thế nào + **một bài học từ case fail của chính nhóm**.
> **Vibe-coding rule:** bị hỏi ngẫu nhiên tại CP5/CP6 mà không giải thích được phần có tên mình → 0 điểm phần cá nhân liên quan.

## 1. Vai trò trong nhóm

Phụ trách **phần trình bày** — dựng slide 6 trang, viết demo script, chủ trì dry run có bấm giờ. Nhóm phân như vậy vì 5 phút demo là chỗ duy nhất giám khảo thấy được toàn bộ công sức của cả nhóm; người dựng slide phải đọc hết spec, eval và validation để biết con số nào đáng đưa lên và con số nào bỏ được.

## 2. Phần mình làm

Theo `spec.md` §8: **Demo script · slide 6 trang · chủ trì dry run** (12:30–14:00 N2, cùng Trần Hoàng Khôi vận hành UI).

Artifact có tên bạn trong repo:
- `demo-slides.pdf`
- Demo script + backup (screenshot/video phòng live hỏng)

**Nguyên tắc dựng slide:** *"không có bằng chứng thì không có slide"* — mỗi trang phải có ít nhất một con số, một quote có nguồn, hoặc một kết quả đo. Bảng dưới liệt kê số liệu sẵn có trong repo cho từng trang, nên không trang nào phải nói suông.

**Quyết định khó nhất — trình bày con số chưa đạt:** nhóm chốt bar 70% nhưng chỉ đạt 63,6%. Cách xử lý: nêu bar trước, nêu kết quả sau, rồi giải thích khoảng cách bằng đúng một câu —. Trình bày thẳng còn có lợi hơn: nó cho thấy nhóm hiểu vì sao sai, không phải may mắn đúng.

**Demo live sẽ chạy 2 case:** một case chuẩn (khái niệm Trọng tâm có trích dẫn, bấm mở transcript đối chiếu) và một case chỗ khó. Rubric ghi rõ case lỗi được xử lý là phần **được đánh giá cao** — không giấu.


**Nội dung 6 trang theo `02-guide.md` §5.1** — luật *"không có bằng chứng thì không có slide"*, mỗi trang phải có ≥1 con số / quote có nguồn / kết quả đo:

| # | Trang | Thời lượng | Số liệu sẵn có trong repo |
|---|---|---|---|
| 1 | User & Job | 45" | 142/1.261 lượt hỏi tóm tắt · 99/369 học viên (~27%) · khảo sát: 75% "phải xem lại toàn bộ slide", 70% "không nhớ giảng viên nhấn mạnh phần nào" |
| 2 | Vì sao chọn tính năng này | 45" | Bảng impact 3 ứng viên (`spec.md` §2) + lý do loại B (86/142 fail nhưng chỉ giải nửa job) và C (0/1.261 lần dùng field `misconceptions`) |
| 3 | Giải pháp & demo live | 2' | Lát cắt 1 câu + augment/cost-of-error + **1 case chuẩn + 1 case chỗ khó** |
| 4 | Kết quả đo | 45" | Bar 70% chốt 23:59 N1 · thực đạt **63,6%** · diễn biến 46,9→59,4→48,5→57,6→63,6 |
| 5 | User thật nói gì | 45" | ≥2 quote nguyên văn có tên/vai từ `validation/feedback-log.md` + thay đổi đã làm |
| 6 | Nếu có thêm 1 tuần | 30" | Trả ngữ cảnh cho bước gán tier (số đoạn + cờ có mặt ở tóm tắt cuối T04-091) |

**Cần giải thích được nếu bị hỏi:**
- Slide 4 phải nêu **quality bar đã cam kết** rồi mới nói % — không khoe số đẹp mà giấu bar
- Nhóm đạt 63,6% / bar 70% → phải trình bày **phân tích khoảng cách**, không né. Câu trả lời gọn: *12 case còn fail tập trung vào một gốc duy nhất là chất lượng gán tier — model đẩy nội dung dễ kể chuyện lên core và đẩy kiến thức kỹ thuật xuống supporting*
- Case lỗi được xử lý là phần **được đánh giá cao** — đừng giấu
- **Thẻ giám khảo "chạy 1 case lạ tại chỗ"**: prototype hiện nhúng dữ liệu tĩnh từ `eval/run-5`, không gọi Groq lúc demo. Cần thống nhất trước cách trả lời — hoặc chạy sẵn transcript khác, hoặc nói thẳng là bản Mock đã khai đúng và chỉ trace trong `eval/` mới là AI thật
- Mỗi thành viên phải nói ≥1 phần — bạn phân ai nói phần nào?

**Bốn đường đi cần demo được trên UI** (`spec.md` §6 có bảng chỉ đúng file):
happy (bản đồ 3 tầng) · low-confidence (nhãn "Tín hiệu chưa chắc") · failure (khối "Chưa dựng được bản đồ") · correction (bộ lọc 15/30/60 phút)

## 3. AI hỗ trợ mình thế nào

[Điền: dùng AI vào việc gì, chỗ nào AI giúp được, chỗ nào phải tự sửa lại vì AI làm sai/không hiểu bối cảnh]

## 4. Một bài học từ case fail của nhóm

Gợi ý — chọn một fail có thật:

- **Nhóm chạy xong lượt 3, 4, 5 nhưng spec vẫn ghi "Lượt 3 — Không chạy được" suốt nhiều giờ.** Suýt thành che giấu số liệu đã đo. Bài học: đo xong phải cập nhật ngay.
- **Lượt 3 tụt 11 điểm phần trăm dù sửa đúng chẩn đoán** (59,4% → 48,5%) — bản sửa chặn được lỗi cũ nhưng làm lộ lỗi nặng hơn ở tầng dưới.
- **Groq free tier hết quota giữa chừng ngày 30/07**, chặn hẳn một lượt chạy. Bài học về phụ thuộc hạ tầng miễn phí khi có deadline cứng — liên quan trực tiếp đến rủi ro demo live.
- **Lượt 4 tăng điểm nhưng không phải nhờ bản sửa** — điều kiện gộp vẫn không khớp, điểm tăng do dao động ngẫu nhiên của model.

**Case chọn: Groq free tier hết quota giữa chừng ngày 30/07, chặn hẳn một lượt chạy.**

Lượt 3 bị `rate_limit_exceeded` ngay từ lô 1/6, retry 8/8 lần đều hỏng. Cả lượt đo dừng lại, không phải vì thiết kế sai mà vì hạ tầng miễn phí hết hạn mức trong ngày. Phải chờ sang hôm sau mới chạy lại được — và vì tiếc quota, hai lượt 4 và 5 phải **dùng lại candidate cũ** thay vì chạy đầu-cuối, nên chỉ đo được nửa pipeline.

**Vì sao điều này liên quan trực tiếp đến phần tôi phụ trách:** demo live phụ thuộc vào cùng loại rủi ro. Nếu CP6 gặp thẻ giám khảo "chạy 1 case lạ tại chỗ" mà quota hết hoặc mạng lớp lag, màn hình sẽ treo giữa lúc trình bày. Đó là lý do:
- Prototype demo dùng **dữ liệu tĩnh** từ `eval/run-5`, không gọi API lúc chạy
- Có **backup** (screenshot/video ngắn) phòng live hỏng
- Bản HTML thuần `codebase/lecturefocus.html` giữ lại làm phương án dự phòng thứ hai

**Bài học:** với deadline cứng, đừng để đường đi chính phụ thuộc vào thứ mình không kiểm soát được. Luôn có một đường lùi đã thử trước, không phải nghĩ ra lúc đang hỏng.

Lần sau tôi sẽ chạy dry run **trong điều kiện xấu nhất** (tắt mạng, hoặc giả lập API lỗi) chứ không chỉ chạy khi mọi thứ đang chạy tốt.
