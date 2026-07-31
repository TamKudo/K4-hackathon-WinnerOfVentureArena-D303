# Reflection — Trần Hoàng Khôi · 2A202601778

> Điền 4 mục dưới. Rubric chấm: vai trò + phần mình làm + AI hỗ trợ thế nào + **một bài học từ case fail của chính nhóm**.
> **Vibe-coding rule:** bị hỏi ngẫu nhiên tại CP5/CP6 mà không giải thích được phần có tên mình → 0 điểm phần cá nhân liên quan.

## 1. Vai trò trong nhóm

Phụ trách **giao diện** — dựng UI để học viên bấm được, và vận hành UI khi dry run. Nhóm phân như vậy vì đây là chỗ mọi thứ gặp nhau: output AI, các nguyên tắc HAX đã khai ở §4, và 4 đường đi trải nghiệm ở §6 đều phải nhìn thấy được trên màn hình thì mới tính là có.

> ⚠️ *Đây là bản nháp dựng từ artifact trong repo — Khôi tự sửa lại theo trải nghiệm thật của mình trước khi nộp.*

## 2. Phần mình làm

Theo phân công: **Dựng UI ba màn (prototype mock) · vận hành UI khi dry run**.

Artifact có tên bạn trong repo:
- `codebase/lecturefocus.html` — bản HTML thuần đầu tiên (3 màn), nay giữ làm **backup demo** phòng live hỏng
- `codebase/web/` — bản React đang dùng chính (Landing → Ôn tập → Chi tiết khái niệm), dựng cùng Trần Minh Hiển
- `docs/lecturefocus-product-spec.md` — chi tiết UI và flow

**Ba quyết định thiết kế đáng nói:**

1. **Bản đồ ba tầng là màn mặc định, không phải ô chat trống.** Đây là điểm khác biệt với AI Tutor hiện tại — học viên mở lên là thấy ngay cần ôn gì, không phải biết trước mình cần hỏi gì. Khảo sát xác nhận: 90% chọn "trích xuất sẵn top 3 kiến thức cốt lõi", **0% chọn "đợi bạn tự gõ câu hỏi"**.

2. **Bộ lọc quỹ thời gian lọc bằng code, không gọi lại AI.** Bấm 15' thì 21 khái niệm rút còn 3 khái niệm Trọng tâm, ước lượng ~15'. Đây là kịch bản số 8 ở §5 và là đường đi *correction* ở §6.

3. **Hai sửa đổi từ feedback validation** (ghi trong Changelog §9):
   - **Khối "Mức ưu tiên dựa trên tiêu chí gì?"** ở đầu màn Ôn tập — vì 2/5 người thử không hiểu vì sao một khái niệm được xếp Trọng tâm. Lý do vốn chỉ hiện ở trang chi tiết, quá sâu.
   - **Evidence trông bấm được rõ hơn** (icon ❝ + viền nét đứt + dòng hướng dẫn có nền) — vì một người thử mất ~20 giây mới nhận ra trích dẫn click được. Đây là tính năng lõi: không phát hiện ra thì mất luôn khả năng tự kiểm chứng.

*[Khôi bổ sung: dựng màn nào trước, chỗ nào khó nhất khi làm UI, có phải sửa lại nhiều lần không]*

**Cần giải thích được nếu bị hỏi:**
- Dữ liệu trên UI lấy từ đâu? (`eval/run-5/ai-output.json` — output AI thật, chuyển sang schema UI bằng `codebase/web/scripts/build-concepts.mjs`, **không dựng tay**. 21 khái niệm: core 10 · important 5 · supporting 6, khớp chính xác run-5)
- Phần nào là **mock**? (nút "Hỏi AI về phần này", audio gốc, lưu tiến độ học viên)
- Bộ lọc quỹ thời gian 15/30/60 phút hoạt động thế nào? Có gọi AI lại không? (**không** — `lib/reviewPlan.ts → planForBudget`, lọc bằng code phía client)
- **4 nguyên tắc HAX** ở §4 spec nằm ở đâu trên UI? Chỉ được vị trí cụ thể:
  - G1 (làm rõ phạm vi) — dòng "Bản đồ ưu tiên ôn theo nội dung bài giảng — không phải dự đoán đề thi" ngay đầu trang Ôn tập
  - G2 (mức độ tin cậy) — trích dẫn nguyên văn kèm `segmentId` trong Chi tiết khái niệm
  - G10 (thu hẹp khi nghi ngờ) — nhãn cam "⚠ Tín hiệu chưa chắc"
  - G11 (giải thích vì sao) — khối "Vì sao xếp trọng tâm?" trong Chi tiết khái niệm
  - G8 (dễ bỏ qua) — đổi quỹ thời gian / bỏ qua khái niệm tuỳ ý
