# Kết quả lượt 5 — gộp trùng lặp hoạt động đúng

**Model:** `llama-3.3-70b-versatile` qua Groq (script `codebase/generate-review-map.mjs` + `codebase/lib/reviewMapGenerator.mjs`).
**Ngày chạy:** 2026-07-31. **Đây là lượt cuối cùng, dùng làm số liệu chính thức của nhóm.**

**Thay đổi so với lượt 4 — vẫn đúng một biến:** sửa dứt điểm hàm so khớp tên ở vòng 2b (gộp bằng code, không AI). Thêm danh sách stopword các từ chỉ loại/cấu trúc (`cơ chế`, `kiến trúc`, `kỹ thuật`, `khái niệm`, `của`, `và`…) và so khớp theo **tập từ lõi** thay vì chuỗi con, đồng thời chặn gộp nhầm với tên mang nghĩa đối chiếu ("sự khác biệt giữa X và Y" không được nuốt vào "X"). Prompt gán tier **giữ nguyên** từ lượt 3.

> **Ghi chú trung thực về phương pháp:** giống lượt 4, `trace.json` ghi `reusedCandidatesFrom: eval/run-4/candidates.json` và chỉ có **1 lời gọi AI** (bước gán tier). Lượt 5 **dùng lại 26 khái niệm nháp** thay vì chạy lại vòng 1 (extract), do giới hạn quota Groq free tier. Vì vậy lượt 5 đo **chất lượng bước gán tier + gộp**, không đo lại bước rút khái niệm. Lượt có đủ cả hai vòng AI chạy thật đầu-cuối gần nhất là **lượt 3** (10 lời gọi AI, `eval/run-3/trace.json`).

**Output:** `eval/run-5/ai-output.json` (21 khái niệm), `eval/run-5/candidates.json`, `eval/run-5/tagged-candidates.json`, `eval/run-5/citation-check.json`, `eval/run-5/trace.json`.

## Kết quả tổng quan

| Chỉ số | Lượt 3 | Lượt 4 | Lượt 5 |
|---|---|---|---|
| Số khái niệm cuối | 26 | 26 | **21** |
| Phân bố tier (core/important/supporting) | 15/7/4 | 10/8/8 | **10/5/6** |
| Citation verified | 42/52 (80,8%) | 56/62 (90,3%) | 58/62 (**93,5%**) |
| Bao phủ transcript | T04-015→094 | T04-003→096 | **T04-003→096** |
| Số nhóm gộp được | 0 | 0 | **3** |

**Việc sửa đạt mục tiêu:** vòng gộp lần đầu hoạt động — 26 candidate gộp còn 21 concept qua 3 nhóm: `Attention` ← {Attention, Multi-head Attention, Cơ chế attention}, `Context` ← {Context, Quản lý Context}, `Kiến trúc Transformer` ← {Kiến trúc Transformer, Transformer}. Trường `mergedFrom` trong output ghi lại đúng nguồn gộp, kiểm lại được.

## Bảng chấm 36 case theo `golden-set.md`

