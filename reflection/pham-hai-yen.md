# Reflection — Phạm Hải Yến · 2A202601152

> Điền 4 mục dưới. Rubric chấm: vai trò + phần mình làm + AI hỗ trợ thế nào + **một bài học từ case fail của chính nhóm**.
> **Vibe-coding rule:** bị hỏi ngẫu nhiên tại CP5/CP6 mà không giải thích được phần có tên mình → 0 điểm phần cá nhân liên quan.

## 1. Vai trò trong nhóm

Phụ trách **chất lượng của quyết định AI** — viết prompt sinh Review Map, xây golden set 36 case, và chấm kết quả từng lượt chạy. Nhóm phân như vậy vì đây là hai việc phải đi cùng nhau: người viết prompt cũng là người định nghĩa thế nào là "đúng", nên khi kết quả sai thì biết ngay nên sửa prompt hay sửa định nghĩa case. Ở vòng validation trước CP5, ghi log song song với Trương Minh Tâm để có hai bản ghi độc lập đối chiếu.

> ⚠️ *Đây là bản nháp dựng từ artifact trong repo — Yến tự sửa lại theo trải nghiệm thật của mình trước khi nộp.*

## 2. Phần mình làm

Theo phân công: **Prompt sinh Review Map · golden set · ghi log validation**.

Artifact có tên bạn trong repo:
- `codebase/lib/reviewMapGenerator.mjs` — 2 prompt (`EXTRACT_SYSTEM_PROMPT` dòng 57, `buildTierSystemPrompt` dòng 80) + 6 quy tắc chung (`SHARED_RULES` dòng 48)
- `eval/golden-set.md` — 36 case
- `eval/run-*-results.md` — bảng chấm từng lượt

**Đây là phần lõi kỹ thuật của bài — khả năng cao bị hỏi nhất.**

**Prompt đã sửa qua 5 lượt, mỗi lượt vì một lý do cụ thể:**

| Lượt | Sửa gì | Vì sao | Kết quả |
|---|---|---|---|
| 1 | Bản đầu — chunk cố định 18 đoạn | — | 46,9% |
| 2 | Chunk theo ranh giới heading · giới hạn ~5 core · **thêm ví dụ cụ thể cho quy tắc hedge** | Lượt 1 chỉ mô tả quy tắc chung chung nên model không nhận ra câu "chỉ mang tính tương đối"; khối token/context/sampling bị xé qua 2 lô nên mất | 59,4% |
| 3 | **Tách vòng gộp khỏi AI**: model chỉ được gán tier, cấm đổi tên/xoá/gộp; gộp + dựng schema chuyển sang code | Đọc `run-2/candidates.json` thấy vòng 1 sinh đủ 26 khái niệm nhưng vòng 2 tự ý bỏ ~15/26 dù prompt đã ghi rõ "KHÔNG được xoá" | 48,5% |
| 4 | Nới điều kiện gộp (bỏ vế "chung segmentId") | Lượt 3 gộp được 0/26 vì điều kiện quá chặt | 57,6% |
| 5 | Gộp theo **tập từ lõi** sau khi bỏ từ chỉ loại ("cơ chế", "kiến trúc", "kỹ thuật") | "Attention" / "Multi-head Attention" / "Cơ chế attention" là ba mảnh của cùng một chủ đề nhưng nằm ở ba tier khác nhau trên UI | **63,6%** |

**Golden set:** 36 case xây tay trên transcript Day 1 — 10 case thường đối chiếu bản dựng tay, 12 case cho 4 lớp chỗ khó (3 case/lớp), 4 case hiếm, 10 case bám theo câu hỏi thật trong chatlog. Mỗi case có cột "Đạt khi" viết thành quy tắc pass/fail để hai người chấm độc lập ra cùng kết quả.

*[Yến bổ sung: quyết định nào khó nhất khi viết prompt, có case nào tranh cãi trong nhóm khi chấm không]*

**Cần giải thích được nếu bị hỏi:**
- Vì sao phải gọi AI **2 vòng** thay vì 1? (gợi ý: transcript ~20k token, free tier giới hạn 6-12k token/phút)
- Vòng 1 làm gì, vòng 2 làm gì, **code** làm gì? Ranh giới AI/code ở đâu?
- Vì sao lượt 3 chuyển việc **gộp trùng lặp** từ AI sang code? (gợi ý: lượt 2 AI tự ý xoá ~15/26 khái niệm hợp lệ dù prompt đã cấm)
- Quy tắc **hedge** trong prompt là gì, vì sao phải thêm ví dụ cụ thể thay vì mô tả chung? (lượt 1 mô tả chung → model không bắt được)
- Golden set có **36 case** nhưng chỉ chấm **33** — 3 case kia đi đâu? (⬜ không kích hoạt: AI không trích đoạn liên quan nên case không test được)
- Case **G14 từng bị chấm sai** ở lượt 2 — sai ở đâu, sửa thế nào? (case bám theo `segmentId` thay vì bám theo câu hedge cụ thể → đã sửa định nghĩa case)
- Vì sao **63,6% vẫn chưa đạt bar** mà nhóm không hạ bar?