- **4 đường đi trải nghiệm** — `spec.md` §6 có bảng chỉ đúng file, cần thuộc: *(Rubric R3, 3đ)*
  - **happy** — `pages/StudyHubPage.tsx`, bản đồ ba tầng
  - **low-confidence** — `components/map/BentoConceptTile.tsx` (nhãn cam) + `pages/ConceptDetailPage.tsx` (khối cảnh báo). Đọc từ field `uncertain_signal` do **AI tự gán**, không phải nhóm gắn tay. **Ở run-5 AI không gắn cờ nào (0/21)** nên đường đi này không xuất hiện trên dữ liệu demo — đã kiểm chứng riêng bằng dữ liệu test
  - **failure** — `pages/StudyHubPage.tsx`, khi `list.length === 0` hiện "Chưa dựng được bản đồ ôn tập cho buổi này"
  - **correction** — bộ lọc quỹ thời gian

## 3. AI hỗ trợ mình thế nào

[Điền: dùng AI vào việc gì, chỗ nào AI giúp được, chỗ nào phải tự sửa lại vì AI làm sai/không hiểu bối cảnh]

## 4. Một bài học từ case fail của nhóm

Gợi ý — chọn một fail có thật:

- **Nhóm từng dựng `codebase/webapp/` (React + Express, có deploy) rồi xoá hẳn trong cùng một ngày**: bỏ non-goal "không xây backend" để có link cho user test, rồi quay lại non-goal gốc. Bài học về giữ phạm vi và cái giá của việc đổi hướng giữa chừng.
- **UI đang nhúng dữ liệu run-2 (11 khái niệm) trong khi số liệu chính thức là run-5 (21 khái niệm)**: demo và báo cáo trỏ về hai lượt khác nhau.
- **Lượt 3 tụt điểm dù sửa đúng chẩn đoán**.

**Case chọn: UI hiển thị 8 khái niệm dựng tay trong khi báo cáo nói 21 khái niệm từ AI thật.**

Bản React ban đầu chạy rất đẹp — nhưng dữ liệu trong `concepts.json` là **8 khái niệm nhóm tự viết tay** từ trước khi có AI, kèm nhãn "Nguồn: mock" và một toast đỏ "AI lỗi — dùng mock". Trong khi đó số liệu chính thức của nhóm là **21 khái niệm** do AI thật sinh ra ở lượt 5, đã được golden set chấm 63,6%.

Nghĩa là **demo và báo cáo trỏ về hai nguồn hoàn toàn khác nhau**. Nếu để nguyên, giám khảo xem UI rồi hỏi "21 khái niệm trong báo cáo đâu?" thì không trả lời được — và cả phần eval công phu nhất của nhóm trở thành vô nghĩa vì không ai thấy nó trên sản phẩm.

**Bài học:** UI đẹp không thay được UI **đúng nguồn**. Prototype tồn tại để chứng minh quyết định AI hoạt động, nên nó phải hiển thị chính thứ đã được đo — không phải một bản dựng tay trông giống vậy. Đã sửa bằng script `scripts/build-concepts.mjs` chuyển thẳng `eval/run-5/ai-output.json` sang schema UI, thuần đổi định dạng, không sửa nội dung.

Điều đáng suy nghĩ nhất: toast đỏ "AI lỗi" thực ra **không phải lỗi** — đó là đường đi bình thường khi không có transcript local. Một thông báo sai làm cả nhóm tưởng hệ thống hỏng trong khi nó chạy đúng. Lần sau tôi sẽ phân biệt rõ "chưa bật tính năng" với "tính năng hỏng" ngay từ đầu, thay vì gộp chung thành một thông báo lỗi.
