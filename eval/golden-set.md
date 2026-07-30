# Golden set — LectureFocus Review Map (Day 1 — Foundation, `transcript-04-clean.md`)

Toàn bộ case xây tay trên transcript Day 1 (98 đoạn `[T04-001]`–`[T04-098]`). Cột **Đạt khi** là quy tắc pass/fail cụ thể — hai người chấm độc lập đọc transcript + output AI, đối chiếu cột này, phải ra cùng kết quả. Cột **Nhóm** đánh dấu case thuộc phần nào của yêu cầu golden set (một case có thể thuộc nhiều nhóm).

Ký hiệu nhóm: **T** = case thường · **①②③④** = 4 lớp chỗ khó (nguồn sự thật / mơ hồ / ngoài phạm vi / đặc thù domain) · **H** = case hiếm · **C** = case bám theo câu hỏi thật trong chatlog.

## Case thường — đối chiếu bản dựng tay (10)

Bản dựng tay (`codebase/lecturefocus.html`, `DATA.lessons["day01-foundation"].concepts`) là 8 khái niệm nhóm đã tự xây trước khi có AI thật — dùng làm tham chiếu, không phải "đáp án tuyệt đối" vì hand-build cũng có thể sai, nhưng lệch phải giải thích được.

| ID | Nhóm | Kịch bản | Đạt khi |
|---|---|---|---|
| G01 | T | AI có sinh ra khái niệm tương đương "LLM dự đoán token tiếp theo" (bản tay: `c01`, core) không | Có một concept có name/summary phủ đúng ý "LLM dự đoán token kế tiếp theo xác suất, không tra tri thức cố định", và tier = core |
| G02 | T | Tương đương "Attention trong Transformer" (bản tay: `c02`, core) | Có concept phủ ý "attention giúp nhìn cả câu, xác định từ liên quan" citation về T04-039/040, tier = core |
| G03 | T | Tương đương "Token và context window" (bản tay: `c03`, core) | Có concept phủ ý token là đơn vị tính + context window, tier = core |
| G04 | T | Tương đương "Quản lý context khi dùng AI" (bản tay: `c04`, important) | Có concept phủ ý context rot / quản lý context khi vibe code, tier ∈ {core, important} — chấp nhận core vì T04-057 nhấn khá mạnh, nhưng important là kỳ vọng chính |
| G05 | T | Tương đương "Temperature và top-k/top-p" (bản tay: `c05`, important) | Có concept phủ đúng 2 khái niệm này cùng nhau hoặc tách riêng, tier ∈ {important, core} |
| G06 | T | Tương đương "Evaluation khi build sản phẩm AI" (bản tay: `c06`, important) | Có concept phủ ý evaluation, tier = **core bắt buộc** (xem G17 — đây là lỗi domain nghiêm trọng nếu xuống important/supporting) |
| G07 | T | Tương đương "Bức tranh AI ⊃ ML ⊃ Deep Learning ⊃ GenAI" (bản tay: `c07`, supporting) | Có concept phủ ý 4 vòng lồng nhau, tier ∈ {supporting, important} |
| G08 | T | Tương đương "Lịch sử AI: mùa đông và deep learning" (bản tay: `c08`, supporting) | Có concept phủ ý 2 mùa đông AI + deep learning 2006/2012, tier ∈ {supporting, important} |
| G09 | T | Tổng số khái niệm sinh ra có hợp lý với một buổi ~2 tiếng không | Số lượng concept nằm trong khoảng 6–14 (quá ít bỏ sót nội dung, quá nhiều vụn thành sub-point) |
| G10 | T | Mỗi khái niệm có tối thiểu 1 trích dẫn hợp lệ | 100% concept có ≥1 learningPoint hoặc reason với evidence trỏ về segmentId có thật (không có concept "trơ", không citation) |

## ① Nguồn sự thật (3)

| ID | Nhóm | Kịch bản | Đạt khi |
|---|---|---|---|
| G11 | ① | Mọi `segmentId` trong output có tồn tại trong 98 đoạn T04-001..T04-098 không | 100% segmentId hợp lệ — check tự động bằng `citation-check.json` do script sinh ra |
| G12 | ① | Mọi `quote` có phải chuỗi con nguyên văn của đúng đoạn `segmentId` đó không (không paraphrase, không ghép từ nhiều đoạn) | 100% quote verified = true trong `citation-check.json` |
| G13 | ① | AI có bịa ra khái niệm không có căn cứ nào trong transcript (vd. "RAG", "fine-tuning nội bộ", "quiz generation" — những từ không xuất hiện hoặc chỉ nhắc lướt ngoài phạm vi buổi Foundation) | Không có concept nào mà toàn bộ learningPoints/reasons đều citation sai hoặc quote không verify được |

## ② Mơ hồ / thiếu thông tin (3)

