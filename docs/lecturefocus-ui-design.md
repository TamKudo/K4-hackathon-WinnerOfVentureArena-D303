# LectureFocus — UI Prototype Design

> Clickable frontend bằng mock data. Không backend, không AI thật, không chatbot thật.  
> Mục tiêu 30 giây: *“Tôi biết mình cần ôn gì trước — mà không cần biết trước mình phải hỏi AI điều gì.”*

---

## 1. Information Architecture (3 màn)

```
Lesson
  └─ Review Map          ← màn chính (knowledge-first)
        ├─ filter thời gian → Review Plan (cùng màn, đổi danh sách)
        └─ Concept Detail
              └─ Mock Tutor panel (phụ)
```

| Màn | Việc duy nhất | Dữ liệu hiện |
|---|---|---|
| **Lesson** | Chọn bài đã học, vào ôn | Tên bài, số concept theo tier, CTA |
| **Review Map** | Thấy kiến thức gì + ưu tiên gì trước | Danh sách concept theo 3 tier; hoặc plan theo 15/30/60' |
| **Concept Detail** | Hiểu một concept + vì sao ưu tiên | Tóm tắt, lý do, bằng chứng transcript; CTA Tutor (mock) |

Nguyên tắc Knowledge-first: Map là trung tâm. Tutor chỉ xuất hiện sau khi đã chọn concept — không có ô chat trống ở đầu flow.

---

## 2. Wireframe dạng text

### Screen 1 — Lesson

```
┌─────────────────────────────────────────────┐
│  LectureFocus                               │
├─────────────────────────────────────────────┤
│                                             │
│  Day 1 — Foundation                         │
│  Cách LLM hoạt động                         │
│                                             │
│  8 khái niệm  ·  Core 3  ·  Important 3  ·  Supporting 2 │
│                                             │
│  Bản đồ ưu tiên ôn theo nội dung bài giảng  │
│  — không phải dự đoán đề thi                │
│                                             │
│         [ Review this lesson ]              │
│                                             │
└─────────────────────────────────────────────┘
```

### Screen 2 — Review Map

```
┌─────────────────────────────────────────────┐
│  ← Day 1 — Foundation                       │
│  Review Map                                 │
│                                             │
│  Quỹ thời gian:                             │
│  ( Tất cả )  ( 15' )  ( 30' )  ( 60' )      │
│                                             │
│  ── Khi chọn "Tất cả" ────────────────────  │
│                                             │
│  CORE FOCUS                                 │
│  ┌─────────────────────────────────────┐    │
│  │ LLM dự đoán token tiếp theo         │    │
│  │ LLM dự đoán token theo xác suất…    │    │
│  │                    [ Xem chi tiết ] │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ Attention trong Transformer         │    │
│  │ …                   [ Xem chi tiết ]│    │
│  └─────────────────────────────────────┘    │
│  …                                          │
│                                             │
│  IMPORTANT                                  │
│  ┌─────────────────────────────────────┐    │
│  │ …                   [ Xem chi tiết ]│    │
│  └─────────────────────────────────────┘    │
│                                             │
│  SUPPORTING                                 │
│  ┌─────────────────────────────────────┐    │
│  │ …                   [ Xem chi tiết ]│    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ── Khi chọn "15'" / "30'" / "60'" ───────  │
│  Header đổi thành: Kế hoạch ôn · 15 phút    │
│  Danh sách phẳng theo thứ tự ưu tiên        │
│  (Core trước → Important → Supporting)      │
│  Chỉ hiện subset vừa quỹ thời gian          │
└─────────────────────────────────────────────┘
```

### Screen 3 — Concept Detail

