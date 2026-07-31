# Product Spec — LectureFocus AI (MVP UI Mock)

> **Spec nộp hackathon (đủ §1–§9 theo template):** [`../spec.md`](../spec.md)  
> File này giữ chi tiết UI flow, information architecture và mock JSON để dựng giao diện.

**Hướng:** A — VLearn · **Loại:** Tính năng mới  
**Mức prototype hiện tại:** Sketch / Mock UI (data giả, chưa gọi AI thật)  
**Transcript demo:** `data/vlearn-pack/transcript/transcript-04-clean.md` (Day 1 — Foundation: cách LLM hoạt động)

---

## 1. Problem & User

### Target user

Học viên khoá AI Thực Chiến vừa kết thúc một buổi học (hoặc chuẩn bị ôn trước lab / quiz / buổi tiếp theo), cần nắm lại nội dung trong thời gian có hạn.

### Situation

Sau buổi học dài, học viên mở lại tài liệu hoặc AI Tutor để ôn. Họ có thể:

- không nhớ bài có những kiến thức chính nào;
- không biết phần nào nên ưu tiên trong 15–60 phút còn lại;
- không nhớ mình đã bỏ sót đoạn nào.

AI Tutor hiện tại chủ yếu hỗ trợ khi học viên **đã biết mình cần hỏi gì** (chat / bôi đen đoạn → hỏi). LectureFocus giải quyết bước **trước đó**: giúp học viên biết nên tập trung vào đâu.

### Pain statement (một câu)

Học viên sau buổi học muốn ôn nhanh nhưng không biết bài có những kiến thức chính nào và phần nào nên ưu tiên, nên phải tự xem lại toàn bộ hoặc phải biết trước mình cần hỏi chatbot điều gì.

### Evidence hiện có (mining chatlog — chỉ dùng để chứng minh pain)

| Chỉ số | Giá trị | Ghi chú |
|---|---|---|
| Lượt hỏi tóm tắt / tổng hợp | 142 / 1.261 (~11%) | Nhu cầu “tóm lại bài” tồn tại thật |
| Học viên từng hỏi kiểu này | 99 / 369 (~27%) | Không phải edge case của vài người |
| Trong đó tutor fail / từ chối | ~60,6% (86/142) | Nhu cầu có nhưng AI Tutor hiện tại xử lý kém |
| Lượt hỏi trực tiếp về trọng tâm / quan trọng | ~25 | “kiến thức trọng tâm”, “cần nắm”, “phần này có quan trọng không” |

**Ràng buộc dùng evidence:**

- Chatlog chỉ dùng để chứng minh pain / hành vi người dùng.
- Chatlog **không** phải runtime input của LectureFocus.
- Không suy diễn mapping giữa chatlog và transcript (chưa có mapping đáng tin).

**≥5 ví dụ nguyên văn (ngắn) — nguồn chatlog:**

1. “tóm tắt cho tôi nội dung của bài này, chỉ ra những kiến thức trọng tâm cần thiết”
2. “hãy tóm tắt các đầu kiến thức quan trọng cần phải nắm ở bài giảng này”
3. “tóm tắt toàn bộ tài liệu, kiến thức quan trọng cần nhớ”
4. “phần này có quan trọng không”
5. “tóm tắt các chủ đề chính của slide …” → tutor: không tìm thấy nội dung / từ chối

### JTBD

> Khi cần ôn lại một buổi học, tôi muốn nhanh chóng biết bài có những kiến thức chính nào và phần nào nên ưu tiên, để không phải tự xem lại toàn bộ nội dung hoặc phải biết trước mình cần hỏi chatbot điều gì.

### Lát cắt MỘT CÂU (cho Canvas / CP1)

> Một học viên vừa kết thúc buổi học muốn ôn trong quỹ thời gian có hạn · AI quyết định **trích các knowledge concept từ transcript và xếp mức ưu tiên ôn tập Core / Important / Supporting kèm bằng chứng trong bài giảng** · kết quả là Review Map + plan ôn theo thứ tự ưu tiên — học viên không cần biết trước mình phải hỏi gì.