| ID | Nhóm | Kịch bản | Đạt khi |
|---|---|---|---|
| G14 | ② | Đoạn T04-022 chứa cả câu hedge ("cái này chỉ mang tính tương đối để các bạn hình dung được thôi nhá — nó không thực sự chính xác") VÀ câu factual độc lập ("AI không phải đi thẳng một phát lên đâu, mà nó đã trải qua hai lần mùa đông rồi") trong cùng một đoạn | Chỉ tính là fail khi quote trích ĐÚNG câu hedge ở trên — lúc đó concept liên quan phải hạ tier xuống supporting hoặc gắn `uncertain_signal: true`. Nếu AI trích câu factual khác trong cùng segmentId (không phải câu hedge) thì không bị đánh giá theo case này — bám theo câu cụ thể, không bám theo cả segmentId (sửa sau lượt 2, xem `eval/run-2-results.md`) |
| G15 | ② | Các đoạn nhiều `[không nghe rõ]` (T04-001, T04-017, T04-063 — vd. "rumor" về team Kimi) | AI không được "đoán bù" nội dung thay cho `[không nghe rõ]`; nếu trích các đoạn này, quote phải giữ nguyên `[không nghe rõ]`, không tự chế nội dung thay thế |
| G16 | ② | Đoạn T04-082 dự đoán tương lai ("có thể càng ngày càng xa hơn nữa trong tương lai", "sẽ phải trả theo từng lượt gọi") — là dự đoán cá nhân giảng viên, không phải sự kiện đã xảy ra | Nếu được trích, reason/learningPoint không được viết như một sự thật chắc chắn đã xảy ra (tier không vượt important, không core) |

## ③ Ngoài phạm vi / thẩm quyền (3)

| ID | Nhóm | Kịch bản | Đạt khi |
|---|---|---|---|
| G17 | ③ | Transcript có nhắc quiz Kahoot cuối buổi (T04-093–097, có đáp án cụ thể) | Review Map không được biến nội dung này thành một bộ quiz để học viên "luyện thi"; nếu có concept nhắc đến, chỉ mô tả là nội dung ôn tập (vd. tóm tắt các điểm được nhắc trong phần quiz), không đóng khung như "đề thi mẫu" |
| G18 | ③ | Không có đoạn nào trong transcript nói "phần X chắc chắn sẽ thi" | Không concept nào có learningPoint/reason mang giọng điệu dự đoán đề thi hoặc cam kết nội dung kiểm tra |
| G19 | ③ | Output không được gắn nhãn/đánh giá học viên đã hiểu hay chưa hiểu phần nào (vượt quyền — sản phẩm không chấm điểm hiểu bài) | Không có trường/text nào dạng "học viên có thể chưa hiểu rõ X" — Review Map chỉ nói về nội dung bài giảng, không suy đoán về học viên |

## ④ Đặc thù domain (3)

| ID | Nhóm | Kịch bản | Đạt khi |
|---|---|---|---|
| G20 | ④ | Khái niệm Evaluation: giảng viên nhấn rất mạnh "quyết định đến 80%... mình rất muốn nhắc tất cả mọi người" (T04-075) | Concept Evaluation **bắt buộc** tier = core. Xếp important/supporting = **fail nghiêm trọng** (đúng lớp domain — sai tier ở khái niệm được nhấn mạnh nhất buổi sẽ khiến học viên bỏ ôn nhầm) |
| G21 | ④ | Khái niệm được lặp lại trong phần tóm tắt cuối buổi T04-091 (token tiếp theo, lớp công cụ bao quanh LLM, evaluation mindset) | Cả 3 ý này phải có tier ≥ important (ưu tiên core), vì giảng viên tự nhắc lại như điểm cần nhớ |
| G22 | ④ | Khái niệm Attention/Transformer là trọng tâm đặt tên buổi học ("Foundation: cách LLM hoạt động — transformer, attention, agent") và được đào sâu nhất (T04-038 đến T04-056, ~19 đoạn) | Phải ở tier core; nếu bị xếp xuống important/supporting = fail (lệch tỉ trọng nội dung buổi học) |

## Case hiếm (4)

| ID | Nhóm | Kịch bản | Đạt khi |
|---|---|---|---|
| G23 | H | Mixture of Experts — chỉ xuất hiện đúng 1 đoạn (T04-086), giảng viên tự nói bị lộn slide ("Slide này lẽ ra phải để ở phía bên trên") | Nếu AI tạo concept riêng cho MoE, tier phải ≤ supporting (tín hiệu mỏng, 1 đoạn, không lặp lại) — không core/important |
| G24 | H | RLHF + ngành gán nhãn dữ liệu (T04-059–062) — nội dung dài nhưng mang tính giai thoại (Scale AI, Alexandr Wang) hơn là khái niệm kỹ thuật cần ôn | Nếu tạo concept, phần cốt lõi kỹ thuật (RLHF: thưởng/phạt để mô hình học) phải tách khỏi phần giai thoại công ty; tier ≤ important |
| G25 | H | Đoạn hoạt động lớp thuần tương tác, không phải lời giảng: T04-090 (sự cố kỹ thuật), T04-092 (khảo sát công cụ học tập), T04-097 (công bố điểm quiz) | Các đoạn này **không được** biến thành một khái niệm học thuật độc lập trong Review Map |
| G26 | H | Hai đoạn có vẻ mâu thuẫn nhẹ: T04-042 nói ChatGPT "trả lời một số câu rất là ngớ ngẩn" hồi 2022 vs T04-043 nói hiện tại Claude/GPT top đầu leaderboard | Nếu trích cả hai, phải giữ đúng khung thời gian (2022 vs hiện tại 2026), không gộp thành một tuyên bố mâu thuẫn hoặc chọn 1 vế bỏ vế kia làm sai lệch bối cảnh |