```
┌─────────────────────────────────────────────┐
│  ← Review Map                               │
│                                             │
│  LLM dự đoán token tiếp theo                │
│  [ Core Focus ]                             │
│                                             │
│  Cần nhớ                                    │
│  LLM không "biết" tri thức theo nghĩa       │
│  tra cứu — nó dự đoán token tiếp theo…      │
│                                             │
│  Tại sao nên tập trung?                     │
│  • Giảng viên dành cả mục mổ xẻ mô hình…    │
│  • Được nhắc trong tóm tắt cuối buổi        │
│  • Xuất hiện trong quiz ôn cuối buổi        │
│                                             │
│  Từ bài giảng                               │
│  ┌─────────────────────────────────────┐    │
│  │ [T04-047]                            │    │
│  │ "Bản chất của các mô hình ngôn ngữ   │    │
│  │  lớn này, đấy là nó dự đoán…"        │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ [T04-091]  …                         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ─ chỗ mở rộng sau (không build) ─          │
│  Trong tài liệu: Slide — (sắp có)           │
│  Trong bài giảng: timestamp — (sắp có)      │
│                                             │
│  [ Hỏi AI Tutor về phần này ]               │
└─────────────────────────────────────────────┘

── Mock Tutor panel (overlay) ────────────────
┌─────────────────────────────────────────────┐
│  AI Tutor · LLM dự đoán token…        [✕]   │
│  ─────────────────────────────────────────  │
│  Sắp kết nối. Hiện tại bạn có thể ôn từ     │
│  phần "Cần nhớ" và trích dẫn phía trên.     │
│                                             │
│  [ Đóng ]                                   │
└─────────────────────────────────────────────┘
```

---

## 3. Interaction có thể click

| Vị trí | Click | Kết quả |
|---|---|---|
| Lesson · `Review this lesson` | → | Sang Review Map, mode `Tất cả` |
| Map · `←` (tên bài) | → | Về Lesson |
| Map · `Tất cả` / `15'` / `30'` / `60'` | → | Đổi danh sách trên cùng màn (không đổi route nếu không cần) |
| Map · `Xem chi tiết` (hoặc cả card) | → | Sang Concept Detail của concept đó |
| Detail · `← Review Map` | → | Về Map, **giữ** filter thời gian đang chọn |
| Detail · `Hỏi AI Tutor về phần này` | → | Mở mock panel/modal |
| Tutor panel · `✕` / `Đóng` | → | Đóng panel, vẫn ở Detail |

Không click: upload, slide, audio, quiz, đăng nhập.

**Rule filter thời gian (deterministic):**  
Sắp Core → Important → Supporting; cộng dồn `estimated_minutes`; giữ concept đến khi tổng ≤ quỹ đã chọn. Không gọi AI.

| Mode | Concept hiện (mock) | Tổng ước lượng |
|---|---|---|
| Tất cả | cả 8 | ~36' |
| 15' | c01, c02, c03 | 15' |
| 30' | c01–c05 | 28' |
| 60' | cả 8 | ~36' |

---

## 4. Mock data (1 lesson · 8 concepts)

Nguồn: `transcript-04-clean.md` (Day 1 Foundation). Tier = mức ưu tiên ôn theo tín hiệu trong bài giảng — không phải “sẽ thi”.