---

## 2. Product Decision

### Input của hệ thống

| Input | Vai trò trong MVP |
|---|---|
| Transcript một buổi học đã có sẵn (bản sạch, có mã đoạn `[Txx-NNN]`) | **Nguồn kiến thức duy nhất** để sinh Review Map |
| Lesson metadata (tên buổi, day, mô tả ngắn) | Hiển thị trên Lesson / entry screen |
| Quỹ thời gian user chọn: 15 / 30 / 60 phút | Filter / sắp xếp Review Plan (không phải quyết định AI thứ hai) |

**Không dùng trong runtime MVP:** chatlog, quiz history, learner profile, recording/audio.

### AI quyết định gì (một quyết định duy nhất)

Từ transcript của một buổi học:

1. xác định các **knowledge concept**;
2. xếp mỗi concept vào một trong ba mức ưu tiên ôn tập:
   - **Core Focus** — được nhấn mạnh mạnh trong bài; nên ôn trước;
   - **Important** — cần để hiểu bài; nên ôn nếu còn thời gian;
   - **Supporting** — ví dụ, mở rộng, ngữ cảnh bổ trợ;
3. gắn mỗi concept với **bằng chứng trong transcript** (tóm tắt ngắn + lý do xếp tier + trích đoạn / mã đoạn).

Tín hiệu dùng để xếp tier (proxy trong MVP / production sau này):

- mức độ lặp lại / số đoạn dành cho khái niệm;
- giảng viên nhấn mạnh trực tiếp (“quan trọng”, “cần nhớ”, tóm tắt cuối buổi);
- có ví dụ / thí nghiệm minh họa kèm theo;
- xuất hiện trong phần tóm tắt cuối buổi hoặc quiz ôn.

> Trong prototype UI hiện tại: quyết định này **đã chạy trước** (mock data). UI chỉ hiển thị kết quả.

### Output mà user nhìn thấy

1. **Review Map** — danh sách concept theo 3 tier.
2. **Concept Detail** — tóm tắt, lý do ưu tiên, evidence từ bài giảng.
3. **Review Plan** — thứ tự ôn theo quỹ thời gian 15 / 30 / 60 phút (subset + thứ tự từ cùng bộ concept).

### Điều AI KHÔNG được tuyên bố hoặc suy luận

- Không nói “phần này sẽ ra thi”.
- Không nói “độ quan trọng tuyệt đối” ngoài ngữ cảnh buổi học.
- Không bịa concept không có căn cứ trong transcript.
- Không suy luận từ chatlog, điểm số, hay hồ sơ học viên.
- Không tuyên bố “bạn chưa hiểu phần X” (không có dữ liệu hiểu bài của user).
- Không thay thế AI Tutor trả lời câu hỏi sâu — chỉ có CTA chuyển sang hỏi Tutor (mock).

### Automation & cost-of-error (gợi ý cho spec.md sau)

- **Mức:** Conditional / Augment — AI đề xuất map; user tự quyết định ôn gì.
- **Lý do:** xếp nhầm Core → Supporting có thể khiến học viên bỏ sót kiến thức nền; nhưng user vẫn đọc được evidence và tự kiểm → sai sửa được, không chấm điểm tự động.

---

## 3. MVP Capability Boundary

### Hệ thống làm được gì (MVP hackathon — UI mock)

1. Mở một bài học đã học (demo: Day 1 Foundation).
2. Xem Review Map với 3 tier: Core Focus / Important / Supporting.
3. Bấm một concept → xem tóm tắt ngắn, lý do ưu tiên, evidence (trích đoạn + mã `[T04-NNN]`).
4. Chọn quỹ thời gian 15 / 30 / 60 phút → xem Review Plan theo thứ tự ưu tiên.
5. Thấy CTA “Hỏi AI Tutor về phần này” (không mở chatbot thật; có thể toast / placeholder).
6. Toàn bộ data đến từ mock Review Map được chuẩn bị sẵn từ một transcript.