| ID | Verdict | Ghi chú |
|---|---|---|
| G01 | ❌ | "Mô hình ngôn ngữ lớn (LLM)" trích T04-047 (đúng ý dự đoán token) nhưng tier `important`, yêu cầu `core` |
| G02 | ✅ | "Attention" tier `core`, gộp đủ 3 mảnh, có citation T04-053 và T04-094 |
| G03 | ❌ | Token tier `supporting` (yêu cầu `core`); Context nay `core` nhưng Token vẫn dưới mức |
| G04 | ✅ | "Context" gộp cả "Quản lý Context", tier `core`, trích đủ T04-051/052/053 gồm cả context rot |
| G05 | ❌ | Không có concept temperature/top-k/top-p — hệ quả của việc tái sử dụng candidate từ lượt 4 (vốn kế thừa từ lượt 2) |
| G06 | ✅ | Evaluation có mặt, tier `core` |
| G07 | ✅ | Gom ở "Bức tranh tổng quan về AI" (`core`) + "Thuật ngữ AI" (`important`), phủ đúng ý 4 vòng lồng nhau, không còn tách 4 concept core rời rạc |
| G08 | ✅ | "Lịch sử AI" tier `important`, trích đúng câu factual "hai lần mùa đông" |
| G09 | ❌ | 21 khái niệm — vẫn vượt khoảng hợp lý 6–14, dù đã giảm từ 26 |
| G10 | ✅ | 100% concept có ≥1 trích dẫn; `schemaIssues` rỗng |
| G11 | ✅ | 62/62 segmentId tồn tại thật trong transcript |
| G12 | ❌ | 58/62 quote verify được (93,5%) — không đạt 100%. 4 citation lệch: "Kiến trúc Transformer" (T04-039 ×2) và "Token" (T04-049 ×2) |
| G13 | ✅ | Không concept nào có toàn bộ citation sai |
| G14 | ✅ | "Lịch sử AI" trích câu factual, không phải câu hedge — không bị đánh giá theo case này |
| G15 | ⬜ | Không concept nào trích T04-001/017/063 — chưa test được |
| G16 | ⬜ | Không concept nào trích T04-082 — chưa test được |
| G17 | ✅ | Concept trích T04-094/096 (phần quiz) chỉ mô tả nội dung kiến thức được nhắc, không đóng khung thành đề thi mẫu |
| G18 | ✅ | Không concept nào dự đoán nội dung thi |
| G19 | ✅ | Không concept nào nhận định học viên hiểu/chưa hiểu |
| G20 | ✅ | Evaluation đúng `core`, trích đúng câu "quyết định đến 80%" (T04-075) |
| G21 | ❌ | 3 ý lặp ở T04-091: dự đoán token (`important`, đạt), evaluation (`core`, đạt), "lớp công cụ bao quanh LLM" vẫn vắng mặt → thiếu 1/3 |
| G22 | ✅ | Attention = `core` **và** Kiến trúc Transformer = `core` — lần đầu cả hai cùng đạt sau khi gộp hết các mảnh rời |
| G23 | ❌ | Mixture of Experts tier `important` — vượt mức `≤ supporting` cho case tín hiệu mỏng (1 đoạn, giảng viên tự nói lộn slide) |
| G24 | ✅ | RLHF tier `important` — đúng mức `≤ important`, không trộn phần giai thoại công ty |
| G25 | ✅ | Không đoạn hoạt động lớp nào (T04-090/092/093/097/098) bị biến thành concept |
| G26 | ⬜ | Không concept nào trích cặp T04-042/043 — chưa test được |
| G27 | ❌ | 10 concept core, gồm cả "Nền tảng của AI", "Bức tranh tổng quan về AI", "Turing test", "AlphaGo", "Deep learning" — core vẫn loãng so với yêu cầu ≥2/3 trùng nhóm token/attention/evaluation |
| G28 | ✅ | Bao phủ T04-003 → T04-096, trải đều toàn buổi |
| G29 | ✅ | Mọi concept có evidence cụ thể kèm theo |
| G30 | ✅ | Mọi concept có `reasons` không rỗng, giải thích lý do tier |
| G31 | ✅ | AI luôn sinh nội dung, không trả lời kiểu "không tìm thấy nội dung" |
| G32 | ✅ | Cả hai ý nhấn mạnh rõ nhất đều `core`: Evaluation (T04-075) và Context/Quản lý context (T04-053) |
| G33 | ❌ | Ý lặp ở tóm tắt cuối chưa được ưu tiên nhất quán: "Vòng lặp autoregressive của LLM" (T04-096) chỉ `supporting`, thấp hơn "Turing test"/"AlphaGo" (`core`, chỉ nhắc 1 lần) |
| G34 | ❌ | Lọc quỹ 15 phút trả về 10 concept core — vẫn quá nhiều cho một danh sách rút gọn dùng được trong 15 phút |
| G35 | ❌ | Vẫn lẫn: "Nền tảng của AI"/"Bức tranh tổng quan"/"Turing test"/"AlphaGo" ở core trong khi Token (nền tảng thật) ở supporting |
| G36 | ❌ | Không concept nào phủ ý hallucination (T04-048) — T04-047 được trích nhưng T04-048 ("bản chất nó chỉ đang dự đoán thôi") không |

## Tổng kết

| | Số case | Tỉ lệ |
|---|---|---|
| Tổng case trong golden set | 36 | — |
| Không áp dụng lượt này (⬜) | 3 | — |
| **Case được đánh giá thật sự (33)** | | 100% |
| Đạt (✅) | 21 | **63,6%** |
| Không đạt (❌) | 12 | 36,4% |

**Đối chiếu quality bar (`spec.md` §7):**

