# LectureFocus — chi tiết UI, flow & mock data

Tài liệu này chỉ mô tả **cách prototype được dựng** (`codebase/lecturefocus.html`, HTML/CSS/JS thuần, không framework, không backend). Quyết định sản phẩm, evidence, tiêu chí thành công nằm trong `spec.md` — file này không lặp lại, chỉ nói "cái gì nằm ở đâu trong code".

## 4 màn hình + flow

```
Home (chọn bài học)
  → Lesson (landing của 1 bài: disclaimer + nút "Review this lesson")
    → Review Map (danh sách khái niệm theo tier, lọc theo quỹ thời gian)
      → Concept Detail (ý cần nắm + lý do ưu tiên, mỗi ý có nút trích dẫn)
```

Song song 2 lớp phủ (overlay), mở từ bất kỳ màn nào có bài học đang chọn:

- **Transcript drawer** (`openTranscript()`) — panel trượt từ phải, hiện toàn bộ transcript của bài, mỗi đoạn có mã `[Txx-NNN]`. Khi mở từ một nút trích dẫn cụ thể (`jumpToEvidence()`), tự cuộn tới đúng đoạn và bôi vàng (`mark.quote-hl`) đúng câu quote, gạch chân keyPhrase nếu có. Có nút "Trước/Sau" (`prevEvidence`/`nextEvidence`) để duyệt qua hết danh sách evidence của khái niệm đang xem.
- **AI Tutor modal** (`openTutor()`) — **mock hoàn toàn**, chỉ hiện thông báo "Chưa kết nối — mock cho demo", không gọi AI gì. Đây là nút ngoài phạm vi (§4 spec.md: non-goal "chatbot AI Tutor thật").

## Màn Review Map — chi tiết hành vi

- 3 nhóm theo tier: `core` → `important` → `supporting`, mỗi nhóm sort theo `order` do concept tự khai.
- Bộ lọc quỹ thời gian: nút "Tất cả / 15' / 30' / 60'". Khi chọn một mốc phút cụ thể, `planForBudget()` duyệt danh sách đã sort theo tier rồi cộng dồn `estimated_minutes`, dừng khi vượt ngân sách — luôn giữ **ít nhất 1 khái niệm** dù nó vượt luôn ngân sách một mình. Đây là cách áp dụng G8 (dễ bỏ qua) trong spec.md: học viên đổi quỹ thời gian tuỳ ý, hệ thống không ép theo thứ tự.
- Card khái niệm chỉ hiện `short_summary`, không hiện toàn bộ lý do — bấm "Xem chi tiết" mới sang Concept Detail.

## Màn Concept Detail — chi tiết hành vi

- Header: badge tier + `~estimated_minutes'` + số ý cần nắm.
- `DEPTH_HINT` theo tier: core → "ôn sâu hơn", important → "ôn vừa đủ", supporting → "context ngắn".
- Khối "Những ý cần nắm" (`learningPoints`) và "Tại sao nên tập trung?" (`reasons`) — mỗi item có nút trích dẫn `[Txx-NNN] · Xem trong bài giảng →` mở transcript drawer đúng đoạn đó. Đây là cách áp dụng G11 (giải thích vì sao) — mọi tuyên bố đều trace được về transcript.
- Khối "Trong tài liệu: Slide — (sắp có)" / "Trong bài giảng: timestamp — (sắp có)" — placeholder cho việc trỏ tới slide/mốc thời gian video, **chưa làm**, không phải bug.

## Mock data — schema

Toàn bộ dữ liệu nằm trong biến `DATA` (một object JS literal, không fetch từ đâu):

```
DATA.lessonOrder: string[]                 // thứ tự hiện ở Home
DATA.lessons[lessonId] = {
  id, title, subtitle, disclaimer,
  transcript_source: string,               // tên file trong data/vlearn-pack/transcript/
  counts: { total, core, important, supporting },
  segments: [{ id: "Txx-NNN", text }],     // copy nguyên văn transcript đã làm sạch, dùng cho drawer + verify quote
  concepts: [{
    id, name, tier: "core"|"important"|"supporting", order, estimated_minutes,
    short_summary,
    learningPoints: [{ text, evidence: { segmentId, quote, keyPhrase? } }],
    reasons:        [{ text, evidence: { segmentId, quote, keyPhrase? } }]
  }]
}
```

`evidence.quote` phải là chuỗi con nguyên văn của `segments[].text` tương ứng — `renderSegmentHtml()` dùng `seg.text.includes(activeEv.quote)` để định vị và highlight; nếu quote không khớp nguyên văn thì đơn giản là **không highlight được gì** (không lỗi, không bịa) — cùng nguyên tắc "nguồn sự thật" mà `codebase/generate-review-map.mjs` áp dụng khi sinh dữ liệu bằng AI thật (xem `eval/README.md`).

## 2 bài học có trong mock data — cái nào là trọng tâm

| Lesson id | Nguồn | Vai trò |
|---|---|---|
| `day01-foundation` | `transcript-04-clean.md` (Day 1 — Foundation) | **Trọng tâm lát cắt** — đây là bài duy nhất có golden set (`eval/golden-set.md`) và lời gọi AI thật (`codebase/generate-review-map.mjs`). `DATA.lessons["day01-foundation"].concepts` **đã được thay bằng đúng output AI thật** ở `eval/run-2/ai-output.json` (lượt 2, 59,4% qua golden set — xem `spec.md` §7), giữ nguyên `segments` gốc. `order`/`estimated_minutes` (không có trong output AI, chỉ phục vụ UI) được gán bằng script theo tier: core=5', important=4', supporting=3'. |
| `day02-metrics-automation` | `transcript-02-clean.md` (Day 2 — Chỉ số & tự động hoá) | Chỉ để màn Home có ≥2 thẻ bài học cho thật — thuộc non-goal "chọn nhiều bài học" đã khai trong `spec.md` §4. Không có golden set, không có kế hoạch nối AI thật. |

## Prototype hiện đã là end-to-end thật cho lát cắt chính

`DATA.lessons["day01-foundation"].concepts` không còn là dữ liệu dựng tay (lượt 0) — đã nối trực tiếp với `eval/run-2/ai-output.json` bằng `codebase/wire-ai-output-to-ui.mjs` (`node codebase/wire-ai-output-to-ui.mjs [đường dẫn ai-output.json]`, mặc định run-2). Vì quality bar (≥70%) **chưa đạt** ở lượt 2 (59,4%), UI đang hiển thị đúng kết quả thật kèm hạn chế đã ghi nhận trong `eval/run-2-results.md` (ví dụ: thiếu "Quản lý Context/temperature" ở tier phù hợp, bỏ sót 1/4 cuối transcript) — đúng luật "kết quả thấp không ảnh hưởng điểm nếu ghi nhận đầy đủ, trung thực". Nếu chạy lượt 3 trước CP6 và đạt bar cao hơn, lặp lại đúng phép nối này với `eval/run-3/ai-output.json`.