### Hệ thống không làm gì trong hackathon (out of scope)

- Quiz generation / grading
- Adaptive learning / learner profile
- Speech-to-Text / recording processing / audio playback / TTS
- Upload transcript
- Backend / database / API / RAG / multi-agent
- Chatbot AI Tutor thật
- Tự động mapping chatlog ↔ transcript
- Gọi AI thật để sinh Review Map lúc runtime (giai đoạn UI mock hiện tại)
- Dự đoán nội dung thi / điểm số

---

## 4. User Flow (3 màn hình)

```text
[Lesson]  →  [Review Map]  →  [Concept Detail]
                  │                    ↑
                  └── Review Plan ─────┘
                      (cùng màn Map,
                       đổi bằng filter thời gian)
```

Ưu tiên **3 màn**. Review Plan không cần màn riêng: nằm trên Review Map dưới dạng chế độ xem khi chọn 15/30/60'.

### Màn 1 — Lesson / Entry

**User thấy:**

- Tên bài: Day 1 — Foundation: cách LLM hoạt động
- Meta ngắn: ~ buổi Foundation · nguồn: transcript bài giảng
- 1 CTA chính: **Xem Review Map**
- (Tuỳ chọn) dòng phụ: “Bản đồ ưu tiên ôn tập dựa trên nội dung bài giảng — không phải dự đoán đề thi”

**User bấm:** `Xem Review Map`

**Hệ thống:** chuyển sang Màn 2, load mock Review Map của lesson đó.

### Màn 2 — Review Map (+ Review Plan)

**User thấy:**

- Header: tên lesson + số concept theo từng tier (vd. Core 4 · Important 4 · Supporting 3)
- Bộ chọn quỹ thời gian: `Tất cả` | `15'` | `30'` | `60'` (mặc định: Tất cả = full map)
- 3 nhóm (hoặc 1 danh sách có nhãn tier):
  - Core Focus
  - Important
  - Supporting
- Mỗi concept card: tên · badge tier · 1 dòng summary ngắn · (tuỳ chọn) “~N phút ôn ước lượng”

**Khi chọn 15' / 30' / 60':**

- Hệ thống **không gọi AI mới**.
- Chỉ lọc + sắp xếp lại subset concept theo rule cố định (xem §5.3).
- Header đổi thành “Kế hoạch ôn · 15 phút” (hoặc 30/60).

**User bấm:** một concept card

**Hệ thống:** mở Màn 3 (Concept Detail) với data của concept đó.

### Màn 3 — Concept Detail

**User thấy:**

- Tên concept + badge tier
- Short summary (2–4 câu)
- Reason: vì sao xếp tier này (1–3 bullet, bám tín hiệu trong bài)
- Evidence: 1–2 trích đoạn transcript + mã `[T04-NNN]`
- CTA phụ: **Hỏi AI Tutor về phần này** (mock)
- CTA quay lại: **← Review Map**

**User bấm:**

- `← Review Map` → về Màn 2 (giữ nguyên filter thời gian đang chọn)
- `Hỏi AI Tutor về phần này` → toast / panel: “Sắp có — trong MVP này chưa kết nối chatbot”

**Không thêm màn hình:** onboarding dài, upload, settings, danh sách nhiều lesson phức tạp (Lesson screen chỉ cần 1 lesson demo là đủ).

---

## 5. UI Information Architecture

### 5.1 Lesson object

| Field | Ví dụ | Hiển thị ở |
|---|---|---|
| `lesson_id` | `day01-foundation` | nội bộ |
| `title` | Day 1 — Foundation: cách LLM hoạt động | Lesson, Map header |
| `subtitle` | Cách LLM hoạt động (Transformer, attention, agent) | Lesson |
| `source_label` | Transcript bài giảng (bản sạch) | Lesson footer nhỏ |
| `concept_counts` | `{core:4, important:4, supporting:3}` | Map header |

