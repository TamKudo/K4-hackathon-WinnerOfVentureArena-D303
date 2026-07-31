# Reflection — Trần Minh Hiển · 2A202601812

> Điền 4 mục dưới. Rubric chấm: vai trò + phần mình làm + AI hỗ trợ thế nào + **một bài học từ case fail của chính nhóm**.
> **Vibe-coding rule:** bị hỏi ngẫu nhiên tại CP5/CP6 mà không giải thích được phần có tên mình → 0 điểm phần cá nhân liên quan.

## 1. Vai trò trong nhóm

Phụ trách **spec và phạm vi** — viết AI Spec 9 mục, chốt Canvas CP1, và giữ Changelog §9 để mọi thay đổi hướng đều có lý do ghi lại. Thực tế còn dựng thêm bản UI React ở `codebase/web/`. Nhóm phân như vậy vì spec là deliverable trung tâm mà mọi phần khác trỏ về: lát cắt, non-goals và quality bar quyết định người khác được làm gì và không được làm gì.

> ⚠️ *Đây là bản nháp dựng từ artifact trong repo — Hiển tự sửa lại theo trải nghiệm thật của mình trước khi nộp.*

## 2. Phần mình làm

Theo `spec.md` §8: **Spec và Canvas CP1 · tổng hợp changelog**. Thực tế còn dựng thêm bản UI React (`codebase/web/`) trên nhánh `hien`.

Artifact có tên bạn trong repo:
- `spec.md` — toàn bộ 9 mục, đặc biệt §9 Changelog (13 dòng ghi lại từng quyết định đổi hướng)
- `codebase/web/` — React + Vite + Tailwind + shadcn, flow Landing → Ôn tập → Chi tiết khái niệm
- `docs/lecturefocus-product-spec.md` — chi tiết UI và flow

**Ba quyết định phạm vi khó nhất, đều ghi lại trong Changelog §9:**

1. **Giữ lát cắt ở đúng một quyết định AI.** Có lúc nhóm định thêm ô chat để học viên tự gõ câu hỏi. Đã bỏ — vì nó tạo quyết định AI thứ hai, phá non-goal "không chatbot AI Tutor thật", và mâu thuẫn kịch bản §5 số 5-6 (từ chối khi học viên đòi quiz/đoán đề). Khảo sát cũng cho thấy **0% chọn "đợi bạn tự gõ câu hỏi rồi mới trả lời"**.

2. **Dựng `codebase/webapp/` rồi xoá hẳn trong cùng một ngày.** Bỏ non-goal "không xây backend" để có link deploy cho user test, rồi quyết định quay lại non-goal gốc. Cả hai chiều đều ghi Changelog thay vì lặng lẽ đổi.

3. **Chuyển UI sang React.** `lecturefocus.html` chạy được nhưng khó thêm trạng thái (low-confidence, failure) và khó cho người ngoài nhóm dùng thử. Đổi kèm cái giá phải trả: nới một vế non-goal audio cho TTS đọc text evidence, và thêm tầng Gemini vốn **không nằm trong lát cắt đã khai**. Đã ghi rõ cả hai ở §4 và §9.

**Quality bar:** chốt 70% lúc 23:59 N1, kết quả thật 63,6%. Không hạ bar cho vừa số liệu — thay vào đó viết phân tích khoảng cách vào §7.

*[Hiển bổ sung: mục nào của spec khó viết nhất, có tranh luận gì trong nhóm khi chốt non-goals không]*

**Cần giải thích được nếu bị hỏi:**

*Về spec:*
- Vì sao lát cắt chỉ có **một** quyết định AI, không phải hai?
- Vì sao chọn **augment** chứ không automate? (cost-of-error: xếp nhầm khái niệm nền tảng xuống Supporting khiến học viên bỏ sót kiến thức trước lab)
- Vì sao loại ứng viên B và C ở §2? Con số nào dẫn đến quyết định đó?
- Vì sao nhóm **không hạ quality bar** xuống 60% khi biết chỉ đạt 63,6%?

