# Kết quả lượt 2 — AI thật (sau khi sửa prompt theo phân tích lượt 1)

**Model:** `llama-3.3-70b-versatile` qua Groq (script `codebase/generate-review-map.mjs`, cùng script với lượt 1, đã sửa theo `eval/run-1-results.md` §Kế hoạch lượt 2).
**Thay đổi so với lượt 1:** chia lô theo ranh giới heading (không xé khối kiến thức liền mạch) · giới hạn hướng dẫn tối đa 5 khái niệm "core" nhưng giữ toàn bộ khái niệm khác ở tier thấp hơn thay vì xoá · thêm ví dụ cụ thể cho quy tắc hedge · checker tự động so khớp trích dẫn không phân biệt hoa/thường · yêu cầu mọi khái niệm phải có `learningPoints` và `reasons` không rỗng.
**Lưu ý kỹ thuật:** vòng 2 (consolidate) chạy lại 2 lần — lần đầu model hiểu nhầm "tối đa N core" thành "chỉ giữ N khái niệm tổng" (rớt còn 5 khái niệm, mất hết phần important/supporting). Đã sửa prompt làm rõ "không được xoá, chỉ đổi tier" và chạy lại vòng 2 bằng candidates đã cache từ vòng 1 (không tốn thêm lời gọi AI cho vòng 1). Kết quả dưới đây là bản sau khi sửa.
**Output:** `eval/run-2/ai-output.json` (11 khái niệm cuối), `eval/run-2/candidates.json` (26 khái niệm nháp), `eval/run-2/citation-check.json`.

## So sánh nhanh với lượt 1

| | Lượt 1 | Lượt 2 |
|---|---|---|
| Số khái niệm cuối | 14 | 11 |
| Số khái niệm tier core | 8 | 6 (giới hạn 5, model vượt nhẹ) |
| Citation verified (không phân biệt hoa/thường) | 30/34 (88%) | 19/23 (82,6%) |
| Concept thiếu field `reasons` | 1 | 0 |
| Attention đúng tier core? | ✗ (important) | ✓ |
| Token/Context có xuất hiện? | ✗ (vắng mặt hoàn toàn) | ✓ (xuất hiện, nhưng tier supporting — vẫn thấp hơn kỳ vọng) |
| RLHF bị xếp core sai? | ✗ (có, vi phạm) | Không tạo concept RLHF (tránh được vi phạm) |
| Bao phủ transcript | Đến T04-076 | Chỉ đến T04-075 — **bỏ hẳn 1/4 cuối buổi** (open-source, benchmark, API basics, tóm tắt cuối) |

## Bảng chấm 36 case (chỉ ghi case đổi verdict so với lượt 1; case giữ nguyên xem `eval/run-1-results.md`)

| ID | Lượt 1 | Lượt 2 | Ghi chú lượt 2 |
|---|---|---|---|
| G02 | ❌ | ✅ | Attention nay đúng tier core |
| G03 | ❌ | ❌ (cải thiện) | Token/Context nay **có xuất hiện** (trước đây vắng mặt hoàn toàn) nhưng vẫn tier supporting, chưa đạt core |
| G08 | ❌ | ✅ | "Lịch sử AI" trích đúng câu "hai lần mùa đông" (factual), không còn dựa vào câu hedge như lượt 1 |
| G14 | ❌ | ❌* | *Ghi chú: AI trích đúng câu factual "hai lần mùa đông" trong T04-022, không phải câu hedge "chỉ mang tính tương đối" — nhưng case golden set buộc theo `segmentId`, không phải theo câu cụ thể, nên vẫn tính Không đạt theo đúng chữ của case. **Cần sửa golden-set.md để case này bám theo câu hedge cụ thể, không phải cả segment** — xem mục "Sửa golden set" bên dưới. |
| G21 | ❌ | ❌ | Vẫn thiếu ý "lớp công cụ bao quanh LLM" ở tier phù hợp |
| G22 | ❌ | ✅ | Cả Attention và Transformer nay đều core |
| G24 | ❌ | ✅ | Không tạo concept RLHF nữa — tránh được vi phạm tier |
| G28 | ✅ | ❌ | Lượt 2 dừng ở T04-075, bỏ hẳn 1/4 cuối buổi (lượt 1 phủ xa hơn, đến T04-076) |
| G30 | ❌ | ✅ | 0 concept thiếu field `reasons` (lượt 1 có 1) |

## Tổng kết

