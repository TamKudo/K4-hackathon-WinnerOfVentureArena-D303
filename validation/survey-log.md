# Log khảo sát — 20 học viên khoá AI Product

> Rubric R1: Evidence chuẩn **A** = khảo sát ≥20 người ngoài nhóm · ≥50% xác nhận · log đủ câu hỏi + từng câu trả lời.
> Bổ sung cho evidence chuẩn **B** (mining chatlog 1.261 turn) đã có ở `spec.md` §1.

**Thời điểm:** 30/07/2026, 16:58 – 21:13 · **Số phản hồi:** 20 · **Hình thức:** form khảo sát, học viên cùng khoá

## Kết quả — 4 câu hỏi

### Q1. Sau mỗi buổi học dài (2–3 tiếng) trên VLearn, khó khăn LỚN NHẤT của bạn khi muốn ôn lại bài là gì?
*(Chọn tối đa 2 câu trả lời — 37 lượt chọn / 20 người)*

| Đáp án | Lượt chọn | % trên 20 người |
|---|---|---|
| **Phải xem lại toàn bộ slide rất tốn thời gian** | **15** | **75%** |
| **Không nhớ giảng viên đã nhấn mạnh phần nào để ưu tiên học trước** | **14** | **70%** |
| Muốn hỏi AI Tutor nhưng không biết phải đặt câu hỏi gì / bắt đầu từ đâu | 5 | 25% |
| Không biết mình có bị bỏ sót kiến thức quan trọng nào không | 3 | 15% |
| Khác | 0 | 0% |

### Q2. Khi dùng AI Tutor hiện tại trên VLearn, bạn thường gặp phải vấn đề nào dưới đây?
*(Chọn tất cả câu phù hợp — 41 lượt chọn / 20 người)*

| Đáp án | Lượt chọn | % trên 20 người |
|---|---|---|
| **AI không tóm tắt được nội dung slide bài giảng** | **15** | **75%** |
| AI chỉ trả lời khi mình bôi đen văn bản hoặc chủ động gõ câu hỏi cụ thể | 12 | 60% |
| Không biết câu trả lời của AI có đúng với nội dung giảng viên vừa dạy không (thiếu bằng chứng/trích dẫn) | 8 | 40% |
| Rất ít khi dùng vì không nhớ ra để hỏi | 6 | 30% |

### Q3. Giả sử sau buổi học, VLearn tự động cung cấp một "Bản đồ kiến thức (Review Map)" chia bài học thành 3 tầng: Core Focus / Important / Supporting. Bạn thấy tính năng này có hữu ích không?
*(Chọn một — tổng đúng 20)*

| Đáp án | Số người | % |
|---|---|---|
| Rất hữu ích – Tiết kiệm đáng kể thời gian định hình lại bài học | 13 | 65% |
| Khá hữu ích – Dùng để tham khảo khi cần ôn thi/quiz | 7 | 35% |
| Không hữu ích | 0 | 0% |
| **Tổng thấy hữu ích** | **20** | **100%** |

### Q4. Nếu bạn chỉ có đúng 15 phút trước giờ vào làm bài Lab/Quiz, bạn muốn Chatbot AI hỗ trợ bạn theo cách nào nhất?
*(Chọn một — tổng đúng 20)*

| Đáp án | Số người | % |
|---|---|---|
| **Trích xuất sẵn top 3 kiến thức cốt lõi nhất của bài kèm trích dẫn đoạn giảng của thầy/cô** | **18** | **90%** |
| Tạo nhanh 3-5 câu trắc nghiệm để tự kiểm tra kiến thức | 2 | 10% |
| Đợi bạn tự gõ câu hỏi rồi mới trả lời như Chatbot thông thường | 0 | 0% |

## Kết luận rút ra

**1. Pain được xác nhận ở mức rất cao.** 75% chọn "phải xem lại toàn bộ slide rất tốn thời gian" và 70% chọn "không nhớ giảng viên nhấn mạnh phần nào" — vượt xa ngưỡng ≥50% mà rubric yêu cầu. Hai đáp án này chính là hai vế của problem statement ở `spec.md` §1.

**2. Khảo sát khớp với mining chatlog, đo từ hai góc độc lập.** Mining cho thấy 60,6% lượt xin tóm tắt bị tutor từ chối hoặc không tìm được nội dung; khảo sát cho thấy 75% học viên tự nhận "AI không tóm tắt được nội dung slide bài giảng". Hai nguồn khác nhau, cùng chỉ về một vấn đề.

**3. Xác nhận đúng lát cắt đã chọn.** 90% chọn "trích xuất sẵn top 3 kiến thức cốt lõi **kèm trích dẫn**" khi chỉ có 15 phút — đúng thứ LectureFocus làm. Chỉ 10% muốn quiz, củng cố quyết định đưa quiz generation vào non-goals (`spec.md` §4).

**4. Xác nhận thế bị động của tutor hiện tại.** 60% nói AI chỉ trả lời khi bôi đen/gõ câu hỏi, 30% nói "rất ít khi dùng vì không nhớ ra để hỏi", 25% nói "không biết đặt câu hỏi gì" — đúng luận điểm ở §3 rằng AI Tutor chờ học viên khởi xướng, còn LectureFocus chủ động đưa bản đồ trước.

**5. Nhu cầu trích dẫn có thật.** 40% nói không biết câu trả lời AI có đúng nội dung giảng viên vừa dạy không — là lý do mọi khái niệm trong Review Map bắt buộc gắn trích dẫn xác minh được (kiểm tự động, xem `eval/run-5/citation-check.json`).

## Ghi chú trung thực về mẫu khảo sát

Bản export danh sách người trả lời cho thấy vài điểm cần nêu rõ thay vì làm tròn thành "20 người ngoài nhóm":

- **2/20 phản hồi là thành viên trong nhóm** (Trần Hoàng Khôi · 2A202601778, Trương Minh Tâm · 2A202602005).
- **1 người trả lời 2 lần** (Đinh Hồng Đăng · 2A202601480, lúc 17:01 và 17:14).
- **1 phản hồi ẩn danh** với mã không đúng định dạng mã học viên (`01170`).

→ Số phản hồi **ngoài nhóm, không trùng** là khoảng **16–17**, chưa đủ ngưỡng 20 người của evidence chuẩn A. Nhóm ghi nhận đúng như vậy và **không khai là "khảo sát 20 người ngoài nhóm"**. Bằng chứng chính của nhóm vẫn là chuẩn **B** (mining `chat_history_anonymized_for_hackathon.csv`, phương pháp đếm ghi trong `spec.md` §1, kiểm lại được); khảo sát này là bằng chứng bổ sung, đo độc lập và cho kết quả cùng chiều.

Tỉ lệ % ở các bảng trên tính trên tổng 20 phản hồi thu được. Nếu loại 3 dòng nêu trên, các tỉ lệ chính (75%, 70%, 90%) thay đổi không đáng kể vì các đáp án này chiếm đa số áp đảo.

## Người thực hiện

Theo `spec.md` §8: **Trương Minh Tâm** — mining bằng chứng + khảo sát.
