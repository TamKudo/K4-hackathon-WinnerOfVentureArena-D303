# AI SPEC — LectureFocus: Review Map ưu tiên ôn tập · Nhóm A31 · Zone [điền zone]
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

> Chi tiết UI, flow và mock data: [`docs/lecturefocus-product-spec.md`](docs/lecturefocus-product-spec.md). Transcript demo: `data/vlearn-pack/transcript/transcript-04-clean.md`. Chatlog chỉ dùng để chứng minh pain, không phải input lúc chạy.

## §1. User & Job

Người thực hiện công việc này là một học viên vừa kết thúc buổi học, hoặc đang chuẩn bị ôn trước lab/quiz, chỉ có một quỹ thời gian ngắn (15–60 phút) để ôn lại. Cách họ đang xử lý hiện nay là mở lại slide, tua video, hỏi bạn bè, hoặc mở AI Tutor để bôi đen đoạn tài liệu rồi hỏi. Cách này chỉ hiệu quả khi họ đã biết mình cần hỏi gì — còn nếu không nhớ bài có gì, họ phải tự lướt lại toàn bộ, hoặc buột miệng hỏi tutor kiểu "tóm tắt bài giúp tôi" và không phải lúc nào cũng được đáp ứng.

**Core JTBD:** Khi cần ôn lại một buổi học, tôi muốn nhanh chóng biết bài có những kiến thức chính nào và phần nào nên ưu tiên, để không phải tự xem lại toàn bộ nội dung hoặc phải biết trước mình cần hỏi điều gì.

**Problem statement:** Học viên sau buổi học muốn ôn nhanh nhưng không biết bài có những kiến thức chính nào và phần nào nên ưu tiên, nên phải tự xem lại toàn bộ hoặc phải biết trước mình cần hỏi điều gì.

**Evidence:** Mining trên `chat_history_anonymized_for_hackathon.csv` (1.261 turn, 369 học viên, 22–29/07/2026). Cách đếm: lọc các tin nhắn học viên có nội dung xin tóm tắt/tổng hợp, rồi kiểm tra trong số đó tutor có từ chối hoặc báo không tìm được nội dung hay không; lọc thêm các tin nhắn hỏi thẳng về "cái gì quan trọng/trọng tâm cần nắm" (loại tay các câu nhiễu kiểu jailbreak). Kết quả:

| Chỉ số | Giá trị |
|---|---|
| Lượt hỏi tóm tắt/tổng hợp | 142/1.261 (~11%) |
| Học viên từng hỏi kiểu này | 99/369 (~27%) |
| Trong đó tutor từ chối hoặc không tìm được nội dung | 86/142 (~60,6%) |
| Lượt hỏi thẳng về trọng tâm/kiến thức quan trọng | ~25 |

Lưu ý: đây là hành vi trong lúc học (100% hội thoại thuộc `in_class`), còn JTBD của sản phẩm nhắm vào lúc ôn sau buổi — hai bối cảnh khác nhau nhưng cùng phản ánh một nhu cầu gốc: không biết đâu là trọng tâm. Không có cơ sở để nối trực tiếp một hội thoại chatlog với một transcript cụ thể nên nhóm không cố suy diễn mapping đó.

Vài câu nói nguyên văn của học viên:

1. "tóm tắt cho tôi nội dung của bài này, chỉ ra những kiến thức trọng tâm cần thiết"
2. "hãy tóm tắt các đầu kiến thức quan trọng cần phải nắm ở bài giảng này"
3. "tóm tắt toàn bộ tài liệu, kiến thức quan trọng cần nhớ"
4. "phần này có quan trọng không"
5. Một học viên xin tóm tắt slide day05, tutor trả lời: "Rất tiếc, tôi không thể tìm thấy tệp tin hoặc nội dung chi tiết... để tóm tắt"

## §2. Impact & quyết định chọn

