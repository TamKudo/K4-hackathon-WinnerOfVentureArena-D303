# Reflection — Phạm Hải Yến · 2A202601152

> Điền 4 mục dưới. Rubric chấm: vai trò + phần mình làm + AI hỗ trợ thế nào + **một bài học từ case fail của chính nhóm**.
> **Vibe-coding rule:** bị hỏi ngẫu nhiên tại CP5/CP6 mà không giải thích được phần có tên mình → 0 điểm phần cá nhân liên quan.

## 1. Vai trò trong nhóm

[Điền: bạn nhận vai gì, vì sao nhóm phân như vậy]

## 2. Phần mình làm

Theo phân công: **Prompt sinh Review Map · golden set · ghi log validation**.

Artifact có tên bạn trong repo:
- `codebase/lib/reviewMapGenerator.mjs` — 2 prompt (`EXTRACT_SYSTEM_PROMPT` dòng 57, `buildTierSystemPrompt` dòng 80) + 6 quy tắc chung (`SHARED_RULES` dòng 48)
- `eval/golden-set.md` — 36 case
- `eval/run-*-results.md` — bảng chấm từng lượt

**Đây là phần lõi kỹ thuật của bài — khả năng cao bị hỏi nhất.**

[Điền cụ thể: bạn sửa prompt qua từng lượt thế nào, vì sao thêm quy tắc nào]

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

[Điền: bạn chọn case nào, bạn rút ra gì, lần sau sẽ làm khác thế nào]