## Case bám theo câu hỏi thật trong chatlog (10)

Mỗi case dựa trên loại câu hỏi thật đã mining ở `spec.md` §1 (142/1.261 lượt hỏi tóm tắt, 86/142 lượt tutor fail, ~25 lượt hỏi thẳng trọng tâm). Không giả định mapping trực tiếp một hội thoại cụ thể với transcript Day 1 — chỉ dùng lại đúng intent/cách hỏi thật để test hành vi Review Map khi áp vào transcript đang có.

| ID | Nhóm | Câu hỏi thật (nguyên văn hoặc cùng dạng) | Đạt khi |
|---|---|---|---|
| G27 | C | "tóm tắt cho tôi nội dung của bài này, chỉ ra những kiến thức trọng tâm cần thiết" | Tier core của Review Map phải trùng phần lớn (≥2/3) với các ý được nhấn mạnh nhất buổi: token/dự đoán, attention/transformer, evaluation |
| G28 | C | "hãy tóm tắt các đầu kiến thức quan trọng cần phải nắm ở bài giảng này" | Danh sách concept phải bao phủ toàn buổi (không dồn hết vào 1-2 khái niệm đầu buổi, bỏ sót phần sau như evaluation/agent) |
| G29 | C | "tóm tắt toàn bộ tài liệu, kiến thức quan trọng cần nhớ" | Mỗi khái niệm trong output phải có bằng chứng cụ thể kèm theo (không phải một bản tóm tắt liền mạch không trích dẫn được) |
| G30 | C | "phần này có quan trọng không" (học viên hỏi về một khái niệm cụ thể) | Khi xem chi tiết 1 concept, phải có lý do (reason) giải thích rõ vì sao nó ở tier đó, kèm trích dẫn — không trả lời chung chung "quan trọng" mà không có căn cứ |
| G31 | C | Case đối chiếu lượt tutor fail thật: học viên xin tóm tắt, tutor trả lời "tôi không thể tìm thấy tệp tin hoặc nội dung chi tiết... để tóm tắt" | Với transcript đã có sẵn (Day 1), Review Map **không được** trả lời kiểu "không tìm thấy nội dung" — đây chính là pain đang giải quyết |
| G32 | C | Biến thể: "cho tôi biết những gì thầy nhấn mạnh nhất buổi này" | Concept core phải trùng với các đoạn có ngôn ngữ nhấn mạnh rõ ràng ("mình rất muốn nhắc", "cực kỳ quan trọng", lặp ở tóm tắt cuối) |
| G33 | C | Biến thể: "buổi học có bao nhiêu ý chính, ý nào lặp lại nhiều lần" | Các ý xuất hiện lại ở phần tóm tắt T04-091 phải được đánh dấu/tier cao hơn so với ý chỉ nhắc đúng 1 lần |
| G34 | C | Biến thể: "tôi chỉ có 15 phút, nên ôn gì trước" | Khi lọc theo quỹ thời gian ngắn, danh sách rút gọn phải là tập con của đúng các concept tier core (không lẫn supporting) |
| G35 | C | Biến thể: "phân biệt giúp tôi đâu là kiến thức nền tảng, đâu là mở rộng thêm" | Phải phân biệt rõ được nhóm core/important (nền tảng: token, attention, context, evaluation) khỏi nhóm supporting (lịch sử AI, bức tranh AI/ML/DL/GenAI) |
| G36 | C | Biến thể: "bài học hôm nay có nhắc gì đến việc AI hay bịa (hallucination) không, tóm tắt lại" | Nếu có concept về hallucination (T04-048), phải trích đúng đoạn nói về "văn bản AI sinh ra nhìn trông rất là có lý... nhưng mà thực ra không phải thế" — không bịa thêm ví dụ hallucination không có trong transcript |

## Tổng số case: 36 (yêu cầu tối thiểu: 20)

Phân bổ: 10 case thường · 12 case 4 lớp chỗ khó (3/lớp) · 4 case hiếm · 10 case chatlog-grounded (một số case chatlog trùng lặp có chủ đích với case thường/domain để kiểm tra cùng hành vi từ góc nhìn khác — không tính trùng khi đếm tổng, mỗi case có ID và điều kiện pass/fail riêng).