**Chẩn đoán quan trọng nhất — nên thuộc:**
> Vòng 2 được lệnh "ưu tiên khái niệm được giảng dài, được nhắc lại ở tóm tắt cuối buổi", nhưng dữ liệu gửi cho nó chỉ có tên + 1 câu quote — **không hề chứa** thông tin số đoạn hay có mặt ở tóm tắt cuối hay không. Model bị bắt tuân theo luật mà không có dữ liệu để tuân. Đây là hệ quả ngoài ý muốn của bản sửa lượt 3: tách vòng gộp ra khỏi AI thì chặn được lỗi mất khái niệm, nhưng lấy mất luôn ngữ cảnh mà bước gán tier cần nhất.

## 3. AI hỗ trợ mình thế nào

[Điền: dùng AI vào việc gì, chỗ nào AI giúp được, chỗ nào phải tự sửa lại vì AI làm sai/không hiểu bối cảnh]

## 4. Một bài học từ case fail của nhóm

Gợi ý — chọn một fail có thật:

- **Lượt 3 tụt 11 điểm phần trăm dù sửa đúng chẩn đoán**: bản sửa chặn được lỗi cũ nhưng làm lộ lỗi nặng hơn ở tầng dưới (lạm phát core 15/26, gộp thất bại 26→26). Bài học: chỉ nên đổi **một biến** mỗi lượt để biết chắc thay đổi nào gây ra gì.
- **Lượt 4 tăng điểm nhưng không phải nhờ bản sửa**: điều kiện gộp vẫn không khớp, điểm tăng do dao động ngẫu nhiên của model (temperature 0.2). Bài học: đừng vội quy công cho bản sửa khi chưa kiểm chứng.
- **Tier bị đảo suốt cả 5 lượt**: model luôn đẩy nội dung dễ kể chuyện (Turing test, AlphaGo) lên core và đẩy kiến thức kỹ thuật (Token) xuống supporting.

**Case chọn: lượt 3 tụt 11 điểm phần trăm (59,4% → 48,5%) dù sửa đúng nguyên nhân đã chẩn đoán.**

Sau lượt 2, tôi đọc `run-2/candidates.json` và xác định được chính xác chỗ hỏng: vòng 1 sinh đủ 26 khái niệm, nhưng vòng gộp bằng LLM tự ý bỏ mất ~15/26 dù prompt đã ghi rõ "KHÔNG được xoá bỏ/bỏ sót". Lượt 3 sửa đúng chỗ đó — cấm AI đụng vào danh sách, chuyển việc gộp sang code. Lỗi cũ biến mất hoàn toàn (0/26 bị mất). **Nhưng điểm lại giảm.**

Lý do: bản sửa che được lỗi cũ nhưng làm lộ hai lỗi nặng hơn vốn bị lỗi kia che khuất — lạm phát core (15/26 khái niệm là core) và gộp trùng lặp thất bại hoàn toàn (26 → 26, không gộp được cặp nào).

**Ba điều rút ra:**

1. **Sửa đúng nguyên nhân vẫn có thể làm điểm giảm.** Một lỗi có thể đang *che* lỗi khác; gỡ nó ra thì tầng dưới lộ ra. Nếu chỉ nhìn con số mà không đọc output, tôi đã kết luận nhầm là "bản sửa sai" và quay lại cách cũ.
2. **Mỗi lượt chỉ đổi một biến.** Từ lượt 4 tôi giữ nguyên prompt gán tier để cô lập đúng biến "gộp". Nhờ vậy mới phát hiện được điều số 3.
3. **Đừng vội quy công cho bản sửa khi điểm tăng.** Lượt 4 tăng 9 điểm phần trăm, thoạt nhìn như bản sửa có tác dụng — nhưng kiểm lại thì điều kiện gộp vẫn không khớp cặp nào, điểm tăng do **dao động ngẫu nhiên** của model (temperature 0.2). Tôi đã ghi đúng như vậy trong `run-4-results.md` thay vì nhận là công của mình.

Lần sau tôi sẽ chạy mỗi cấu hình **ít nhất 2 lần** trước khi kết luận, để phân biệt được cải thiện thật với dao động ngẫu nhiên.