```json
{
  "lesson": {
    "id": "day01-foundation",
    "title": "Day 1 — Foundation",
    "subtitle": "Cách LLM hoạt động",
    "disclaimer": "Bản đồ ưu tiên ôn theo nội dung bài giảng — không phải dự đoán đề thi",
    "counts": { "total": 8, "core": 3, "important": 3, "supporting": 2 }
  },
  "concepts": [
    {
      "id": "c01",
      "name": "LLM dự đoán token tiếp theo",
      "tier": "core",
      "order": 1,
      "estimated_minutes": 5,
      "short_summary": "LLM dự đoán token theo xác suất — văn bản trông có lý vẫn có thể sai.",
      "need_to_know": "Trái tim của ChatGPT/Claude/Gemini là vòng lặp dự đoán token: predict → append → rerun. Nó không tra cứu tri thức; hallucination xảy ra vì mô hình đang nối từ cho có nghĩa.",
      "reasons": [
        "Giảng viên dành cả mục mổ xẻ mô hình để giải thích cơ chế này",
        "Được nhắc lại trong tóm tắt cuối buổi như điểm cần nhớ đầu tiên",
        "Xuất hiện trong quiz ôn: vòng lặp predict → append → rerun"
      ],
      "lecture_evidence": [
        { "segment_id": "T04-047", "quote": "Bản chất của các mô hình ngôn ngữ lớn này, đấy là nó dự đoán… những từ tiếp theo, hoặc là những token." },
        { "segment_id": "T04-091", "quote": "Các mô hình ngôn ngữ lớn bây giờ hoạt động trên nền tảng Transformer và sinh các token tiếp theo." }
      ],
      "slide_evidence": null,
      "audio_evidence": null
    },
    {
      "id": "c02",
      "name": "Attention trong Transformer",
      "tier": "core",
      "order": 2,
      "estimated_minutes": 5,
      "short_summary": "Attention giúp mô hình nhìn cả câu và tập trung vào từ quan trọng, thay vì đọc từng chữ như RNN.",
      "need_to_know": "Khác RNN (đọc từng chữ, dễ quên đầu câu), Transformer dùng attention để đọc cả cụm và nhận diện mối liên hệ giữa các từ. Đây là ý của bài báo Attention Is All You Need (2017).",
      "reasons": [
        "Được giảng dài, có so sánh trực tiếp với RNN",
        "Học viên được mời giải thích lại để nhận điểm cộng",
        "Xuất hiện trong tóm tắt cuối buổi và quiz"
      ],
      "lecture_evidence": [
        { "segment_id": "T04-040", "quote": "Thay vì lần lượt đọc và dịch từng chữ một, nó sẽ đọc cả cụm đấy, và nhận diện được đâu là những keyword…" },
        { "segment_id": "T04-038", "quote": "Năm 2017 là bài báo rất nổi tiếng — Attention Is All You Need… kiến trúc transformer." }
      ],
      "slide_evidence": null,
      "audio_evidence": null
    },
    {
      "id": "c03",
      "name": "Token và context window",
      "tier": "core",
      "order": 3,
      "estimated_minutes": 5,
      "short_summary": "Token là đơn vị tính của LLM; context window là lượng thông tin mô hình tiêu thụ được trong một lần.",
      "need_to_know": "Token không phải từ hay ký tự — là ngôn ngữ của máy. Tiếng Việt thường tốn nhiều token hơn tiếng Anh. Context càng lớn không đồng nghĩa luôn tốt hơn (context rot).",
      "reasons": [
        "Được gọi là thuật ngữ quan trọng cần nắm",
        "Gắn trực tiếp với lab gọi API ngày hôm sau",
        "Được nhấn trong tóm tắt cuối buổi"
      ],
      "lecture_evidence": [
        { "segment_id": "T04-049", "quote": "Trong các mô hình ngôn ngữ lớn thì có một thuật ngữ quan trọng chúng ta cần nắm được, đấy là token." },
        { "segment_id": "T04-051", "quote": "Context… là toàn bộ những thông tin mà một mô hình nó có thể tiêu thụ trong một lần." }
      ],
      "slide_evidence": null,
      "audio_evidence": null
    },
    {
      "id": "c04",
      "name": "Quản lý context khi dùng AI",
      "tier": "important",
      "order": 1,
      "estimated_minutes": 5,
      "short_summary": "Không phải context càng lớn càng tốt — cần đưa đúng thông tin quan trọng cho mô hình.",
      "need_to_know": "Khi nhồi quá nhiều context, mô hình có thể chú ý sai chỗ. Quản lý context tốt giúp làm việc với AI hiệu quả hơn và tiết kiệm chi phí.",
      "reasons": [
        "Giảng viên gọi đây là bài học rất quan trọng khi vibe code / build với AI",
        "Nối trực tiếp từ attention sang thực hành hàng ngày"
      ],
      "lecture_evidence": [
        { "segment_id": "T04-053", "quote": "Việc quản lý cái cửa sổ ngữ cảnh này rất là quan trọng: chúng ta cần biết được là lúc nào nên đưa cái gì cho AI." }
      ],
      "slide_evidence": null,
      "audio_evidence": null
    },
    {
      "id": "c05",
      "name": "Temperature và top-k / top-p",
      "tier": "important",
      "order": 2,
      "estimated_minutes": 4,
      "short_summary": "Top-k/top-p khoanh vùng ứng viên token; temperature điều chỉnh độ ngẫu nhiên trong phạm vi đó.",
      "need_to_know": "Temperature = 0 gần như luôn lấy xác suất cao nhất. Tăng temperature = sáng tạo hơn trong phạm vi đã chọn bằng top-k hoặc top-p.",
      "reasons": [
        "Được giảng kèm công cụ tương tác trực quan",
        "Gắn với lab gọi API; xuất hiện trong quiz"
      ],
      "lecture_evidence": [
        { "segment_id": "T04-072", "quote": "Nếu temperature bằng 0, mô hình sẽ luôn luôn lấy xác suất cao nhất… top-k/top-p là để khoanh vùng…" }
      ],
      "slide_evidence": null,
      "audio_evidence": null
    },
    {
      "id": "c06",
      "name": "Evaluation khi build sản phẩm AI",
      "tier": "important",
      "order": 3,
      "estimated_minutes": 4,
      "short_summary": "Evaluation có thể quyết định phần lớn thành công khi đưa sản phẩm AI ra đời thật.",
      "need_to_know": "Cần bộ đánh giá lặp lại được. Không có evaluation, sản phẩm có thể demo được nhưng khó biết sai ở đâu khi ra thực tế.",
      "reasons": [
        "Giảng viên nhấn mạnh rất mạnh (quan trọng nhất, khoảng 80%)",
        "Xuất hiện trong tóm tắt cuối buổi"
      ],
      "lecture_evidence": [
        { "segment_id": "T04-075", "quote": "Quan trọng nhất… đấy là evaluation. Bạn làm tốt việc này thì nó quyết định đến 80% thành công sản phẩm của các bạn." }
      ],
      "slide_evidence": null,
      "audio_evidence": null
    },
    {
      "id": "c07",
      "name": "Bức tranh AI ⊃ ML ⊃ Deep Learning ⊃ GenAI",
      "tier": "supporting",
      "order": 1,
      "estimated_minutes": 3,
      "short_summary": "Khung thuật ngữ mở đầu: generative AI nằm trong các vòng rộng hơn của AI.",
      "need_to_know": "Giúp định vị ngôn ngữ chung trước khi đi sâu vào Transformer — tránh nhầm ChatGPT với toàn bộ AI.",
      "reasons": [
        "Xuất hiện sớm để định vị thuật ngữ",
        "Ít được nhắc lại ở phần tóm tắt kỹ thuật cuối buổi"
      ],
      "lecture_evidence": [
        { "segment_id": "T04-015", "quote": "Rộng nhất chúng ta có AI… machine learning… deep learning… tầng trong cùng là generative AI." }
      ],
      "slide_evidence": null,
      "audio_evidence": null
    },
    {
      "id": "c08",
      "name": "Lịch sử AI: mùa đông và deep learning",
      "tier": "supporting",
      "order": 2,
      "estimated_minutes": 4,
      "short_summary": "Bối cảnh vì sao cách tiếp cận cũ chạm trần và dữ liệu/deep learning trở thành bước ngoặt.",
      "need_to_know": "AI đã qua hai mùa đông. Mục tiêu buổi học là hình dung lộ trình lên–xuống, không phải thuộc toàn bộ mốc năm.",
      "reasons": [
        "Chiếm nhiều thời lượng đầu buổi nhưng mang tính nền tảng/ngữ cảnh",
        "Giảng viên nói một số phần mang tính tương đối để hình dung"
      ],
      "lecture_evidence": [
        { "segment_id": "T04-022", "quote": "AI không phải đi thẳng một phát lên đâu, mà nó đã trải qua hai lần mùa đông rồi." }
      ],
      "slide_evidence": null,
      "audio_evidence": null
    }
  ]
}
```

