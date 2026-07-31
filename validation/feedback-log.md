# Feedback log — vòng validation với user thật

> Rubric R6 (8đ): ≥5 mẩu từ **≥5 người ngoài nhóm** (có ≥2 willing user đã khai từ CP1), **quote nguyên văn** + tên/vai (4đ) · ≥1 thay đổi từ feedback ghi trong Changelog `spec.md` §9, hoặc giữ nguyên có lý do căn cứ (4đ).

**Thời điểm:** 2026-07-31 · **Người thực hiện:** Trương Minh Tâm (dẫn) + Phạm Hải Yến (ghi log)
**Task giao:** dùng Review Map để quyết định ôn Day 1 — Foundation trong quỹ 15 phút.

## Log

| # | Người thử · mã HV | Quote nguyên văn | Vấn đề rút ra | Mức nghiêm trọng |
|---|---|---|---|---|
| 1 | **Vũ Hoàng Việt** · 2A202601250 | "dễ sử dụng, hữu ích, cải tiến xem đoạn tóm tắt sẽ mock với slide nào" | Muốn biết mỗi khái niệm ứng với **slide nào** của bài giảng, không chỉ đoạn transcript | Trung bình |
| 2 | **Đoàn Tiến Thành** · 2A202601222 | "rất hữu ích, dể sử dụng, nên cải tiến ui/ux" | Góp ý chung về giao diện, không nêu chỗ cụ thể | Thấp |
| 3 | **Hoàng Hải Dương**  2A202601337| "Tiện, cần thêm mục lục, cần quiz nhỏ, không hiểu tiêu chí trọng tâm" | **Không hiểu vì sao một khái niệm được xếp Trọng tâm** — tiêu chí tier chưa rõ với người dùng. Ngoài ra muốn mục lục và quiz | **Cao** |
| 4 | **Đinh Quang Minh** 2A202601347 | "Tính năng hữu ích, triển khai thực tế khó, giúp hệ thống lại kiến thức và ôn tập" | Nghi ngờ tính khả thi khi triển khai thật (chi phí/quy mô), nhưng xác nhận đúng job "hệ thống lại kiến thức để ôn" | Trung bình |
| 5 | **Chu Thị Yến Khanh** 2A202601739  · học viên AI in Action · willing user CP1: Có| Nghi ngờ tính khả thi khi triển khai thật | **Không hiểu ngay vì sao concept được xếp Trọng tâm** — trùng feedback #3. Ngoài ra mất ~20 giây mới nhận ra evidence bấm được | Trung bình |

**Mức nghiêm trọng:** Cao (chặn không dùng được) · Trung bình (làm được nhưng khó chịu) · Thấp (góp ý nhỏ)

### Phiên 5 — chi tiết (chạy đúng quy trình `02-guide.md` §4.2: giao task → im lặng quan sát → hỏi 3 câu)

**Người thử:** Nguyễn Yến Khanh · học viên AI in Action · willing user từ CP1:  không có
**Task:** Quyết định cách ôn Day 1 trong 15 phút · **Hoàn thành:** Có · **Thời gian:** 2 phút 15 giây

**Quan sát (im lặng, không gợi ý):**

| # | Hành vi | Đọc ra được gì |
|---|---|---|
| 1 | Vào Bản đồ ôn tập ngay, không lạc | Điều hướng chính rõ ràng — không cần hướng dẫn |
| 2 | Đọc phần **Trọng tâm** trước | Đúng ý đồ thiết kế: tier dẫn được thứ tự đọc |
| 3 | **Không hiểu ngay vì sao concept X được xếp Trọng tâm** | ⚠️ Tiêu chí tier không tự giải thích được — **trùng feedback #3** |
| 4 | **Sau ~20 giây mới nhận ra evidence có thể click** | ⚠️ Affordance của evidence yếu: gạch chân chưa đủ báo hiệu bấm được |
| 5 | Có mở transcript để kiểm tra lời giảng | ✅ Đúng hành vi sản phẩm nhắm tới — tự kiểm chứng thay vì tin ngay (nguyên tắc G2) |
| 6 | Không dùng nút nghe (TTS) | Tính năng TTS ít giá trị với người dùng này |

**Quote nguyên văn:** *(cần điền — rubric R6 đòi quote nguyên văn, không tóm tắt)*

**Đánh giá:** hoàn thành task trong 2'15" so với quỹ 15 phút — bản đồ rút ngắn được thời gian định hình bài học đúng như giả thuyết ở `spec.md` §1. Hai điểm vướng đều ở tầng **giải thích/affordance**, không phải ở chất lượng nội dung AI sinh ra.

