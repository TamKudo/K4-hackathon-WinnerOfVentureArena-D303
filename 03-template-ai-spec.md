# Template AI Spec *(spec.md — commit trước 23:59 N1 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

```markdown
# AI SPEC — LectureFocus AI: Bản đồ kiến thức tự động · Nhóm A31 · Zone [X]
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job
- **Job executor:** Học viên sau khi tham gia một buổi học, đặc biệt khi cần ôn tập trước lab, quiz hoặc buổi học tiếp theo.
- **Core JTBD (không tên sản phẩm/AI trong câu):** Khi cần ôn lại sau một buổi học, tôi muốn nhanh chóng biết bài có những kiến thức chính nào và phần nào nên ưu tiên, để không phải tự xem lại toàn bộ nội dung hoặc phải biết trước mình cần hỏi chatbot điều gì.
- **Problem statement (KHÔNG chữ AI):** Học viên sau một buổi học dài thường không biết đâu là kiến thức trọng tâm, phần nào cần ưu tiên ôn tập, hoặc thậm chí không nhớ mình đã bỏ sót nội dung gì để hỏi. Việc xem lại toàn bộ bài giảng rất tốn thời gian, trong khi các công cụ hỏi đáp hiện tại chỉ hiệu quả khi người học đã biết mình cần hỏi gì.
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - **Số liệu mining (B):** Phân tích `chat_history_anonymized_for_hackathon.csv` cho thấy **142/1.261 (11.3%)** lượt hỏi liên quan đến tóm tắt/tổng hợp bài học, xuất hiện ở **99/369 (26.8%)** học viên. Trong đó, khoảng **60.6%** yêu cầu tóm tắt hiện tại không được xử lý thành công.
  - **≥5 quote/ví dụ nguyên văn + nguồn:**
    1. `C0002,U0031`: "tóm gọn những nội dung quan trọng nhất trong day 04 này"
    2. `C0018,U0221`: "tóm tắt toàn bộ slide sau đó đưa ra các ý chính"
    3. `C0065,U0212`: "Tổng hợp toàn bộ những kiên thức chính trong bài này"
    4. `C0070,U0092`: "tóm tắt lại buổi học này"
    5. `C0113,U0141`: "giải thích và tóm tắt nội dung học hôm này"

## §2. Impact & quyết định chọn
- **Bảng impact ≥3 ứng viên:**
| Ứng viên (Bài toán) | Bao nhiêu người gặp | Tần suất | Mỗi lần tốn gì | Build nổi không | Chọn? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Tạo bản đồ kiến thức tự động** | ~27% học viên (99/369) | Sau mỗi buổi học (2-3 lần/tuần) | 15-30 phút tự mò mẫm, ôn không trọng tâm | Có | **CHỌN** |
| **2. Tối ưu trả lời câu hỏi logistics** | ~20% học viên (ước tính) | 1-2 lần/tuần | 5-10 phút chờ TA/bạn bè trả lời | Có | Loại |
| **3. Phát hiện hiểu lầm trong chat** | Khó đo lường, nhưng tiềm ẩn | Thường xuyên | Điểm số thấp, hiểu sai kiến thức nền tảng | Khó (cần eval phức tạp) | Loại |

- **Ứng viên ĐÃ LOẠI + vì sao:**
  - **Tối ưu trả lời logistics:** Pain point có thật nhưng impact không cao bằng việc hỗ trợ học thuật. Đã có nhiều giải pháp đơn giản (FAQ, bot cơ bản).
  - **Phát hiện hiểu lầm:** Rất giá trị nhưng khó định lượng "pain" và "impact" bằng dữ liệu có sẵn. Việc xây dựng và kiểm thử (eval) một hệ thống như vậy trong 1.5 ngày là rất rủi ro.
- **Ứng viên CHỌN + vì sao (bằng số):**
  - Chọn **Tạo bản đồ kiến thức tự động** vì có bằng chứng định lượng rõ ràng từ chatlog (11.3% lượt hỏi, ảnh hưởng ~27% học viên).
  - Giải pháp này giúp tiết kiệm 15-30 phút/buổi/học viên, giúp họ ôn tập hiệu quả hơn, trực tiếp cải thiện kết quả học tập (quiz, lab).
  - Khả thi về mặt kỹ thuật trong hackathon với dữ liệu `transcript` có sẵn.

## §3. Giải pháp tương tự đã nghiên cứu
- **NotebookLM (Google):**
  - **Flow:** User tải tài liệu lên, đặt câu hỏi, AI trả lời dựa trên nguồn tài liệu đó và luôn trích dẫn nguồn.
  - **Đáng học:** Cơ chế trích dẫn (citation) rất mạnh, giúp tăng độ tin cậy và cho phép người dùng tự kiểm chứng.
  - **Đáng né:** Vẫn yêu cầu người dùng phải chủ động đặt câu hỏi.
  - **Mình khác gì:** Giải pháp của mình **chủ động** phân tích và đề xuất cấu trúc kiến thức mà không cần người dùng hỏi trước.

## §4. Thiết kế
- **Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):**
  > Một học viên sau khi học xong một buổi, muốn ôn tập nhanh, AI sẽ tự động phân tích transcript bài giảng để tạo ra một "Bản đồ ôn tập" (Review Map) phân cấp các khái niệm chính, giúp học viên biết cần tập trung vào đâu.
- **Non-goals (≥3 thứ KHÔNG build):**
  1. Không xây dựng chatbot hỏi-đáp chung.
  2. Không phân tích video/audio, chỉ tập trung vào transcript dạng text.
  3. Không cá nhân hóa lộ trình cho từng học viên, chỉ tạo bản đồ chung cho bài giảng.
- **Mức prototype nhắm tới:** [x] Sketch [ ] Mock [ ] Working — **Phần thật:** Lời gọi AI để phân tích transcript và tạo ra cấu trúc JSON của Review Map. **Phần mock:** Giao diện web chỉ để hiển thị kết quả JSON đó, chưa có tương tác phức tạp.
- **Automation:** [x] augment [ ] conditional [ ] automate — **Lý do theo cost-of-error:** AI chỉ **gợi ý (augment)** cấu trúc kiến thức, không tự động tạo bài kiểm tra hay chấm điểm. Nếu AI phân loại sai (ví dụ: xếp một khái niệm "Core" vào "Supporting"), hậu quả không quá nghiêm trọng, người học vẫn có thể tự nhận ra khi xem lại. Chi phí sửa lỗi thấp (chỉ cần tinh chỉnh prompt).

- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **G1. Làm rõ hệ thống làm được gì** | Giao diện sẽ có một câu mô tả rõ ràng: "Phân tích bài giảng và tạo bản đồ kiến thức để bạn ôn tập hiệu quả." |
  | **G11. Giải thích vì sao** | Mỗi concept trong Review Map sẽ có một dòng giải thích ngắn gọn lý do nó được xếp vào mức độ đó (ví dụ: "Được giảng viên nhắc lại 5 lần"). |
  | **PAIR: Explainability + Trust** | Mỗi concept và tóm tắt do AI tạo ra đều phải có trích dẫn `[Txx-NNN]` để người dùng có thể bấm vào và đối chiếu với transcript gốc. |
  | **G10. Thu hẹp phạm vi khi nghi ngờ** | Nếu transcript quá ngắn hoặc không đủ thông tin để phân tích, AI sẽ trả về thông báo "Bài giảng này không đủ nội dung để tạo bản đồ kiến thức." thay vì cố gắng bịa ra. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]
| Tình huống cụ thể | Lớp | Hành vi mong muốn (Nói gì, hiện gì, cho user làm gì tiếp) | Nguyên tắc áp dụng |
| :--- | :--- | :--- | :--- |
| User yêu cầu phân tích một bài giảng không có trong hệ thống. | ① Nguồn sự thật | Báo lỗi: "Không tìm thấy bài giảng này. Vui lòng chọn từ danh sách có sẵn." | G1, G10 |
| Transcript quá ngắn (ví dụ: chỉ có vài dòng giới thiệu). | ② Thiếu thông tin | Báo lỗi: "Nội dung bài giảng quá ngắn để phân tích." | G10 |
| Transcript chứa nhiều chủ đề không liên quan, không có cấu trúc rõ ràng. | ② Thiếu thông tin | AI có thể trả về một bản đồ ít mục, hoặc báo: "Các khái niệm trong bài giảng này không có sự liên kết rõ ràng." | G2, G10 |
| User yêu cầu AI tạo luôn một bài quiz 10 câu từ bản đồ. | ③ Ngoài phạm vi | Trả lời: "Tính năng này chưa được hỗ trợ. Hiện tại, bạn có thể dùng bản đồ này để tự đặt câu hỏi ôn tập." | G1 |
| AI tóm tắt sai một khái niệm kỹ thuật quan trọng (ví dụ: sai định nghĩa "Attention"). | ④ Đặc thù domain | Người dùng có thể bấm vào trích dẫn `[Txx-NNN]` để đọc lại định nghĩa gốc và tự phát hiện sai sót. | PAIR: Explainability |
| AI xếp một khái niệm phụ vào "Core Focus". | ④ Đặc thù domain | Người dùng có thể không đồng tình nhưng vẫn có thể tự quyết định dựa trên kinh nghiệm của mình. Đây là lỗi chấp nhận được ở mức Augment. | G9 (ngầm) |
| AI không trích xuất được khái niệm nào. | ① Nguồn sự thật | Báo lỗi: "Không thể xác định các khái niệm chính từ bài giảng này." | G10 |
| AI bịa ra một trích dẫn không có trong transcript. | ① Nguồn sự thật | Hệ thống (nếu có thể) cần có một bước xác thực sau khi AI sinh ra kết quả để kiểm tra sự tồn tại của mã trích dẫn. Nếu không, đây là rủi ro cần ghi nhận. | PAIR: Trust |

## §6. Bốn đường đi của trải nghiệm
- Happy path: · Low-confidence (②): · Failure/không căn cứ (①): · Correction (user sửa):
- Khi bị đòi ngoài phạm vi (③): · Case đặc thù domain (④):
- **Happy path:** User chọn bài giảng → AI phân tích thành công → Hiển thị Review Map với 3 cấp độ rõ ràng, có tóm tắt và trích dẫn chính xác.
- **Low-confidence (②):** User chọn bài giảng có nội dung lan man → AI trả về Review Map với ít mục "Core Focus" và có ghi chú: "Các khái niệm trong bài này có tính liên kết thấp."
- **Failure/không căn cứ (①):** User chọn một file không phải transcript → AI báo lỗi: "File không hợp lệ hoặc không thể phân tích."
- **Correction (user sửa):** Giao diện chưa hỗ trợ sửa trực tiếp, nhưng người dùng có thể copy tóm tắt của AI và tự chỉnh sửa ở nơi khác.

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
- Quality bar (chốt từ 23:59, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):
- **Chiều chất lượng + định nghĩa kiểm chứng được:**
  1. **Concept Coverage (Độ bao phủ khái niệm):** (Số key concept AI tìm thấy) / (Tổng số key concept do người chấm xác định).
  2. **Classification Accuracy (Độ chính xác phân loại):** % các concept được AI phân loại (Core/Important/Supporting) trùng khớp với đánh giá của con người.
  3. **Groundedness (Tính có căn cứ):** 100% các trích dẫn `[Txx-NNN]` do AI sinh ra phải tồn tại trong transcript gốc.
- **Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong `eval/`):**
  - Sẽ xây dựng dựa trên 6 file transcript có sẵn, bao gồm các case: transcript chuẩn, transcript ngắn, transcript không có cấu trúc, transcript chứa nhiều ví dụ hơn lý thuyết.
- **Quality bar (chốt từ 23:59, giữ nguyên sau đó):**
  > "Đạt khi **Concept Coverage ≥ 70%**, **Classification Accuracy ≥ 60%**, và **Groundedness = 100%**."

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥3 tên) + kế hoạch vòng validation CP5 (3 câu hỏi, ai log):
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:
- **Phân công có tên:**
  - **Spec & Evidence:** [Tên thành viên 1]
  - **Prompt & Golden Set:** [Tên thành viên 2]
  - **Code (Backend AI call):** [Tên thành viên 3]
  - **Code (Frontend UI):** [Tên thành viên 4]
  - **Demo & Slides:** [Tên thành viên 5]
- **Willing users (≥3 tên) + kế hoạch vòng validation CP5:**
  - Sẽ liên hệ 3 bạn học viên trong lớp (ngoài nhóm) để dùng thử prototype.
  - **3 câu hỏi:** 1. "Bản đồ này có giúp bạn hình dung cấu trúc bài học nhanh hơn không?" 2. "Phân loại Core/Important/Supporting có hợp lý với cảm nhận của bạn không?" 3. "Bạn có muốn dùng tính năng này cho các buổi học tiếp theo không? Vì sao?"

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| | | |
```