- **≥70% case đạt** → **CHƯA ĐẠT** (63,6%). Thiếu 6,4 điểm phần trăm, tương đương khoảng 2 case.
- **100% không bịa đặt / không vượt phạm vi** → nhóm ③ (ngoài phạm vi) đạt **3/3 tuyệt đối** (G17, G18, G19) ở cả 5 lượt. Nhóm ① (nguồn sự thật) đạt 2/3: không có concept bịa đặt (G13 ✅), 62/62 segmentId có thật (G11 ✅), nhưng verbatim check 93,5% chưa đạt 100% (G12 ❌).

**Diễn biến qua 5 lượt: 46,9% → 59,4% → 48,5% → 57,6% → 63,6%.** Lượt 5 là kết quả cao nhất, nhưng **vẫn chưa đạt quality bar 70%** mà nhóm tự đặt và đã chốt trong `spec.md` trước 23:59 ngày 1. Nhóm giữ nguyên bar, không hạ xuống cho vừa số liệu.

## Phân tích: vì sao vẫn chưa đạt bar

Bốn lượt sửa đã giải quyết xong nhóm lỗi **cấu trúc** (mất khái niệm ở vòng gộp, xé nhỏ cùng một chủ đề, thiếu field, citation sai). Số case còn fail nay tập trung gần như hoàn toàn vào **một nhóm nguyên nhân duy nhất: chất lượng gán tier.**

1. **6/12 case fail cùng một gốc — tier bị đảo (G01, G03, G27, G33, G34, G35).** Model liên tục đẩy nội dung dễ kể chuyện (Turing test, AlphaGo, Nền tảng của AI, Bức tranh tổng quan) lên `core`, và đẩy nội dung kỹ thuật cần đọc kỹ (Token, vòng lặp autoregressive) xuống `supporting`. Xu hướng này xuất hiện ở **cả 5 lượt** và không bị ảnh hưởng bởi các sửa đổi về gộp — đúng như dự đoán, vì nhóm cố ý không đụng vào prompt gán tier từ lượt 3 để cô lập biến.

2. **Nguyên nhân sâu hơn: bước gán tier bị mất ngữ cảnh.** Khi tách vòng gộp ra khỏi AI (lượt 3), model ở bước gán tier chỉ còn nhìn thấy tên khái niệm + 1 quote ngắn + reason — nó **không còn biết** khái niệm đó được giảng trong bao nhiêu đoạn, có được nhắc lại ở phần tóm tắt cuối buổi (T04-091) hay không. Mà đây chính là hai tín hiệu mà `golden-set.md` dùng để định nghĩa tier đúng (G21, G32, G33). Nói cách khác: bản sửa chữa được lỗi mất dữ liệu nhưng đã lấy đi đúng thông tin mà bước gán tier cần nhất. Đây là bài học thiết kế đáng giá nhất của cả 5 lượt.

3. **G05 và G36 là lỗ hổng ở vòng 1 (extract), không phải vòng gán tier.** Khối temperature/top-k/top-p (T04-070–072) và ý hallucination (T04-048) chưa từng được sinh thành candidate trong tập đang dùng. Vì lượt 4 và 5 tái sử dụng candidate cũ để tiết kiệm quota, hai lỗ hổng này không có cơ hội được sửa. Lượt 3 — lượt duy nhất chạy lại vòng 1 — **có** bắt được temperature/top-k/top-p (G05 ✅), xác nhận đây là vấn đề quota chứ không phải giới hạn năng lực model.

4. **G12 (verbatim 100%) là điều kiện tuyệt đối của quality bar và vẫn chưa đạt**, dù đã cải thiện liên tục 88% → 82,6% → 80,8% → 90,3% → 93,5%. 4 citation còn lệch đều là cắt/ghép chuỗi con chứ không phải bịa nội dung, nhưng theo đúng chữ của bar thì vẫn tính là chưa đạt.

## Nếu còn thời gian — việc tiếp theo

Theo đúng phân tích ở điểm 2, hướng sửa tiếp theo **không** phải đổi model hay sửa vòng gộp, mà là **trả lại ngữ cảnh cho bước gán tier**: đưa kèm số đoạn transcript mà mỗi khái niệm trải qua, và một cờ đánh dấu "khái niệm này có xuất hiện lại trong đoạn tóm tắt cuối buổi T04-091 hay không" — hai tín hiệu này có thể tính bằng code xác định, không tốn thêm lời gọi AI. Nhóm ghi nhận đây là giả thuyết chưa được kiểm chứng, không tính vào kết quả đã đo.

Kết quả chính thức nhóm báo cáo là **63,6% (21/33 case)** — chưa đạt bar 70% đã cam kết, ghi nhận đầy đủ mọi case kể cả case fail, theo đúng luật hackathon.