| Ứng viên | Bao nhiêu người | Tần suất | Mỗi lần tốn gì | Build nổi không |
|---|---|---|---|---|
| **A. LectureFocus — Review Map ưu tiên ôn** | 99/369 từng đòi tóm tắt, ~25 lượt hỏi trọng tâm | ~11% lượt hỏi liên quan tóm tắt, lặp lại mỗi buổi trước lab/quiz | 15–60 phút lướt lại hoặc hỏi đi hỏi lại mà vẫn không biết ưu tiên gì | Có — một quyết định AI, UI 3 màn, khởi đầu bằng mock data |
| B. Sửa lỗi tutor không tóm tắt được khi học viên yêu cầu | Cùng nhóm 99/369; 86/142 lượt fail | Cao trong các lượt xin tóm tắt | Mỗi lần fail phải hỏi lại hoặc tự đọc, dần mất niềm tin vào tutor | Có, phạm vi hẹp, dễ so sánh trước/sau |
| C. Kiểm tra hiểu bài / phát hiện hiểu lầm cuối buổi | Chưa rõ — field `misconceptions` có sẵn nhưng 0/1.261 lần được dùng | Gần như chưa có tín hiệu hành vi thật | Học sai mà không biết, hậu quả đến muộn | Khó — cần dữ liệu kết quả quiz mà data pack không có |

**Loại B** vì tuy bằng chứng fail rất rõ (60,6%), nó chỉ giải quyết được việc trả lời đúng khi học viên *đã* hỏi tóm tắt — không giải quyết bước trước đó, là học viên còn chưa biết mình nên hỏi gì. **Loại C** vì thiếu bằng chứng đếm được cụ thể — field đã có sẵn trong hệ thống nhưng chưa từng ghi nhận dữ liệu, nên không chứng minh được quy mô ảnh hưởng.

**Chọn A** vì dùng chung gốc bằng chứng với B nhưng giải đúng job rộng hơn: 27% học viên đã thể hiện nhu cầu tóm tắt, gần hai phần ba trong số đó không được đáp ứng tốt, và có thêm ~25 lượt hỏi trực tiếp về trọng tâm xác nhận đúng nhu cầu ưu tiên hoá kiến thức. Nhóm cũng đã có sẵn 6 transcript sạch làm nguồn sự thật, và lát cắt chỉ gồm một quyết định AI duy nhất nên demo được gọn trong 5 phút.

## §3. Giải pháp tương tự đã nghiên cứu

**NotebookLM** cho phép upload tài liệu rồi sinh overview, FAQ, study guide, luôn kèm citation cạnh câu trả lời — điều đáng học là cách nó buộc mọi claim phải trace được về nguồn. Điều đáng né là nó vẫn thiên về hỏi-đáp theo yêu cầu, không mặc định xếp thứ tự ưu tiên ôn tập. LectureFocus khác ở chỗ output mặc định ngay từ đầu là một bản đồ ba tầng ưu tiên kèm kế hoạch theo quỹ thời gian, thay vì một khung chat trống.

**Dán tài liệu vào ChatGPT rồi hỏi "tóm tắt giúp tôi"** thì nhanh và tự nhiên, nhưng dễ bịa và không neo cố định vào một đoạn cụ thể trong bài giảng — hai lần hỏi có thể ra hai kết quả khác nhau. LectureFocus buộc mỗi khái niệm phải gắn với một đoạn transcript cụ thể, và luôn nói rõ đây không phải dự đoán đề thi.

**Quizlet/Anki AI** sinh flashcard để học thuộc — hữu ích cho việc luyện tập nhưng đi quá nhanh vào ghi nhớ câu chữ, chưa giúp học viên hình dung được bức tranh tổng thể của buổi học trước. Nhóm dừng lại ở bước bản đồ + kế hoạch, để sinh quiz cho giai đoạn sau.

**Khanmigo và các AI tutor gắn trong bài học** phản hồi tốt khi học viên đã đặt câu hỏi, nhưng vẫn ở thế bị động — chờ học viên khởi xướng. LectureFocus chủ động đưa ra bản đồ trước khi học viên kịp hỏi, bổ sung cho AI Tutor chứ không thay thế nó.

