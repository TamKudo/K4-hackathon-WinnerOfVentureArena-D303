# Kết quả lượt 3 — AI thật (tách vòng gộp ra khỏi AI)

**Model:** `llama-3.3-70b-versatile` qua Groq (script `codebase/generate-review-map.mjs` + `codebase/lib/reviewMapGenerator.mjs`).
**Ngày chạy:** 2026-07-31.

**Thay đổi so với lượt 2 — sửa đúng nguyên nhân đã chẩn đoán ở `eval/run-2-results.md`:** lượt 2 kết luận điểm nghẽn nằm ở vòng 2 (consolidate) — model tự ý bỏ ~15/26 khái niệm nháp hợp lệ thay vì hạ tier. Lượt 3 tách hẳn vòng đó:

- **Vòng 1 (AI):** rút khái niệm nháp theo từng lô — giữ nguyên.
- **Vòng 2a (AI):** model **chỉ gán tier**, không được đổi tên/evidence, không được gộp hay bỏ khái niệm nào. Có validate cứng: nếu model trả thiếu/lặp index thì tự thử lại (tối đa 3 lần), không âm thầm dùng dữ liệu thiếu.
- **Vòng 2b + 2c (code, không AI):** gộp trùng lặp và dựng schema cuối bằng code xác định.

**Output:** `eval/run-3/ai-output.json` (26 khái niệm), `eval/run-3/candidates.json` (26 nháp), `eval/run-3/tagged-candidates.json`, `eval/run-3/citation-check.json`, `eval/run-3/trace.json` (10 lời gọi AI).

## Kết quả tổng quan

| Chỉ số | Lượt 2 | Lượt 3 |
|---|---|---|
| Số khái niệm cuối | 11 | **26** |
| Phân bố tier (core/important/supporting) | 6/–/– | **15/7/4** |
| Citation verified | 19/23 (82,6%) | 42/52 (**80,8%**) |
| Bao phủ transcript | đến T04-075 | T04-015 → **T04-094** |
| Candidate bị mất ở vòng gộp | ~15/26 | **0/26** |

**Việc sửa đã đạt đúng mục tiêu đề ra:** không còn khái niệm nào bị vòng gộp làm mất (0/26 so với ~15/26 ở lượt 2), và output phủ tới cuối buổi. Nhưng nó làm lộ ra hai vấn đề mới: **lạm phát core nghiêm trọng** (15/26 khái niệm là core) và **gộp trùng lặp hoàn toàn thất bại** (26 candidate → 26 concept, không gộp được cặp nào).

## Bảng chấm 36 case theo `golden-set.md`

Chú thích: ✅ Đạt · ❌ Không đạt · ⬜ Không áp dụng.

