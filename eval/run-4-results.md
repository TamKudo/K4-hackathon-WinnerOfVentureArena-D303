# Kết quả lượt 4 — sửa logic gộp trùng lặp (code, không AI)

**Model:** `llama-3.3-70b-versatile` qua Groq (script `codebase/generate-review-map.mjs` + `codebase/lib/reviewMapGenerator.mjs`).
**Ngày chạy:** 2026-07-31.

**Thay đổi so với lượt 3 — đúng một biến:** nới điều kiện gộp trùng lặp ở vòng 2b. Lượt 3 yêu cầu tên gần giống **VÀ** chung `segmentId` nên gộp được 0/26; lượt 4 bỏ vế chung-segmentId, chỉ so khớp phần lõi của tên sau khi loại các từ chỉ loại/cấu trúc ("cơ chế", "kiến trúc", "kỹ thuật"). Prompt gán tier **giữ nguyên hoàn toàn** để cô lập đúng một biến.

> **Ghi chú trung thực về phương pháp — lượt này không phải một lượt chạy đầu-cuối mới.**
> `trace.json` ghi `reusedCandidatesFrom: eval/run-2/candidates.json` và chỉ có **1 lời gọi AI** (bước gán tier), thay vì 10 lời gọi như lượt 3. Nghĩa là lượt 4 **dùng lại 26 khái niệm nháp đã sinh ở lượt trước**, không gọi lại vòng 1 (extract). Lý do: Groq free tier đã hết quota token/ngày ở lần chạy 2026-07-30 (xem `spec.md` §7 lượt 3), nên nhóm tiết kiệm quota bằng cách chỉ chạy lại phần đang sửa. Hệ quả cần nêu rõ khi đọc số: lượt 4 đo **chất lượng của bước gán tier + gộp**, trên một tập candidate cố định — không đo lại chất lượng bước rút khái niệm.

**Output:** `eval/run-4/ai-output.json` (26 khái niệm), `eval/run-4/candidates.json`, `eval/run-4/tagged-candidates.json`, `eval/run-4/citation-check.json`, `eval/run-4/trace.json`.

## Kết quả tổng quan

| Chỉ số | Lượt 3 | Lượt 4 |
|---|---|---|
| Số khái niệm cuối | 26 | 26 |
| Phân bố tier (core/important/supporting) | 15/7/4 | **10/8/8** |
| Citation verified | 42/52 (80,8%) | 56/62 (**90,3%**) |
| Bao phủ transcript | T04-015 → T04-094 | **T04-003 → T04-096** |
| Số cặp gộp được | 0 | **0** |

**Việc sửa không đạt mục tiêu:** dù đã nới điều kiện gộp, số concept cuối vẫn là 26 — không cặp nào được gộp. Chi tiết nguyên nhân ở phần phân tích.

## Bảng chấm 36 case theo `golden-set.md`

