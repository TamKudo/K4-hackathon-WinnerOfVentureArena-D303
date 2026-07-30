# Kết quả lượt 1 — AI thật (CP3)

**Model:** `llama-3.3-70b-versatile` qua Groq API (script `codebase/generate-review-map.mjs`, không hardcode).
**Vì sao 2 vòng gọi AI thay vì 1:** free tier Groq giới hạn 6.000-12.000 token/phút, trong khi cả transcript ~20.000+ token — không thể gửi nguyên transcript trong 1 lần gọi. Script chia transcript thành 6 lô (~18 đoạn/lô), gọi AI rút khái niệm nháp cho từng lô (vòng 1), rồi gọi AI thêm 1 lần để gộp 24 khái niệm nháp thành 14 khái niệm cuối (vòng 2). Cả 2 vòng đều là lời gọi AI thật, có trace đầy đủ trong `eval/run-1/trace.json`.
**Input:** `data/vlearn-pack/transcript/transcript-04-clean.md` (98 đoạn).
**Output:** `eval/run-1/ai-output.json` (14 khái niệm cuối), `eval/run-1/candidates.json` (24 khái niệm nháp trước khi gộp), `eval/run-1/citation-check.json` (kiểm tra tự động mọi trích dẫn).

## Bảng chấm 36 case theo `golden-set.md`

Chú thích verdict: ✅ Đạt · ❌ Không đạt · ⬜ Không áp dụng (AI không đụng tới đoạn/tình huống liên quan ở lượt này, hoặc case cần tích hợp vào UI mới test được).

| ID | Verdict | Ghi chú |
|---|---|---|
| G01 | ❌ | Không có khái niệm riêng cho "LLM dự đoán token tiếp theo" — ý autoregressive/hallucination (T04-047, T04-048) hoàn toàn vắng mặt, chỉ còn 1 câu lồng trong concept Transformer |
| G02 | ❌ | Attention bị xếp tier `important`, không phải `core` như bản dựng tay |
| G03 | ❌ | Không có khái niệm nào cho Token/context window — toàn bộ đoạn T04-049 đến T04-051 không được trích dẫn |
| G04 | ❌ | Không có khái niệm cho "quản lý context" — T04-057 (đoạn giảng viên tự nói "rất là quan trọng") không được dùng |
| G05 | ❌ | Không có khái niệm cho temperature/top-k/top-p — T04-070 đến T04-072 không được trích dẫn |
| G06 | ✅ | Evaluation được sinh ra, tier `core` |
| G07 | ❌ | Model tách "AI ⊃ ML ⊃ DL ⊃ GenAI" (bản tay: 1 concept supporting) thành **4 concept riêng, đều tier `core`** — lệch tier nghiêm trọng và làm loãng cấu trúc |
| G08 | ❌ | "Lịch sử AI" chỉ trích đúng 1 câu mở đầu (T04-022), không phủ được ý "2 mùa đông" hay deep learning 2006/2012 |
| G09 | ✅ | 14 khái niệm — trong khoảng hợp lý 6–14 |
| G10 | ✅ | Mọi concept có ≥1 trích dẫn (kể cả concept thiếu mảng `reasons` vẫn có `learningPoints` với evidence) |
| G11 | ✅ | 34/34 `segmentId` trích dẫn tồn tại thật trong transcript |
| G12 | ❌ | 30/34 quote khớp nguyên văn (88%, không đạt 100%) — **nhưng cả 4 trường hợp lệch đều chỉ là viết hoa chữ đầu câu khi trích giữa câu** (vd "vùng màu cam..." → AI viết "Vùng màu cam..."), không phải bịa nội dung. Xem phân tích bên dưới. |
| G13 | ✅ | Không có concept nào toàn bộ trích dẫn là bịa/sai hoàn toàn |
| G14 | ❌ | T04-022 có câu giảng viên tự nhận "chỉ mang tính tương đối... không thực sự chính xác" — nhưng "Lịch sử AI" vẫn tier `important` và `uncertain_signal: false`, không hạ tier/gắn cờ như quy tắc |
| G15 | ⬜ | AI không trích đoạn nào trong nhóm nhiều `[không nghe rõ]` (T04-001, T04-017, T04-063) ở lượt này — chưa test được |
| G16 | ⬜ | AI không trích T04-082 (dự đoán tương lai) ở lượt này — chưa test được |
| G17 | ✅ | Quiz Kahoot (T04-094) chỉ được dùng làm evidence củng cố định nghĩa Transformer, không bị biến thành đề thi/dự đoán |
| G18 | ✅ | Không concept nào dự đoán nội dung thi |
| G19 | ✅ | Không concept nào nhận định học viên hiểu/chưa hiểu |
| G20 | ✅ | Evaluation đúng tier `core`, trích đúng câu "quyết định đến 80%" |
| G21 | ❌ | 2/3 ý lặp ở tóm tắt cuối (T04-091) được ưu tiên đúng (Transformer, Evaluation = core), nhưng ý "lớp công cụ bao quanh LLM" bị xếp tier `supporting` (concept "Kết nối với các công cụ bên ngoài") — không đạt ≥ important |
| G22 | ❌ | Transformer = core (đạt) nhưng Attention = important (không đạt) — yêu cầu cả hai phải core |
| G23 | ✅ | Model không tạo concept riêng cho Mixture of Experts — không vi phạm |
| G24 | ❌ | Concept "Reinforcement Learning" tier `core` — vượt mức `≤ important` cho phép với case hiếm |
| G25 | ✅ | Không đoạn hoạt động lớp thuần tương tác nào (T04-090/092/097) bị biến thành concept |
| G26 | ⬜ | AI không trích T04-042/T04-043 (cặp đoạn có vẻ mâu thuẫn theo mốc thời gian) — chưa test được |
| G27 | ✅ | Core tier phủ được ý token/transformer (qua concept Transformer) và evaluation — 2/3 ý nhấn mạnh nhất có mặt ở core |
| G28 | ✅ | 14 khái niệm trải khá đều từ đầu đến cuối buổi (T04-015 đến T04-076), không dồn hết vào phần mở đầu |
| G29 | ✅ | Mọi concept có bằng chứng cụ thể kèm theo, không phải tóm tắt suông |
| G30 | ❌ | Concept "Kết nối với các công cụ bên ngoài" thiếu hẳn mảng `reasons` — không có lý do giải thích tier khi xem chi tiết |
| G31 | ✅ | AI luôn sinh ra nội dung, không có phản hồi kiểu "không tìm thấy nội dung" |
| G32 | ❌ | Ý nhấn mạnh rõ nhất (Evaluation, T04-075) đúng core, nhưng ý nhấn mạnh thứ hai (quản lý context, T04-057) vắng mặt hoàn toàn |
| G33 | ❌ | Không nhất quán: 2/3 ý lặp ở tóm tắt được ưu tiên đúng, 1/3 (lớp công cụ) bị đánh tier thấp hơn ý chỉ nhắc 1 lần |
| G34 | ⬜ | Cần tích hợp `ai-output.json` vào `codebase/lecturefocus.html` mới test được hành vi lọc theo quỹ thời gian |
| G35 | ❌ | Tier bị đảo ngược một phần: nhóm "AI ⊃ ML ⊃ DL ⊃ GenAI" (kỳ vọng supporting) lại core, trong khi nhóm nền tảng thật (token/context/sampling) vắng mặt hoàn toàn |
| G36 | ❌ | Không có concept nào phủ ý hallucination (T04-048) — một nội dung được nhấn khá rõ và liên quan trực tiếp lý do sản phẩm cần trích dẫn thay vì tóm tắt suông |