## §4. Thiết kế

**Lát cắt một câu:** Một học viên vừa kết thúc buổi học muốn ôn trong quỹ thời gian có hạn · hệ thống quyết định trích các khái niệm từ transcript và xếp mức ưu tiên ôn tập Core / Important / Supporting kèm bằng chứng trong bài giảng · kết quả là một Review Map và kế hoạch ôn theo thứ tự ưu tiên, học viên không cần biết trước mình phải hỏi gì.

**Non-goals:** không làm quiz generation, chấm điểm hay adaptive learning; không xử lý ghi âm, chuyển giọng nói thành văn bản, hay đọc lại bằng giọng nói; không xây backend, database, API thật, RAG hay chatbot AI Tutor thật; không dự đoán phần nào sẽ ra thi hay tuyên bố học viên chưa hiểu phần nào; không tự suy diễn mapping giữa chatlog và transcript.

**Mức prototype:** Mock. Giai đoạn đầu là ba màn hình bấm được (Lesson → Review Map → Concept Detail) chạy trên dữ liệu dựng sẵn từ transcript Day 1. Trước CP3 sẽ có ít nhất một lời gọi AI thật ở đúng quyết định trung tâm — nhận transcript, sinh ra danh sách khái niệm kèm tier, lý do và trích dẫn — rồi so kết quả với golden set. Những phần vẫn mock: chọn nhiều bài học, nút "Hỏi AI Tutor", nghe lại audio, lưu tiến độ học viên.

**Automation: augment.** Xếp nhầm một khái niệm quan trọng xuống mức phụ có thể khiến học viên bỏ sót kiến thức nền, nên hệ thống chỉ đề xuất còn học viên tự quyết định ôn gì — mỗi đề xuất đều đi kèm bằng chứng để tự kiểm tra lại, không có gì bị ẩn hay tự động chấm điểm.

**Nguyên tắc HAX/PAIR đã áp dụng:**

| Nguyên tắc | Áp vào đâu |
|---|---|
| G1 — làm rõ phạm vi | Ngay đầu Review Map ghi rõ đây là bản đồ ưu tiên ôn theo bài giảng, không phải dự đoán đề thi |
| G2 — làm rõ mức độ tin cậy | Mỗi khái niệm đi kèm trích dẫn cụ thể, tier phản ánh tín hiệu trong bài giảng chứ không phải độ khó thi |
| G10 — thu hẹp khi nghi ngờ | Khái niệm có tín hiệu yếu (nhiều đoạn không nghe rõ, giảng viên không nhấn mạnh) thì bị hạ tier hoặc gắn nhãn "tín hiệu chưa chắc", không đoán liều lên Core |
| G11 — giải thích vì sao | Mỗi khái niệm có khối lý do và trích đoạn transcript kèm theo |
| G8 — dễ bỏ qua | Học viên đổi quỹ thời gian hoặc bỏ qua khái niệm phụ tuỳ ý, không bị ép theo đúng thứ tự AI đưa ra |

## §5. Kiểu lỗi — 4 lớp chỗ khó và kịch bản

Bốn lớp áp vào lát cắt này: **nguồn sự thật** — khái niệm và trích dẫn có thật sự nằm trong transcript không; **mơ hồ/thiếu thông tin** — transcript đã rút gọn phần hoạt động lớp và có những đoạn nghe không rõ, tín hiệu "mức nhấn mạnh" chỉ là ước lượng chứ không đo được thời lượng nói thật; **ngoài phạm vi** — học viên đòi quiz, đòi đoán đề thi, đòi nghe lại audio; **đặc thù domain** — xếp sai tier khiến học viên bỏ ôn đúng phần nền tảng trước một buổi lab quan trọng.