Hai field `slide_evidence` và `audio_evidence` để `null` — chỗ mở rộng sau, không render gì ở MVP trừ một dòng phụ mờ “Trong tài liệu / timestamp — sắp có” nếu muốn báo hiệu roadmap (tuỳ chọn, không bắt buộc).

---

## 5. User flow (30 giây hiểu sản phẩm)

1. Mở **Lesson** → thấy bài đã học + số Core/Important/Supporting → hiểu ngay: đây là ôn theo bản đồ kiến thức, không phải khung chat.
2. Bấm **Review this lesson** → vào **Review Map**, mặc định thấy đủ 3 tầng. Câu hỏi “bài có gì?” được trả lời ngay trên màn hình, không cần gõ gì.
3. (Tuỳ chọn) chọn **15'** → danh sách rút còn vài concept Core đầu. Câu hỏi “ôn gì trước trong thời gian mình có?” được trả lời bằng thứ tự list.
4. Bấm **Xem chi tiết** một Core → đọc **Cần nhớ** + **Tại sao** + **Từ bài giảng**. Câu hỏi “vì sao phần này quan trọng?” có bằng chứng, không chỉ là nhãn.
5. Nếu muốn đào sâu hơn → bấm **Hỏi AI Tutor** → panel mock báo chưa kết nối. Rõ ràng: Tutor là bước phụ sau khi đã chọn concept.