| | Số case | Tỉ lệ |
|---|---|---|
| Tổng case trong golden set | 36 | — |
| Không áp dụng lượt này (⬜) | 4 | — |
| **Case được đánh giá thật sự (32)** | | 100% |
| Đạt (✅) | 19 | **59,4%** |
| Không đạt (❌) | 13 | 40,6% |

**So với lượt 1 (46,9%): tăng 12,5 điểm phần trăm — vẫn CHƯA ĐẠT bar 70%.**

## Vấn đề còn tồn tại sau 2 lượt (chưa giải quyết được bằng sửa prompt)

1. **Đã xác định chính xác nguyên nhân bằng cách đọc `eval/run-2/candidates.json` (26 khái niệm nháp từ vòng 1):** vòng 1 (extract) thực ra làm khá tốt — nó **đã sinh đúng** các candidate còn thiếu trong output cuối: "Vòng lặp autoregressive của LLM" (T04-096, chính là ý G01/G36 — dự đoán token/hallucination), "Quản lý Context" (T04-053, ý G04), "Turing test", "AlphaGo", "Multi-head Attention", "Tham số (Parameter)", "Mixture of Experts", "Gọi API mô hình LLM" — tổng cộng 26 candidate phủ gần hết buổi học. **Lỗi nằm ở vòng 2 (consolidate): model tự ý bỏ ~15/26 candidate thay vì hạ tier như đã yêu cầu ở quy tắc 5**, dù prompt đã nói rõ "KHÔNG được xoá bỏ/bỏ sót". Riêng temperature/top-k/top-p (G05) thì đúng là **vòng 1 không sinh candidate nào** cho heading đó — lô 4 gộp 4 heading khác nhau (Attention, RLHF, thí nghiệm bàn cờ, temperature) trong 20 đoạn, có thể đã quá tải với model free-tier nên bỏ sót ngay từ bước rút nháp.
   → Kết luận: gộp 26 candidate trong 1 lời gọi LLM duy nhất là điểm nghẽn — model không đủ tin cậy để giữ đúng tất cả khi phải tự quyết định gộp/bỏ hàng loạt cùng lúc.
2. **G28 mới xuất hiện (regression): lượt 2 bỏ hẳn 1/4 cuối transcript** — có thể do việc chunk theo heading khiến các heading cuối (vốn nhỏ, rời rạc: "Bức tranh thị trường", "Làn sóng mã nguồn mở", "Benchmark", "Chọn mô hình", "Mixture of Experts", "Cơ bản về gọi API") bị dồn thành 1 lô rất tạp (9 heading khác nhau trong 1 lô ở log chạy), khiến model khó xử lý đều tay lô này.
3. **2 khái niệm gần trùng nhau không được gộp** ("Nền tảng của AI" và "Mô hình ngôn ngữ lớn" cùng cite chung 1 câu T04-003) — quy tắc "gộp trùng lặp" chưa đủ mạnh.
4. **Case G14 lộ ra một lỗi thiết kế trong chính golden set**: case đang bám theo `segmentId` thay vì bám theo câu hedge cụ thể trong segment đó, nên không phân biệt được việc AI trích "đúng phần không hedge" của cùng một đoạn. Cần sửa `golden-set.md`.

## Sửa golden set (áp dụng ngay)

G14 trong `golden-set.md` cần đổi điều kiện "Đạt khi" từ "nếu AI dùng đoạn này làm evidence" thành "nếu AI dùng đúng câu hedge (\"chỉ mang tính tương đối... không thực sự chính xác\") làm quote — không phải bất kỳ câu nào khác trong cùng segmentId — thì mới bắt buộc hạ tier/gắn cờ". Sẽ cập nhật file khi làm lượt 3.

## Khuyến nghị

Với thời gian hackathon có hạn, 2 lượt sửa prompt đã cải thiện rõ (46,9% → 59,4%) nhưng 3 lỗ hổng nội dung (token-prediction/hallucination, sampling params, phần cuối transcript) lặp lại ở cả 2 lượt cho thấy giới hạn của cách tiếp cận "sửa prompt" với model free-tier hiện tại — có thể cần: (a) đổi model mạnh hơn trên Groq nếu tài khoản cho phép, hoặc (b) kiểm tra trực tiếp `candidates.json` xem vòng 1 có bỏ sót từ gốc hay chỉ vòng 2 làm mất, để sửa đúng chỗ. Việc này để lại cho lượt 3 nếu còn thời gian trước CP6; nếu không, ghi nhận trung thực 59,4% và nêu rõ nguyên nhân khi demo — đúng luật "kết quả thấp không ảnh hưởng điểm nếu ghi nhận đầy đủ".