| # | Tình huống | Lớp | Hành vi mong muốn |
|---|---|---|---|
| 1 | AI sinh ra một khái niệm không hề xuất hiện trong transcript | Nguồn sự thật | Loại bỏ khỏi Map — mọi khái niệm bắt buộc có trích dẫn xác minh được |
| 2 | Trích dẫn đúng ý nhưng gắn nhầm sang đoạn khác | Nguồn sự thật | Tính là fail trong eval; chỉ hiển thị khi trích dẫn đã được xác minh |
| 3 | Một đoạn được giảng dài nhưng giảng viên tự nhận xét "chỉ mang tính tương đối" | Mơ hồ & domain | Ưu tiên tín hiệu nhấn mạnh/tóm tắt cuối buổi hơn độ dài thô — xếp Supporting thay vì Core |
| 4 | Một khái niệm nằm ở đoạn có nhiều chỗ nghe không rõ | Mơ hồ | Hạ tier hoặc gắn nhãn tín hiệu chưa chắc, không đoán liều |
| 5 | Học viên bấm đòi sinh 10 câu quiz từ Review Map | Ngoài phạm vi | Từ chối gọn, gợi ý quay lại ôn theo Core trước |
| 6 | Học viên hỏi "phần nào chắc sẽ thi" | Ngoài phạm vi | Từ chối rõ ràng: đây là mức ưu tiên ôn theo bài giảng, không phải dự đoán đề |
| 7 | Một khái niệm được giảng viên nhấn mạnh rất mạnh nhưng bị xếp nhầm xuống Supporting | Đặc thù domain | Tính là fail nghiêm trọng — cần đúng tier khi có ngôn ngữ nhấn mạnh rõ |
| 8 | Học viên chỉ còn 15 phút nhưng Map hiển thị toàn bộ hơn chục khái niệm | Trải nghiệm | Bộ lọc thời gian tự động rút gọn, không cần gọi AI lại |

## §6. Bốn đường đi của trải nghiệm

Ở đường đi bình thường, học viên mở bài học, xem Review Map, chọn quỹ 15 phút, hệ thống rút còn vài khái niệm Core, học viên mở một khái niệm để đọc tóm tắt kèm trích dẫn rồi quyết định ôn theo đó.

Khi tín hiệu không đủ chắc, hệ thống hạ tier hoặc gắn nhãn cảnh báo thay vì đoán liều lên mức ưu tiên cao. Khi không tìm được căn cứ cho một khái niệm, hệ thống không hiển thị khái niệm đó thay vì bịa ra — và có thể báo ngắn gọn rằng bản đồ chưa đủ tin cậy cho buổi này. Học viên luôn có thể tự sửa bằng cách bỏ qua khái niệm mình không đồng ý hoặc đổi quỹ thời gian; hệ thống không ép theo đúng thứ tự đã đề xuất. Khi học viên đòi những thứ ngoài phạm vi — quiz, đoán đề, nghe audio, chat với tutor thật — hệ thống từ chối ngắn gọn và hướng họ quay lại phần đang có sẵn.

## §7. Kiểm thử

Chất lượng được đo trên bốn khía cạnh: khái niệm và trích dẫn có đúng sự thật trong transcript không; tier có hợp lý với tín hiệu quan sát được không (nhấn mạnh, lặp lại, xuất hiện ở phần tóm tắt cuối buổi); mỗi thẻ có đúng một ý ôn được, không gộp lẫn; và output không vượt quá những gì được phép tuyên bố. Mỗi khía cạnh đều được viết thành quy tắc pass/fail cụ thể để hai người chấm độc lập ra cùng kết quả.

Golden set gồm ít nhất 20 case xây trên transcript Day 1: phần lớn là case thường (khái niệm/tier kỳ vọng đối chiếu với bản dựng tay), ít nhất hai case cho mỗi lớp chỗ khó ở §5, vài case hiếm khi tín hiệu mỏng hoặc mâu thuẫn nhau, và ít nhất mười case bám theo đúng những câu hỏi tóm tắt/trọng tâm thật trong chatlog — kiểm tra xem ý đó có được thể hiện đúng trong Map khi nó thật sự tồn tại trong transcript, và không bị suy diễn khi không có căn cứ. Toàn bộ lưu trong `eval/`.