| ID | Verdict | Ghi chú |
|---|---|---|
| G01 | ❌ | Có concept "Dự đoán token" (T04-047) nhưng tier `important`, không phải `core` như yêu cầu |
| G02 | ❌ | Có concept "Attention" (T04-054) nhưng tier `supporting` — sai nặng so với yêu cầu `core` |
| G03 | ❌ | Token (T04-049) tier `supporting`, Context (T04-051) tier `important` — cả hai đều dưới `core` |
| G04 | ❌ | Không có concept riêng cho quản lý context/context rot; T04-053 không được trích |
| G05 | ✅ | Có concept "Temperature và top-k/top-p" (T04-071), tier `important` — **lần đầu tiên xuất hiện sau 3 lượt** |
| G06 | ✅ | Evaluation có mặt, tier `core` |
| G07 | ❌ | Lại tách "AI ⊃ ML ⊃ DL ⊃ GenAI" thành 4 concept riêng (AI, Machine Learning, Deep Learning, Generative AI), **tất cả đều `core`** — đúng lỗi đã gặp ở lượt 1, kỳ vọng là 1 concept `supporting` |
| G08 | ❌ | "Lịch sử AI" (T04-022) tier `core` — vượt xa kỳ vọng {supporting, important}; ngoài ra quote không verify được (xem G12) |
| G09 | ❌ | 26 khái niệm — vượt xa khoảng hợp lý 6–14, vụn thành sub-point |
| G10 | ✅ | 100% concept có ≥1 trích dẫn; `schemaIssues` rỗng |
| G11 | ✅ | 52/52 segmentId tồn tại thật trong transcript |
| G12 | ❌ | 42/52 quote verify được (80,8%) — không đạt 100%. 10 citation lệch, trong đó có cả trường hợp cắt ghép chứ không chỉ lệch hoa/thường (vd. "Lịch sử AI" trích T04-022, "Dự đoán token" trích T04-047) |
| G13 | ✅ | Không concept nào có toàn bộ citation sai — mọi concept đều còn ít nhất một trích dẫn verify được |
| G14 | ✅ | "Lịch sử AI" trích T04-022 nhưng quote bám câu factual "hai lần mùa đông", không phải câu hedge "chỉ mang tính tương đối" — theo định nghĩa case đã sửa sau lượt 2, không bị đánh giá theo case này |
| G15 | ⬜ | Không concept nào trích T04-001/017/063 (nhóm nhiều `[không nghe rõ]`) — chưa test được |
| G16 | ⬜ | Không concept nào trích T04-082 (dự đoán tương lai) — chưa test được |
| G17 | ✅ | Có concept "Transformer" trích T04-094 (phần quiz) nhưng chỉ mô tả nội dung kiến thức được nhắc, không đóng khung thành đề thi mẫu |
| G18 | ✅ | Không concept nào dự đoán nội dung thi |
| G19 | ✅ | Không concept nào nhận định học viên hiểu/chưa hiểu |
| G20 | ✅ | Evaluation đúng tier `core`, trích đúng câu "quyết định đến 80%" (T04-075) |
| G21 | ❌ | 3 ý lặp ở tóm tắt cuối (T04-091): dự đoán token = `important` (không đạt ≥ important? — đạt), lớp công cụ bao quanh LLM **vắng mặt hoàn toàn**, evaluation = core (đạt). Thiếu 1/3 ý → không đạt |
| G22 | ❌ | Transformer = `core` (đạt) nhưng Attention = `supporting` (fail nặng) — yêu cầu cả hai `core` |
| G23 | ❌ | Mixture of Experts tier `important` — vượt mức cho phép `≤ supporting` với case tín hiệu mỏng (1 đoạn) |
| G24 | ✅ | RLHF tier `important` — đúng mức `≤ important`; phần giai thoại công ty không bị trộn vào |
| G25 | ✅ | Không đoạn hoạt động lớp nào (T04-090/092/093/097/098) bị biến thành concept |
| G26 | ⬜ | Không concept nào trích cặp T04-042/T04-043 — chưa test được |
| G27 | ❌ | Core tier có 15 khái niệm, gồm cả AI/ML/DL/GenAI/Turing test/AlphaGo/ChatGPT — bị loãng, không tập trung vào 3 ý nhấn mạnh nhất (token/attention/evaluation). Attention thậm chí không nằm trong core |
| G28 | ✅ | Bao phủ T04-015 → T04-094, trải đều toàn buổi, không dồn vào đầu buổi |
| G29 | ✅ | Mọi concept có evidence cụ thể kèm theo |
| G30 | ✅ | Mọi concept có mảng `reasons` không rỗng, giải thích lý do tier |
| G31 | ✅ | AI luôn sinh ra nội dung, không trả lời kiểu "không tìm thấy nội dung" |
| G32 | ❌ | Ý nhấn mạnh nhất (Evaluation) đúng core, nhưng "quản lý context" (T04-057/053 — giảng viên nói "rất là quan trọng") vắng mặt hoàn toàn |
| G33 | ❌ | Ý lặp ở tóm tắt cuối không được ưu tiên nhất quán: "Dự đoán token" chỉ `important` trong khi "Turing test"/"AlphaGo" (nhắc 1 lần) lại `core` |
| G34 | ❌ | Lọc theo quỹ 15 phút sẽ trả về 15 concept core — không còn là một danh sách rút gọn dùng được, mất tác dụng của bộ lọc thời gian |
| G35 | ❌ | Không phân biệt được nền tảng với mở rộng: nhóm lịch sử/bức tranh AI (kỳ vọng supporting) nằm ở core, trong khi Attention/Token (nền tảng thật) nằm ở supporting — **tier bị đảo ngược** |
| G36 | ❌ | Không concept nào phủ ý hallucination (T04-048); "Dự đoán token" chỉ trích T04-047, không chạm phần "chỉ đang dự đoán thôi" ở T04-048 |

## Tổng kết