> ⚠️ **Ghi nhận trung thực về chất lượng log:** đủ **5/5** người ngoài nhóm theo ngưỡng rubric R6.
>
> - **Phiên 1–4** thu dưới dạng nhận xét ngắn, **chưa theo đúng quy trình 3 câu** ở `02-guide.md` §4.2 — nên không có dữ liệu quan sát hành vi. Hai người (Hoàng Hải Dương, Đinh Quang Minh) chưa ghi mã HV.
> - **Phiên 5** chạy đúng quy trình (giao task → im lặng quan sát → hỏi 3 câu), có quan sát hành vi và thời gian hoàn thành — xem mục chi tiết bên dưới. **Còn thiếu quote nguyên văn.**
> - Rubric đòi ≥2 willing user đã khai từ CP1: **cần xác nhận** ai trong 5 người trên là willing user.

## Tổng hợp — 4 dòng bắt buộc

**Chủ đề lặp nhiều nhất:**
**Không hiểu vì sao một khái niệm được xếp Trọng tâm — 2/5 người, phát hiện độc lập.** Hoàng Hải Dương nói thẳng *"không hiểu tiêu chí trọng tâm"*; Nguyễn Yến Khanh quan sát thấy không hiểu ngay tại chỗ dù vẫn hoàn thành task. Hai nguồn khác nhau cùng chỉ một chỗ → đây là vấn đề thật, không phải ý kiến đơn lẻ. Nó đánh trúng hai nguyên tắc đã khai ở `spec.md` §4: **G2** (làm rõ mức độ tin cậy) và **G11** (giải thích vì sao).

Bên cạnh đó, sản phẩm **dễ dùng và đúng nhu cầu** — 4/5 người xác nhận hữu ích ("dễ sử dụng", "rất hữu ích", "tiện", "tính năng hữu ích"), khớp khảo sát 20 người (100% thấy Review Map hữu ích). Phiên 5 hoàn thành task trong **2'15"** so với quỹ 15 phút.

**1-2 thay đổi làm trước demo:**
1. **Làm rõ tiêu chí tier ngay trên màn Ôn tập** (phiên #3 + #5, mức Cao). Hiện lý do chỉ hiện khi mở từng khái niệm và bấm "Vì sao xếp trọng tâm?" — quá sâu. Cần một dòng giải thích ngắn ở đầu bản đồ: tier dựa trên mức giảng viên nhấn mạnh, số lần lặp lại, và việc có được nhắc ở phần tóm tắt cuối buổi hay không.
2. **Làm evidence trông bấm được rõ hơn** (phiên #5): mất ~20 giây user mới nhận ra trích dẫn có thể click để mở transcript. Đây là tính năng lõi của sản phẩm — nếu không phát hiện ra thì mất luôn khả năng tự kiểm chứng (nguyên tắc G2).

Cả hai đã ghi vào `spec.md` §9 Changelog.

**Giữ nguyên có lý do:**
- **Quiz nhỏ** (feedback #3): nằm trong **non-goals** đã chốt ở `spec.md` §4 trước 23:59 N1. Có căn cứ số: khảo sát 20 người cho thấy chỉ **10% chọn quiz** khi có 15 phút trước Lab/Quiz, trong khi **90% chọn "trích xuất top 3 kiến thức cốt lõi kèm trích dẫn"**. Thêm quiz sẽ phá lát cắt một quyết định AI và mâu thuẫn kịch bản §5 số 5 (từ chối khi học viên đòi sinh quiz).
- **Map khái niệm sang slide** (feedback #1): data pack chỉ có transcript, **không có slide**. Không có nguồn để nối — nếu tự suy diễn sẽ vi phạm chính nguyên tắc "mọi khái niệm phải có trích dẫn xác minh được". Đưa vào backlog thay vì làm ẩu.

**Đưa vào backlog (slide 6):**
- Neo khái niệm về **slide** chứ không chỉ đoạn transcript (cần data pack có slide) — feedback #1
- **Mục lục** điều hướng nhanh khi danh sách dài (21 khái niệm ở run-5) — feedback #3
- Đánh giá **chi phí/khả thi khi triển khai thật** ở quy mô lớp — feedback #4
- Cải thiện UI/UX tổng thể — feedback #2

---

## Người thực hiện

Theo `spec.md` §8: **Trương Minh Tâm** (dẫn phỏng vấn) + **Phạm Hải Yến** (ghi log song song, đối chiếu độc lập).