Một câu demo: *Không cần biết hỏi AI gì — mở map, chọn quỹ thời gian, ôn từ trên xuống.*

---

## 6. Cấu trúc component frontend tối thiểu

Đủ để dựng clickable prototype; không cần state phức tạp.

```
App
├── data/mockLesson.json          ← file §4
├── lib/reviewPlan.js             ← filter 15/30/60 deterministic
├── AppShell                      ← header "LectureFocus" (tuỳ chọn)
├── LessonScreen
│     └── ReviewLessonButton
├── ReviewMapScreen
│     ├── TimeBudgetToggle        ← Tất cả | 15 | 30 | 60
│     ├── TierSection             ← lặp cho core / important / supporting
│     │     └── ConceptCard       ← name, short_summary, tier, CTA
│     └── ReviewPlanList          ← dùng khi đã chọn phút (list phẳng)
├── ConceptDetailScreen
│     ├── TierBadge
│     ├── NeedToKnowBlock         ← "Cần nhớ"
│     ├── ReasonsBlock            ← "Tại sao nên tập trung?"
│     ├── LectureEvidenceBlock    ← "Từ bài giảng" + segment_id + quote
│     ├── FutureEvidenceSlots     ← optional placeholder slide/audio
│     └── AskTutorButton
└── TutorMockModal                ← overlay; đóng được
```

**State tối thiểu (có thể chỉ dùng React state / URL đơn giản):**

- `screen`: `lesson` | `map` | `detail`
- `selectedConceptId`: string | null
- `timeBudget`: `all` | `15` | `30` | `60`
- `tutorOpen`: boolean

**Không cần:** router phức tạp, auth, fetch API, global store, animation nặng.

Gợi ý triển khai nhanh: một trang React/Vite (hoặc HTML+JS thuần) trong `codebase/`, import JSON mock, đổi `screen` khi click. Ưu tiên chữ đọc được và thứ tự thông tin đúng wireframe hơn là trang trí.

---

## Checklist trước khi code

- [ ] Chỉ 3 màn + 1 modal Tutor
- [ ] Map là màn chính; không có ô chat ở Lesson
- [ ] Card chỉ: name · short summary · tier · Xem chi tiết
- [ ] 15/30/60 chỉ lọc mock, không gọi AI
- [ ] Evidence chỉ từ transcript; slide/audio để chỗ trống
- [ ] Không quiz, upload, audio, backend, auth