### 5.2 Concept card (trên Review Map)

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `concept_id` | có | vd. `c01` |
| `name` | có | tên ngắn, học viên đọc được |
| `tier` | có | `core` \| `important` \| `supporting` |
| `short_summary` | có | 1 câu trên card |
| `estimated_minutes` | có | dùng cho filter 15/30/60 |
| `order_in_tier` | có | thứ tự trong tier |

### 5.3 Concept detail

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| tất cả field của card | có | |
| `summary` | có | 2–4 câu |
| `reason` | có | 1–3 lý do xếp tier, viết từ tín hiệu bài giảng |
| `evidence[]` | có | mỗi mục: `segment_id`, `quote`, (tuỳ chọn) `note` |
| `tutor_cta_label` | có | cố định: “Hỏi AI Tutor về phần này” |

### 5.4 Review Plan rules (deterministic — không phải AI)

Áp dụng khi user chọn quỹ thời gian:

1. Sắp xếp toàn bộ concept: Core → Important → Supporting; trong cùng tier theo `order_in_tier`.
2. Cộng dồn `estimated_minutes` từ trên xuống.
3. Giữ các concept cho đến khi tổng ≤ quỹ thời gian đã chọn.
4. Nếu concept đầu tiên đã > quỹ (edge): vẫn hiện 1 concept Core đầu tiên + nhãn “vượt quỹ — ưu tiên đọc tóm tắt”.

Gợi ý quỹ mặc định cho mock hiện tại:

| Quỹ | Concept được giữ (theo thứ tự) |
|---|---|
| 15' | 3 concept Core đầu (~5'+5'+5') |
| 30' | 4 Core + 2 Important đầu |
| 60' | toàn bộ Core + Important + 1–2 Supporting đầu |
| Tất cả | toàn bộ map |

---

## 6. Mock Data

Nguồn: `transcript-04-clean.md`.  
Mỗi evidence gắn mã đoạn thật. Tier phản ánh mức nhấn mạnh / lặp lại / xuất hiện trong tóm tắt cuối buổi — **không** phải “sẽ thi”.

### 6.1 Lesson

```json
{
  "lesson_id": "day01-foundation",
  "title": "Day 1 — Foundation: cách LLM hoạt động",
  "subtitle": "Transformer, attention, token, context — nền tảng để làm việc với LLM",
  "source_label": "Transcript bài giảng (bản sạch)",
  "concept_counts": { "core": 4, "important": 4, "supporting": 3 }
}
```

### 6.2 Concepts