*Về bản React:*
- Vì sao chuyển từ `lecturefocus.html` sang React? Đánh đổi gì?
- Tầng Gemini (`vite.geminiDepthPlugin.ts`) làm gì, **khác gì** với lời gọi Groq ở quyết định trung tâm? (Groq = quyết định AI đã khai trong lát cắt, đã đo bằng golden set; Gemini = lớp làm sâu văn bản lúc chạy, **chưa có eval nào đo**)
- Non-goal audio đã bị nới thế nào và vì sao? (TTS chỉ đọc text evidence trên màn hình, không đụng audio giảng viên — ghi rõ ở §4 và §9)

## 3. AI hỗ trợ mình thế nào

[Điền: dùng AI vào việc gì, chỗ nào AI giúp được, chỗ nào phải tự sửa lại vì AI làm sai/không hiểu bối cảnh]

## 4. Một bài học từ case fail của nhóm

Gợi ý — chọn một fail có thật, đừng chọn fail chung chung:

- **Spec từng ghi "Lượt 3 — Không chạy được" trong khi thực tế đã chạy lại thành công và còn chạy thêm 2 lượt nữa.** Dòng đó chỉ đúng với lần bị chặn quota ngày 30/07 nhưng không ai cập nhật lại. Nếu để nguyên là che giấu số liệu đã đo — đúng thứ rubric phạt nặng nhất. Bài học: artifact phải cập nhật ngay sau khi đo, đừng để spec và thực tế lệch nhau.
- **Non-goal "không xây backend" bị bỏ rồi khôi phục rồi lại nới trong cùng một ngày** (`webapp/` dựng lên → xoá đi → React + Gemini plugin). Bài học về cái giá của việc đổi phạm vi giữa chừng.
- **Bản React ban đầu hiển thị 8 khái niệm dựng tay** kèm nhãn "Nguồn: mock", trong khi số liệu chính thức là 21 khái niệm từ AI thật. Demo và báo cáo suýt trỏ về hai nguồn khác nhau.
- **Key Gemini bị commit lên GitHub** trong `.env.example` (commit `84278ab`, nhánh `origin/hien`) thay vì để trong `.env`. Vi phạm luật "Không commit API key" ở README. Bài học về phân biệt file mẫu và file chứa bí mật.

**Case chọn: spec ghi "Lượt 3 — Không chạy được" trong khi thực tế đã chạy lại thành công và còn chạy thêm 2 lượt nữa.**

Ngày 30/07, lượt 3 bị Groq free tier chặn vì hết quota. Tôi ghi đúng như vậy vào §7. Nhưng hôm sau nhóm chạy lại thành công (10 lời gọi AI, có trace đầy đủ) rồi chạy tiếp lượt 4 và 5 — mà **không ai cập nhật lại dòng đó**. Trong nhiều giờ, spec nói một đằng còn `eval/` chứa một nẻo: ba thư mục `run-3/`, `run-4/`, `run-5/` có output thật nhưng không có bảng kết quả nào, và số liệu chính thức vẫn ghi là 59,4% của lượt 2 trong khi lượt 5 đạt 63,6%.

**Vì sao đây là fail nghiêm trọng:** rubric ghi rõ *"số liệu bị chỉnh sửa hoặc che giấu sẽ không được tính"*. Chúng tôi không cố ý giấu — nhưng nếu nộp nguyên trạng thì kết quả vẫn y hệt như giấu: giám khảo mở `eval/` thấy dữ liệu mà spec không nhắc tới. Nghịch lý là số liệu mới **tốt hơn** số cũ, nên việc không cập nhật còn làm nhóm mất điểm oan.

**Bài học:** artifact phải cập nhật **ngay sau khi đo**, không để đến cuối. Đo xong mà chưa ghi thì coi như chưa đo. Tôi đã bổ sung vào Changelog dòng ghi rõ việc sửa này và lý do, thay vì lặng lẽ đổi con số.

Lần sau, mỗi lần chạy eval xong tôi sẽ cập nhật bảng §7 trong cùng một lượt làm việc — coi đó là một phần của việc chạy, không phải việc riêng làm sau.