## Tổng kết

| | Số case | Tỉ lệ |
|---|---|---|
| Tổng case trong golden set | 36 | — |
| Không áp dụng lượt này (⬜) | 4 | — |
| **Case được đánh giá thật sự (32)** | | **100%** |
| Đạt (✅) | 15 | **46,9%** |
| Không đạt (❌) | 17 | 53,1% |

**Đối chiếu quality bar (`spec.md` §7):**

- **≥70% case đạt** → **CHƯA ĐẠT** (46,9%).
- **100% không chứa khái niệm bịa đặt hoặc tuyên bố vượt phạm vi** → nhóm ③ (ngoài phạm vi) đạt 100% (3/3: G17, G18, G19). Nhóm ① (nguồn sự thật): không có concept nào bịa đặt hoàn toàn (G13 đạt), nhưng kiểm tra tự động trích dẫn nguyên văn chỉ đạt 88% (30/34) do 4 trích dẫn lệch **viết hoa chữ đầu**, không phải bịa nội dung — **kỹ thuật chưa đạt 100% dù không có fabrication thật sự**, cần siết prompt ở lượt sau.

## Phân tích nguyên nhân chưa đạt

1. **Bỏ sót toàn bộ khối kiến thức kỹ thuật đậm đặc (token, context window, temperature/top-k/top-p — T04-049 đến T04-072).** Khối này nằm vắt qua ranh giới 2 lô (lô có 18 đoạn/lô), và model có xu hướng ưu tiên nội dung mang tính giai thoại, dễ tóm tắt (lịch sử AI, AlphaGo, Turing test) hơn nội dung giải thích cơ chế kỹ thuật cần đọc kỹ. Đây là nguyên nhân chính khiến G01, G03, G04, G05 fail — 4/10 case thường.
2. **Tier bị "lạm phát core"**: 8/14 khái niệm được gắn `core` (bao gồm cả 4 khái niệm tách từ nội dung mở đầu mang tính định nghĩa, đáng lẽ chỉ 1 khái niệm `supporting`). Vòng gộp (consolidate) không có ràng buộc rõ về số lượng core tối đa, nên giữ nguyên xu hướng lạm phát từ vòng nháp.
3. **Không phát hiện được câu hedge ("chỉ mang tính tương đối")** dù quy tắc đã nêu rõ trong system prompt — model với năng lực nhỏ hơn (Groq free tier) có thể cần ví dụ cụ thể hơn là mô tả quy tắc chung chung.
4. **Lệch viết hoa khi trích quote giữa câu** — model tự động viết hoa chữ đầu của quote dù đoạn gốc viết thường (vì nó nằm giữa câu). Ảnh hưởng: check tự động verbatim-substring (case-sensitive) báo fail dù nội dung đúng.
5. **Một khái niệm thiếu hẳn mảng `reasons`** — lỗi định dạng JSON output, không theo đúng schema 100%.

## Kế hoạch cho lượt 2 (trước CP6)

- Chunk theo ranh giới heading (`##`) của transcript thay vì cắt cố định 18 đoạn/lô, để khối token/context/sampling không bị xé lẻ.
- Thêm ràng buộc cứng ở vòng gộp: tối đa 5 khái niệm `core`, buộc model xếp hạng ưu tiên trước khi gán tier.
- Thêm ví dụ cụ thể (few-shot) cho quy tắc hedge trong system prompt.
- Yêu cầu rõ "giữ nguyên chữ hoa/thường của bản gốc khi trích quote" — hoặc nới lỏng checker tự động sang so khớp không phân biệt hoa/thường và chỉ coi là lỗi nguồn sự thật khi nội dung thực sự sai khác (không phải khác biệt viết hoa).
- Thêm bước validate + tự sửa (retry) khi thiếu field bắt buộc (`reasons` rỗng).