```json
{
  "lesson_id": "day01-foundation",
  "concepts": [
    {
      "concept_id": "c01",
      "name": "LLM dự đoán token tiếp theo (autoregressive)",
      "tier": "core",
      "order_in_tier": 1,
      "estimated_minutes": 5,
      "short_summary": "LLM không 'biết' tri thức theo nghĩa tra cứu — nó dự đoán token tiếp theo theo xác suất.",
      "summary": "Trái tim của ChatGPT/Claude/Gemini là mô hình ngôn ngữ lớn. Bản chất Transformer/LLM là vòng lặp dự đoán token tiếp theo: predict → append → rerun. Văn bản trông có lý vẫn có thể sai (hallucination) vì mô hình đang nối từ cho có nghĩa, không đảm bảo sự thật.",
      "reason": [
        "Giảng viên dành cả mục 'mổ xẻ mô hình' để giải thích cơ chế này.",
        "Được nhắc lại trong phần tóm tắt cuối buổi như điểm cần nhớ số 1.",
        "Xuất hiện trong quiz ôn: vòng lặp predict → append → rerun."
      ],
      "evidence": [
        {
          "segment_id": "T04-047",
          "quote": "Bản chất của các mô hình ngôn ngữ lớn này, đấy là nó dự đoán... những từ tiếp theo, hoặc là những token."
        },
        {
          "segment_id": "T04-091",
          "quote": "Các mô hình ngôn ngữ lớn bây giờ hoạt động trên nền tảng Transformer và sinh các token tiếp theo — dự đoán các token tiếp theo."
        }
      ]
    },
    {
      "concept_id": "c02",
      "name": "Attention trong Transformer",
      "tier": "core",
      "order_in_tier": 2,
      "estimated_minutes": 5,
      "short_summary": "Attention giúp mô hình nhìn cả câu và tập trung vào từ/quan hệ quan trọng, thay vì đọc từng chữ nối tiếp như RNN.",
      "summary": "Khác RNN (đọc từng chữ, dễ quên đầu câu), Transformer dùng attention để đọc cả cụm, nhận diện keyword và mối liên hệ giữa các từ. Đây là ý của 'Attention Is All You Need' (2017). Attention cũng là nền để hiểu vì sao quản lý context quan trọng.",
      "reason": [
        "Được giảng dài, có so sánh trực tiếp với RNN/dịch máy cũ.",
        "Học viên được mời giải thích lại Transformer/attention để nhận điểm cộng.",
        "Xuất hiện trong tóm tắt cuối buổi và quiz."
      ],
      "evidence": [
        {
          "segment_id": "T04-040",
          "quote": "Thay vì lần lượt đọc và dịch từng chữ một, nó sẽ đọc cả cụm đấy, và nhận diện được đâu là những keyword... mối liên kết giữa nhiều từ trong một câu."
        },
        {
          "segment_id": "T04-038",
          "quote": "Năm 2017 là bài báo rất nổi tiếng — 'Attention Is All You Need'... kiến trúc transformer."
        }
      ]
    },
    {
      "concept_id": "c03",
      "name": "Token và context window",
      "tier": "core",
      "order_in_tier": 3,
      "estimated_minutes": 5,
      "short_summary": "Token là đơn vị tính của LLM; context window là lượng thông tin mô hình tiêu thụ được trong một lần.",
      "summary": "Token không phải 'từ' hay 'ký tự' — là ngôn ngữ của máy. Tiếng Việt thường tốn nhiều token hơn tiếng Anh vì dấu. Context window càng lớn càng nhét được nhiều thông tin, nhưng không đồng nghĩa luôn tốt hơn (context rot). Quản lý những gì đưa vào context là kỹ năng then chốt khi dùng AI.",
      "reason": [
        "Hai khái niệm được giảng như 'thuật ngữ quan trọng cần nắm'.",
        "Gắn trực tiếp với lab gọi API ngày hôm sau (đếm token, tính chi phí).",
        "Được nhấn trong tóm tắt cuối buổi."
      ],
      "evidence": [
        {
          "segment_id": "T04-049",
          "quote": "Trong các mô hình ngôn ngữ lớn thì có một thuật ngữ quan trọng chúng ta cần nắm được, đấy là token."
        },
        {
          "segment_id": "T04-051",
          "quote": "Context ở đây nghĩa là... toàn bộ những thông tin mà một mô hình nó có thể tiêu thụ trong một lần."
        }
      ]
    },
    {
      "concept_id": "c04",
      "name": "Quản lý context / sự chú ý của mô hình",
      "tier": "core",
      "order_in_tier": 4,
      "estimated_minutes": 5,
      "short_summary": "Không phải context càng lớn càng tốt — cần chủ động đưa đúng thông tin quan trọng cho mô hình.",
      "summary": "Khi nhồi quá nhiều context, mô hình có thể chú ý sai chỗ (context rot). Giảng viên rút bài học thực dụng: quản lý attention/context tốt giúp code/build tốt hơn và tiết kiệm chi phí. Tip: chủ động ghi lại quyết định quan trọng thay vì để model tự tóm tắt khi tràn context.",
      "reason": [
        "Giảng viên gọi đây là bài học rất quan trọng khi làm việc với AI / vibe code.",
        "Nối trực tiếp từ attention → thực hành hàng ngày của học viên.",
        "Được neo trong tóm tắt cuối buổi (lớp công cụ + context bao quanh mô hình)."
      ],
      "evidence": [
        {
          "segment_id": "T04-053",
          "quote": "Việc quản lý cái cửa sổ ngữ cảnh này rất là quan trọng: chúng ta cần biết được là lúc nào nên đưa cái gì cho AI."
        },
        {
          "segment_id": "T04-057",
          "quote": "Bạn hãy quản lý cái sự chú ý của các mô hình, và quản lý cái context mà bạn đưa cho các mô hình."
        }
      ]
    },
    {
      "concept_id": "c05",
      "name": "Temperature và top-k / top-p",
      "tier": "important",
      "order_in_tier": 1,
      "estimated_minutes": 4,
      "short_summary": "Top-k/top-p khoanh vùng ứng viên token; temperature điều chỉnh độ ngẫu nhiên trong phạm vi đó.",
      "summary": "Khi gọi API, sampling quyết định không gian lựa chọn (top-k = lấy k ứng viên hàng đầu; top-p = lấy đến khi cộng dồn xác suất đạt ngưỡng). Temperature = 0 gần như luôn lấy xác suất cao nhất (deterministic); tăng temperature = sáng tạo / ngẫu nhiên hơn trong phạm vi đã chọn.",
      "reason": [
        "Được giảng kèm công cụ tương tác trực quan.",
        "Gắn với lab gọi API ngày mai.",
        "Xuất hiện trong quiz (temperature = 0)."
      ],
      "evidence": [
        {
          "segment_id": "T04-072",
          "quote": "Nếu temperature bằng 0, mô hình sẽ luôn luôn lấy xác suất cao nhất... top-k/top-p là để... khoanh vùng để lấy trong bao nhiêu."
        }
      ]
    },
    {
      "concept_id": "c06",
      "name": "LLM cần lớp bao quanh: tool, context, memory, guardrail",
      "tier": "important",
      "order_in_tier": 2,
      "estimated_minutes": 4,
      "short_summary": "Mô hình một mình bị giới hạn kiến thức cắt; muốn hữu ích ngoài đời thật phải gắn thêm lớp xung quanh.",
      "summary": "LLM chỉ học dữ liệu đến thời điểm train — yếu với tin tức/thời tiết mới. Để thông minh hơn trong sản phẩm thật: thêm context (upload/file), tool tra cứu/hành động, memory, và guardrail. Con đường từ model → agent là lắp 'tay chân' và kế hoạch.",
      "reason": [
        "Được nhắc như hướng phát triển tất yếu của LLM.",
        "Xuất hiện rõ trong tóm tắt cuối buổi.",
        "Chuẩn bị tư duy cho các buổi agent phía sau."
      ],
      "evidence": [
        {
          "segment_id": "T04-074",
          "quote": "Bản thân LLM chỉ là một bộ não phía bên trong. Để bộ não này phát huy hết năng lực, nó cần các lớp lớn hơn bên ngoài... context... tool... memory... guardrail."
        },
        {
          "segment_id": "T04-091",
          "quote": "Để càng ngày càng thông minh như bây giờ, nó phải có những lớp công cụ — tool, context, các lớp hệ thống — bao phủ trên mô hình đấy."
        }
      ]
    },
    {
      "concept_id": "c07",
      "name": "Evaluation quyết định phần lớn thành công sản phẩm AI",
      "tier": "important",
      "order_in_tier": 3,
      "estimated_minutes": 4,
      "short_summary": "Giảng viên nhấn: evaluation có thể quyết định ~80% thành công khi đưa sản phẩm AI ra đời thật.",
      "summary": "Cần bộ dataset/benchmark và hạ tầng đánh giá lặp lại được. Không có evaluation, agent có thể 'demo được' nhưng không debug được khi ra production, cũng khó trả lời có nên đổi model mới hay không.",
      "reason": [
        "Giảng viên dùng ngôn ngữ nhấn mạnh rất mạnh ('quan trọng nhất', '~80%').",
        "Xuất hiện trong tóm tắt cuối buổi như mindset cần giữ.",
        "Khớp trực tiếp tinh thần hackathon (đo, golden set)."
      ],
      "evidence": [
        {
          "segment_id": "T04-075",
          "quote": "Quan trọng nhất... đấy là evaluation. Bạn làm tốt việc này thì nó quyết định đến 80% thành công sản phẩm của các bạn."
        },
        {
          "segment_id": "T04-091",
          "quote": "Việc xây dựng cho mình tư duy đánh giá kết quả đầu ra — mindset về evaluation — theo mình rất quan trọng."
        }
      ]
    },
    {
      "concept_id": "c08",
      "name": "Chọn mô hình theo bài toán, không theo leaderboard",
      "tier": "important",
      "order_in_tier": 4,
      "estimated_minutes": 3,
      "short_summary": "Hiểu việc cần làm + điểm mạnh từng model, rồi thử — đừng tin mù quáng bảng xếp hạng.",
      "summary": "Leaderboard thường thiên vị nhà sản xuất. Frame thực dụng: việc đơn giản → model rẻ đủ mạnh; việc khó → model suy luận cao. Có thể dùng model mạnh để plan, rồi giao task rõ cho model rẻ hơn. Phải thử trên đúng việc của mình.",
      "reason": [
        "Được giảng như frame lựa chọn thực tế cho học viên ứng dụng.",
        "Có trong tóm tắt cuối buổi.",
        "Có ví dụ cá nhân của giảng viên (Claude vs Kimi cho slide)."
      ],
      "evidence": [
        {
          "segment_id": "T04-084",
          "quote": "Bạn cần phải hiểu việc bạn cần làm là gì và nên dùng mô hình gì... Việc đơn giản thì xài các mô hình phù hợp, đơn giản mà giá rẻ; việc khó và phức tạp thì mới xài những mô hình có tính suy luận cao."
        }
      ]
    },
    {
      "concept_id": "c09",
      "name": "Bức tranh AI ⊃ ML ⊃ Deep Learning ⊃ Generative AI",
      "tier": "supporting",
      "order_in_tier": 1,
      "estimated_minutes": 3,
      "short_summary": "Khung thuật ngữ mở đầu: generative AI nằm trong deep learning, trong machine learning, trong AI.",
      "summary": "Giảng viên dùng hình các vòng lồng nhau để định vị thuật ngữ trước khi đi vào lịch sử và Transformer. Hữu ích để không nhầm ChatGPT với 'toàn bộ AI'.",
      "reason": [
        "Xuất hiện sớm để định vị ngôn ngữ chung.",
        "Ít được nhắc lại ở phần tóm tắt kỹ thuật cuối buổi so với token/attention."
      ],
      "evidence": [
        {
          "segment_id": "T04-015",
          "quote": "Rộng nhất chúng ta có AI... Vòng bên trong là machine learning... deep learning... tầng trong cùng là tầng của generative AI."
        }
      ]
    },
    {
      "concept_id": "c10",
      "name": "Lịch sử AI: symbolic AI, mùa đông, deep learning",
      "tier": "supporting",
      "order_in_tier": 2,
      "estimated_minutes": 4,
      "short_summary": "Bối cảnh vì sao cách tiếp cận cũ chạm trần và deep learning/dữ liệu trở thành bước ngoặt.",
      "summary": "Từ Turing test, symbolic AI, perceptron, expert system, hai mùa đông AI, đến deep learning và ImageNet. Mục tiêu là hình dung lộ trình lên–xuống, không phải thuộc toàn bộ mốc năm.",
      "reason": [
        "Chiếm nhiều thời lượng đầu buổi nhưng mang tính nền tảng/ngữ cảnh.",
        "Giảng viên nói rõ một số phần 'mang tính tương đối để hình dung'."
      ],
      "evidence": [
        {
          "segment_id": "T04-022",
          "quote": "AI không phải đi thẳng một phát lên đâu, mà nó đã trải qua hai lần mùa đông rồi."
        },
        {
          "segment_id": "T04-030",
          "quote": "Ý tưởng khiến cho máy móc có thể học được rất nhiều dữ liệu là tái tạo được mạng neuron thần kinh giống như con người — đấy là nền tảng của deep learning."
        }
      ]
    },
    {
      "concept_id": "c11",
      "name": "Gọi API LLM: input/output, system prompt, cộng dồn lịch sử",
      "tier": "supporting",
      "order_in_tier": 3,
      "estimated_minutes": 4,
      "short_summary": "Khái quát buổi chiều: trả tiền cả in và out; history được cộng vào mỗi lần gọi; system prompt là lớp quy tắc.",
      "summary": "Output thường đắt hơn input. Chat càng dài càng đắt vì history cộng dồn. Request gồm system prompt + user (+ context). Response cần đọc usage để biết tốn bao nhiêu token. Chi tiết sẽ thực hành lab ngày mai.",
      "reason": [
        "Giảng viên nói 'nói qua thôi, ngày mai thực hành' — mang tính chuẩn bị hơn là trọng tâm lý thuyết hôm nay.",
        "Vẫn hữu ích nếu còn thời gian ôn trước lab."
      ],
      "evidence": [
        {
          "segment_id": "T04-087",
          "quote": "Khi bạn gọi API của một mô hình LLM, luôn có đầu vào và đầu ra... bạn sẽ luôn mất tiền cho cả input và output, và output sẽ luôn đắt hơn input."
        },
        {
          "segment_id": "T04-088",
          "quote": "Càng gọi nhiều, bạn càng phải trả thêm tiền... toàn bộ lịch sử phía trước, mỗi lần bạn gọi, sẽ được cộng thêm vào."
        }
      ]
    }
  ]
}
```