| | Số case | Tỉ lệ |
|---|---|---|
| Tổng case trong golden set | 36 | — |
| Không áp dụng lượt này (⬜) | 3 | — |
| **Case được đánh giá thật sự (33)** | | 100% |
| Đạt (✅) | 16 | **48,5%** |
| Không đạt (❌) | 17 | 51,5% |

**Đối chiếu quality bar (`spec.md` §7):**

- **≥70% case đạt** → **CHƯA ĐẠT** (48,5%).
- **100% không bịa đặt / không vượt phạm vi** → nhóm ③ đạt 3/3 (G17, G18, G19). Nhóm ① đạt 2/3: không có concept bịa đặt (G13 ✅, G11 ✅) nhưng verbatim check chỉ 80,8% (G12 ❌).

**So với lượt 2 (59,4%): giảm 10,9 điểm phần trăm.** Ghi nhận trung thực: đây là một bước lùi về điểm số, dù đã sửa đúng nguyên nhân đã chẩn đoán.

## Phân tích nguyên nhân

1. **Sửa đúng bệnh nhưng lộ ra bệnh nặng hơn ở tầng dưới.** Việc cấm AI xoá khái niệm đã chặn được lỗi mất dữ liệu của lượt 2 (0/26 bị mất). Nhưng khi toàn bộ 26 candidate được giữ lại, chất lượng thật của vòng 1 mới lộ ra: bản thân danh sách nháp vốn đã vụn (26 khái niệm cho một buổi 2 tiếng) và trùng lặp nhiều. Trước đây vòng gộp AI đang vô tình *che* khuyết điểm này bằng cách xoá bừa.

2. **Gộp trùng lặp bằng code thất bại hoàn toàn: 26 → 26, không gộp được cặp nào.** Điều kiện gộp ở lượt 3 quá chặt — yêu cầu tên gần giống **VÀ** chung `segmentId`. Hai candidate cùng một khái niệm nhưng trích hai đoạn khác nhau thì không bao giờ khớp. Ví dụ rõ nhất: "Attention" (T04-054) và "Transformer" (T04-094) là hai mảnh của cùng một chủ đề nhưng nằm riêng; "Mô hình ngôn ngữ lớn" xuất hiện **hai lần** như hai concept độc lập (index 12 ở T04-046 và index 19 ở T04-067). Đây là nguyên nhân trực tiếp của G09 (26 khái niệm) và một phần G27/G34.

3. **Lạm phát core nặng nhất trong cả 3 lượt: 15/26 = 58% khái niệm là core.** Prompt gán tier có nêu "khoảng 5 khái niệm core" nhưng để ở dạng *gợi ý mềm* ("không bắt buộc tuyệt đối nếu có nhiều khái niệm thực sự xứng đáng hơn con số này"). Model đã hiểu câu này theo nghĩa rộng nhất. Hệ quả dây chuyền: G07, G08, G27, G33, G34, G35 đều fail vì cùng một gốc.

4. **Tier bị đảo ngược ở đúng chỗ quan trọng nhất (G35).** Khái niệm mang tính giai thoại/dễ tóm tắt (Turing test, AlphaGo, ChatGPT, Lịch sử AI) được đẩy lên core, trong khi khái niệm kỹ thuật nền tảng cần đọc kỹ (Attention → supporting, Token → supporting) bị đẩy xuống. Đây lặp lại đúng xu hướng đã ghi nhận ở lượt 1: model ưu tiên nội dung dễ kể chuyện hơn nội dung giải thích cơ chế. Khi tách riêng bước gán tier, model mất luôn ngữ cảnh "khái niệm này được giảng bao lâu, có được nhắc lại cuối buổi không" — nó chỉ còn nhìn thấy tên + 1 quote ngắn.

5. **Verbatim check tụt xuống 80,8%** vì số citation tăng lên (52) và có thêm trường hợp cắt ghép thật sự (không chỉ lệch hoa/thường như lượt 1).

## Kế hoạch cho lượt 4

- **Nới điều kiện gộp:** bỏ vế "chung segmentId", chỉ so khớp phần lõi của tên khái niệm (bỏ từ nối "cơ chế/kiến trúc/kỹ thuật"), để "Cơ chế attention" và "Attention" quy về một.
- Giữ nguyên kiến trúc tách vòng gộp — phần này đã chứng minh chặn được lỗi mất dữ liệu.
- Chưa động tới prompt gán tier ở lượt 4, để cô lập đúng một biến (chỉ đổi logic gộp) và biết chắc thay đổi nào gây ra khác biệt gì.