**Quality bar:** đạt khi ≥70% case qua bộ theo các định nghĩa trên, và 100% case không chứa khái niệm bịa đặt hoặc lời tuyên bố vượt phạm vi — hai điều kiện này giữ nguyên từ lúc chốt spec, không đổi cho vừa số liệu.

| Lượt | Thời điểm | % đạt | Ghi chú |
|---|---|---|---|
| 0 — mock | Trước CP2 | — | Map dựng tay từ transcript, chưa gọi AI |
| 1 | CP3 | 46,9% (15/32 case áp dụng được, 4/36 case chưa kích hoạt) | AI thật qua Groq (`llama-3.3-70b-versatile`, script `codebase/generate-review-map.mjs`) — **chưa đạt bar 70%**. Bỏ sót toàn bộ khối token/context/sampling, tier "core" bị lạm phát, 1 case hedge không được xử lý đúng. Chi tiết: `eval/run-1-results.md` |
| 2 | Sau CP3, trước CP6 | 59,4% (19/32) | Sau khi chunk theo heading, giới hạn core, thêm ví dụ hedge — **vẫn chưa đạt bar 70%**. Cải thiện rõ (Attention/Transformer đúng tier core, Token/Context xuất hiện) nhưng vòng gộp (consolidate) tự ý bỏ ~15/26 khái niệm nháp hợp lệ thay vì hạ tier, và bỏ hẳn 1/4 cuối transcript. Chi tiết + chẩn đoán: `eval/run-2-results.md` |
| 3+ | Trước CP6 | _điền_ | Cần tách vòng gộp thành các bước nhỏ hơn (hoặc gộp bằng code + AI chỉ gán tier) để hết tình trạng model tự ý bỏ sót khái niệm hợp lệ |

## §8. Phân công & kế hoạch

| Phần việc | Người phụ trách |
|---|---|
| Spec và Canvas CP1 | Trần Minh Hiển · 2A202601812 |
| Mining bằng chứng (+ khảo sát sau nếu làm) | Trương Minh Tâm · 2A202602005 |
| Prompt sinh Review Map + golden set | Phạm Hải Yến · 2A202601152 |
| Dựng UI ba màn (prototype mock) | Trần Hoàng Khôi · 2A202601778 |
| Demo script, slide, dry run | Trần Văn Toàn · 2A202601218 |

Ba willing user dự kiến: sẽ chốt tên trước CP5 (ưu tiên học viên ngoài nhóm cùng khoá). Vòng validation trước CP5 sẽ giao mỗi người một nhiệm vụ cụ thể — dùng Review Map để quyết định ôn Day 1 trong 15 phút — rồi quan sát im lặng và hỏi đúng ba câu: điều gì khó hiểu hoặc khó chịu nhất, có tin kết quả này không và vì sao, có dùng thật không và vì sao. Toàn bộ ghi lại nguyên văn trong `validation/`.

Nếu kịp giữa CP2 và CP3, nhóm thử thêm một phương án khác trên cùng một trục thiết kế: hiển thị đủ ba tier so với chỉ hiện đúng danh sách cần ôn trong quỹ thời gian đã chọn — rồi giữ lại bằng chứng và lý do chọn phương án cuối.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| 2026-07-30 | Chốt hướng LectureFocus, khoá phạm vi không làm quiz/adaptive/backend | Bằng chứng mining cho thấy đúng nhu cầu ưu tiên hoá kiến thức, và giữ lát cắt gọn trong một quyết định AI |
| 2026-07-30 | Tách chi tiết UI và mock data sang file riêng | Giữ spec.md gọn, đúng trọng tâm rubric |
| 2026-07-30 | Chạy lượt AI thật đầu tiên (CP3) qua Groq API, kết quả 46,9% — chưa đạt quality bar 70% | Ghi nhận trung thực theo đúng luật hackathon; nguyên nhân đã phân tích trong `eval/run-1-results.md`, có kế hoạch sửa cụ thể cho lượt 2 |