### 6.3 Review Plan (kết quả filter — frontend tự tính)

| Mode | Concept IDs (thứ tự) | Tổng phút ước lượng |
|---|---|---|
| Tất cả | c01→c11 | ~46' |
| 15' | c01, c02, c03 | 15' |
| 30' | c01–c04, c05, c06 | 28' |
| 60' | c01–c11 | ~46' (hiển thị đủ map) |

---

## 7. Future Vision (không đưa vào MVP)

```text
Recording buổi học
  → Speech-to-Text + timestamp
  → LectureFocus (phân tích transcript)
  → Review Map
  → Click concept → nghe lại đúng đoạn giảng viên đang nói
  → (tuỳ chọn) CTA sâu hơn sang AI Tutor
```

**Roadmap xa hơn (sau vision trên):**

- Quiz generation / kiểm tra hiểu bài
- Adaptive learning theo tiến độ từng học viên

Transcript trong hackathon chỉ đóng vai trò **dữ liệu phía sau / mock nguồn**. Học viên MVP không upload file, không nghe audio.

---

## 8. Gợi ý demo 5 phút (UI mock)

1. Mở Lesson Day 1 → bấm **Xem Review Map**.
2. Chỉ Core Focus (4 card) → giải thích: đây là ưu tiên ôn, có evidence từ bài giảng.
3. Chọn **15'** → map rút còn 3 concept → nói rõ đây là plan, không phải AI đoán đề thi.
4. Mở concept “LLM dự đoán token…” → show summary + reason + `[T04-047]` / `[T04-091]`.
5. Bấm CTA Tutor → hiện placeholder (thể hiện non-goal rõ ràng).

---

## 9. Việc cố ý chưa làm trong file này

Để giữ đúng yêu cầu “khóa product trước khi code”:

- Chưa viết backend / API / schema DB
- Chưa chọn framework UI
- Chưa viết prompt sản xuất Review Map
- Chưa dựng golden set / quality bar (làm ở `spec.md` §7 sau)
- Chưa khảo sát ≥20 người (có thể bổ sung đường evidence A song song)

Khi UI flow đã chốt, bước tiếp theo hợp lý: dựng 3 màn bằng mock JSON ở §6, rồi mới quay lại hoàn thiện `spec.md` hackathon.