| ID | Verdict | Ghi chú |
|---|---|---|
| G01 | ❌ | "Mô hình ngôn ngữ lớn (LLM)" (T04-047, chứa đúng ý dự đoán token) tier `important`, không phải `core` |
| G02 | ✅ | "Attention" (T04-053) tier `core` — sửa được so với lượt 3 (`supporting`) |
| G03 | ❌ | Token tier `supporting`, Context tier `supporting` — cả hai dưới `core` |
| G04 | ✅ | Có concept riêng "Quản lý Context" (T04-053), tier `core` — nằm trong khoảng chấp nhận {core, important} |
| G05 | ❌ | Không có concept temperature/top-k/top-p — candidate tái sử dụng từ lượt 2 vốn đã thiếu khối này (lượt 3 có, vì lượt 3 chạy lại vòng 1) |
| G06 | ✅ | Evaluation có mặt, tier `core` |
| G07 | ✅ | Không còn tách AI/ML/DL/GenAI thành 4 concept core; nay gom ở "Bức tranh tổng quan về AI" (`core`) + "Thuật ngữ AI" (`important`) — vẫn lệch tier kỳ vọng supporting nhưng không còn 4 concept core rời rạc, và phủ đúng ý 4 vòng lồng nhau |
| G08 | ✅ | "Lịch sử AI" tier `important`, nằm trong khoảng {supporting, important}, trích đúng câu factual "hai lần mùa đông" |
| G09 | ❌ | 26 khái niệm — vượt khoảng hợp lý 6–14 |
| G10 | ✅ | 100% concept có ≥1 trích dẫn; `schemaIssues` rỗng |
| G11 | ✅ | 62/62 segmentId tồn tại thật |
| G12 | ❌ | 56/62 quote verify được (90,3%) — không đạt 100%. 6 citation lệch, tập trung ở "Kiến trúc Transformer" (T04-038, T04-039) và "Token" (T04-049) |
| G13 | ✅ | Không concept nào có toàn bộ citation sai |
| G14 | ✅ | "Lịch sử AI" trích câu factual, không phải câu hedge — không bị đánh giá theo case này |
| G15 | ⬜ | Không concept nào trích T04-001/017/063 — chưa test được |
| G16 | ⬜ | Không concept nào trích T04-082 — chưa test được |
| G17 | ✅ | Concept trích T04-094 (phần quiz) chỉ mô tả nội dung kiến thức, không đóng khung thành đề thi |
| G18 | ✅ | Không concept nào dự đoán nội dung thi |
| G19 | ✅ | Không concept nào nhận định học viên hiểu/chưa hiểu |
| G20 | ✅ | Evaluation đúng `core`, trích đúng câu "quyết định đến 80%" |
| G21 | ❌ | 3 ý lặp ở T04-091: dự đoán token (`important`, đạt), evaluation (`core`, đạt), nhưng "lớp công cụ bao quanh LLM" vẫn vắng mặt → thiếu 1/3 |
| G22 | ❌ | Attention = `core` (đạt) nhưng concept "Transformer" (T04-094) lại `important` và "Cơ chế attention" `supporting` — cùng một chủ đề bị xé thành 3 concept ở 3 tier khác nhau, không thoả "cả hai phải core" |
| G23 | ❌ | Mixture of Experts tier `important` — vượt mức `≤ supporting` |
| G24 | ✅ | RLHF tier `important` — đúng mức `≤ important` |
| G25 | ✅ | Không đoạn hoạt động lớp nào bị biến thành concept |
| G26 | ⬜ | Không concept nào trích cặp T04-042/043 — chưa test được |
| G27 | ❌ | 10 concept core, gồm cả "Nền tảng của AI", "Bức tranh tổng quan về AI", "Turing test", "AlphaGo", "Deep learning" — core vẫn loãng, chưa tập trung vào 3 ý nhấn mạnh nhất |
| G28 | ✅ | Bao phủ T04-003 → T04-096, trải đều toàn buổi — tốt nhất trong cả 4 lượt |
| G29 | ✅ | Mọi concept có evidence cụ thể |
| G30 | ✅ | Mọi concept có `reasons` không rỗng |
| G31 | ✅ | AI luôn sinh nội dung, không trả lời "không tìm thấy" |
| G32 | ✅ | Cả hai ý nhấn mạnh rõ nhất đều đúng core: Evaluation (T04-075) và Quản lý Context (T04-053, "rất là quan trọng") — **lần đầu đạt sau 4 lượt** |
| G33 | ❌ | Ý lặp ở tóm tắt cuối vẫn không được ưu tiên nhất quán: "Vòng lặp autoregressive" (T04-096, đúng ý tóm tắt cuối) chỉ `supporting`, thấp hơn "Turing test"/"AlphaGo" (`core`, nhắc 1 lần) |
| G34 | ❌ | Lọc 15 phút trả về 10 concept core — vẫn quá nhiều cho một danh sách rút gọn |
| G35 | ❌ | Vẫn lẫn lộn: "Nền tảng của AI"/"Bức tranh tổng quan"/"Turing test"/"AlphaGo" ở core, trong khi Token/Context (nền tảng thật) ở supporting |
| G36 | ❌ | Không concept nào phủ ý hallucination (T04-048) |

## Tổng kết

| | Số case | Tỉ lệ |
|---|---|---|
| Tổng case trong golden set | 36 | — |
| Không áp dụng lượt này (⬜) | 3 | — |
| **Case được đánh giá thật sự (33)** | | 100% |
| Đạt (✅) | 19 | **57,6%** |
| Không đạt (❌) | 14 | 42,4% |

**Đối chiếu quality bar (`spec.md` §7):**

- **≥70% case đạt** → **CHƯA ĐẠT** (57,6%).
- **100% không bịa đặt / không vượt phạm vi** → nhóm ③ đạt 3/3. Nhóm ① đạt 2/3: không bịa đặt (G13, G11 ✅) nhưng verbatim check 90,3% (G12 ❌).

**So với lượt 3 (48,5%): tăng 9,1 điểm phần trăm. So với lượt 2 (59,4%): vẫn thấp hơn 1,8 điểm.**

## Phân tích nguyên nhân

1. **Việc nới điều kiện gộp không có tác dụng — vẫn 26 → 26.** Lý do: hàm `namesLikelyMatch` yêu cầu tập từ của tên này phải là **tập con** của tên kia sau khi bỏ stopword. Các cặp thật sự trùng lại không thoả điều kiện đó: "Attention" vs "Multi-head Attention" — `{attention}` ⊂ `{multihead, attention}` nên **có** gộp được về nguyên tắc, nhưng "Context" vs "Quản lý Context" cũng vậy, mà kết quả vẫn ra 26 concept riêng. Đối chiếu `ai-output.json` cho thấy các concept này tồn tại độc lập (`multihead_attention_15`, `quan_ly_context_16`) — nghĩa là điều kiện gộp trong lần chạy này chưa thực sự khớp. Đây là lỗi còn lại chưa xử lý xong ở lượt 4.

2. **Điểm tăng chủ yếu đến từ tier, không từ gộp.** Dù không gộp được cặp nào, tỉ lệ core giảm từ 15/26 xuống 10/26 và bốn case tier (G02, G04, G07, G32) chuyển từ ❌ sang ✅. Vì prompt gán tier giữ nguyên, khác biệt này đến từ **tính ngẫu nhiên giữa các lần gọi model** (temperature 0.2, không phải 0) chứ không phải từ thay đổi nhóm chủ động làm — cần nói rõ điều này thay vì quy công cho bản sửa.

3. **G05 quay lại fail do dùng lại candidate cũ.** Lượt 3 chạy vòng 1 thật nên bắt được khối temperature/top-k/top-p; lượt 4 tái sử dụng candidate từ lượt 2 — vốn đã thiếu khối này ngay từ đầu. Đây là cái giá trực tiếp của việc tiết kiệm quota, không phải lỗi thiết kế pipeline.

4. **Cùng một chủ đề bị xé thành nhiều concept ở nhiều tier khác nhau (G22).** Attention xuất hiện dưới ba tên: "Attention" (`core`), "Multi-head Attention" (`important`), "Cơ chế attention" (`supporting`). Với học viên, đây là lỗi nhìn thấy được ngay trên UI: cùng một thứ nằm ở ba mức ưu tiên khác nhau. Đây là hệ quả trực tiếp của việc gộp thất bại (điểm 1).

5. **Verbatim check cải thiện rõ (80,8% → 90,3%)** nhờ chuẩn hoá dấu nháy trong `normalizeQuoteChars`, nhưng 6 citation còn lệch vẫn giữ G12 ở mức fail.

## Kế hoạch cho lượt 5

- Sửa dứt điểm logic gộp để các cặp cùng lõi tên thật sự gộp được ("Attention" + "Multi-head Attention" + "Cơ chế attention" → 1; "Context" + "Quản lý Context" → 1).
- Vẫn giữ nguyên prompt gán tier, để lượt 5 tiếp tục cô lập biến "gộp".
- Ghi nhận trước: nếu lượt 5 gộp thành công thì số concept sẽ giảm, G09/G22 có khả năng đạt — nhưng G05 sẽ vẫn fail nếu tiếp tục tái sử dụng candidate cũ.
