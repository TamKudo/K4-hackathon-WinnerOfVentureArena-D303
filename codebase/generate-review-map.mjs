// Lời gọi AI thật ở quyết định trung tâm của LectureFocus: đọc transcript bài giảng,
// gọi một LLM qua Groq để sinh Review Map (khái niệm + tier + lý do + trích dẫn).
// Không hardcode: toàn bộ concepts/tier/reasons trong output là do model sinh ra tại lúc chạy.
//
// LƯỢT 3 — sửa theo phân tích nguyên nhân của lượt 2 (xem eval/run-2-results.md):
//   Lượt 1 và 2 dùng 1 lời gọi AI duy nhất để vừa GỘP trùng lặp vừa CHỐT TIER vừa GIỮ NGUYÊN
//   toàn bộ khái niệm khác — model free-tier không đủ tin cậy làm cả 3 việc cùng lúc, tự ý
//   bỏ sót ~15/26 khái niệm nháp hợp lệ dù prompt đã yêu cầu rõ "không được xoá".
//   Lượt 3 tách 3 việc đó ra:
//     Vòng 1 (extract, AI thật)      — không đổi: chia lô theo heading, rút khái niệm nháp.
//     Vòng 2a (assign tier, AI thật) — CHỈ quyết định tier + uncertain_signal cho từng candidate
//                                      theo đúng index, không được đổi/gộp/xoá nội dung nào.
//                                      Script validate cứng: output phải đủ N phần tử, N = số
//                                      candidate, mỗi index xuất hiện đúng 1 lần — sai thì tự
//                                      động thử lại (tối đa 3 lần) trước khi báo lỗi dừng hẳn.
//     Vòng 2b (gộp trùng lặp, CODE — không AI) — gộp 2 candidate CHỈ KHI tên gần giống NHAU
//                                      VÀ có chung ít nhất 1 segmentId trong evidence (điều
//                                      kiện kép, bảo thủ, tránh gộp nhầm 2 khái niệm khác nhau).
//                                      Candidate không khớp ai thì giữ nguyên — không có đường
//                                      nào dẫn tới việc bị xoá.
//     Vòng 2c (dựng schema cuối, CODE — không AI) — thuần đổi định dạng, không cần AI.
//   Nhờ vậy chỉ còn đúng 1 việc thật sự cần AI phán đoán ở vòng gộp (chốt tier), và việc đó
//   được ép buộc bằng validation để không thể âm thầm mất dữ liệu.
//
// Free tier Groq giới hạn TPM khá thấp (6.000-12.000 token/phút) trong khi cả transcript
// đã ~20.000 token, nên vẫn cần nhiều lời gọi AI thật thay vì 1 lệnh gọi API to duy nhất.
// Cả vòng 1 và vòng 2a đều là lời gọi AI thật (không hardcode), có log/trace đầy đủ trong
// eval/run-<N>/trace.json.
//
// Cách chạy:
//   set GROQ_API_KEY=gsk_...          (PowerShell: $env:GROQ_API_KEY = "gsk_...")
//   node codebase/generate-review-map.mjs
//
// Biến môi trường tuỳ chọn:
//   GROQ_MODEL         mặc định "llama-3.3-70b-versatile"
//   CHUNK_SIZE         số đoạn tối đa mỗi lô ở vòng 1 (gộp nhiều heading liền kề tới khi chạm mốc này), mặc định 18
//   MAX_CORE           gợi ý mềm: số khái niệm tier "core" mong muốn, mặc định 5 (AI có thể vượt nếu thấy cần)
//   TRANSCRIPT_PATH    mặc định data/vlearn-pack/transcript/transcript-04-clean.md
//   OUT_DIR            mặc định eval/run-3
//   REUSE_CANDIDATES   đường dẫn tới một candidates.json cũ — bỏ qua vòng 1, dùng lại candidate đã có
//                       (hữu ích khi chỉ cần sửa vòng gán tier/gộp, không cần tốn thêm lời gọi AI cho vòng 1)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  console.error("Thiếu GROQ_API_KEY trong biến môi trường. Set key rồi chạy lại.");
  process.exit(1);
}

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 18);
const MAX_CORE = Number(process.env.MAX_CORE || 5);
const TRANSCRIPT_PATH = process.env.TRANSCRIPT_PATH || join(ROOT, "data/vlearn-pack/transcript/transcript-04-clean.md");
const OUT_DIR = process.env.OUT_DIR || join(ROOT, "eval/run-3");

// Chia transcript thành các "section" theo heading "## ", giữ nguyên đoạn nào thuộc heading nào.
function parseSections(mdText) {
  const lines = mdText.split(/\r?\n/);
  const sections = [];
  let current = { title: "(mở đầu)", segments: [] };
  const segRe = /\*\*\[(T\d+-\d+)\]\*\*\s*(.+)/;
  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      if (current.segments.length) sections.push(current);
      current = { title: headingMatch[1].trim(), segments: [] };
      continue;
    }
    const segMatch = line.match(segRe);
    if (segMatch) current.segments.push({ id: segMatch[1], text: segMatch[2].trim() });
  }
  if (current.segments.length) sections.push(current);
  return sections;
}

// Gộp các section liền kề thành lô, không bao giờ xé một section làm đôi.
function buildChunksBySection(sections, maxSize) {
  const chunks = [];
  let cur = [];
  let curCount = 0;
  for (const sec of sections) {
    if (curCount > 0 && curCount + sec.segments.length > maxSize) {
      chunks.push(cur);
      cur = [];
      curCount = 0;
    }
    cur.push(sec);
    curCount += sec.segments.length;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

const SHARED_RULES = `QUY TẮC BẮT BUỘC:
1. Mọi trích dẫn (evidence) phải trỏ về đúng một segmentId có thật trong input được cấp cho bạn ở lượt này, và "quote" phải là một chuỗi con chép NGUYÊN VẸN (kể cả hoa/thường, dấu câu) từ đúng đoạn text của segmentId đó — không paraphrase, không bịa quote, không tự viết hoa chữ đầu khi quote bắt đầu giữa câu.
2. Không tạo khái niệm nào không có căn cứ trực tiếp trong transcript. Không suy diễn nội dung ngoài những gì giảng viên thực sự nói.
3. Nếu một đoạn bị đánh dấu [không nghe rõ], hoặc giảng viên tự nhận xét đoạn đó không chắc chắn, hoặc nội dung mâu thuẫn với đoạn khác: hạ tier xuống hoặc gắn "uncertain_signal": true thay vì đoán liều lên core/important.
   Ví dụ cụ thể: câu "cái này chỉ mang tính tương đối để các bạn hình dung được thôi nhá — nó không thực sự chính xác" là một câu hedge rõ ràng. Nếu evidence chính của một khái niệm chính là câu hedge này (không phải một câu factual khác trong cùng đoạn), khái niệm đó PHẢI có "uncertain_signal": true và tier tối đa là "supporting".
4. Không biến các đoạn [Hoạt động lớp: ...] (ghi chú hoạt động lớp, không phải lời giảng) thành một khái niệm học thuật.
5. Tuyệt đối không tạo quiz, không dự đoán "phần nào sẽ thi", không đưa ra nhận định học viên đã hiểu hay chưa hiểu phần nào.
6. Ưu tiên tier cao hơn cho khái niệm được giảng viên nhấn mạnh rõ ràng, lặp lại nhiều lần, hoặc xuất hiện lại trong phần tóm tắt cuối buổi.`;

const EXTRACT_SYSTEM_PROMPT = `Bạn đang giúp xây "Review Map" cho sản phẩm LectureFocus — bản đồ ưu tiên ôn tập dựng từ transcript bài giảng. Nhiệm vụ: bạn chỉ nhận được MỘT LÔ NHỎ các đoạn transcript (không phải toàn bộ buổi học), rút ra các khái niệm NHÁP xuất hiện trong đúng lô này.

${SHARED_RULES}

Nếu lô này không có nội dung kiến thức đáng ôn (toàn là chào hỏi, hoạt động lớp, giao lưu phiếm), trả về "candidates": [].
Nếu lô có nhiều ý kỹ thuật đậm đặc (vd. định nghĩa liên tiếp nhiều thuật ngữ), hãy tách thành nhiều candidate riêng thay vì gộp chung — đừng bỏ sót ý nào chỉ vì lô dài.

Trả lời DUY NHẤT một JSON object, không kèm markdown code fence, không giải thích thêm:
{
  "candidates": [
    {
      "name": "tên khái niệm nháp",
      "tier_suggestion": "core" | "important" | "supporting",
      "uncertain_signal": boolean,
      "short_summary": "1 câu",
      "evidence": [
        { "segmentId": "Txx-NNN", "quote": "chuỗi con nguyên văn" }
      ],
      "reason": "vì sao gợi ý tier này, dựa evidence nào"
    }
  ]
}`;

function buildTierSystemPrompt() {
  return `Bạn đang hoàn thiện "Review Map" cho LectureFocus. Nhiệm vụ DUY NHẤT của bạn ở bước này: quyết định tier cuối cùng cho từng khái niệm nháp đã cho. Việc gộp trùng lặp và dựng dữ liệu cuối do một bước khác (không phải AI) xử lý — bạn KHÔNG được đổi tên, nội dung, evidence, KHÔNG được gộp hay bỏ bất kỳ khái niệm nào.

Với mỗi khái niệm (có sẵn "index"), quyết định:
- "tier": "core" | "important" | "supporting"
- "uncertain_signal": boolean

${SHARED_RULES}

Gợi ý thêm:
- Buổi học chỉ nên có khoảng ${MAX_CORE} khái niệm "core" — những khái niệm phải ôn kỹ nhất, được giảng viên nhấn mạnh rõ ràng nhất hoặc lặp lại ở phần tóm tắt cuối buổi. Đây là gợi ý mềm, không bắt buộc tuyệt đối nếu có nhiều khái niệm thực sự xứng đáng hơn con số này.
- Khái niệm mang tính định nghĩa/liệt kê mở đầu (vd. định nghĩa phạm vi thuật ngữ) không tự động core chỉ vì xuất hiện sớm.

Trả lời DUY NHẤT một JSON object, không kèm markdown code fence, không giải thích thêm:
{ "tiers": [ { "index": 0, "tier": "core", "uncertain_signal": false } ] }`;
}

function buildTierUserPrompt(candidates, retryNote) {
  const list = candidates.map((c, i) => ({
    index: i,
    name: c.name,
    tier_suggestion: c.tier_suggestion,
    uncertain_signal: c.uncertain_signal,
    short_summary: c.short_summary,
    reason: c.reason,
    evidence: c.evidence,
  }));
  const header = retryNote ? retryNote + "\n\n" : "";
  return `${header}Danh sách ${candidates.length} khái niệm nháp cần gán tier. BẮT BUỘC trả về đúng ${candidates.length} phần tử trong "tiers", mỗi "index" từ 0 đến ${candidates.length - 1} xuất hiện đúng 1 lần — không thiếu, không thừa, không trùng:\n\n${JSON.stringify(list, null, 2)}`;
}

function extractJson(content) {
  try {
    return { parsed: JSON.parse(content), parseError: null };
  } catch (e) {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return { parsed: JSON.parse(match[0]), parseError: null };
      } catch (e2) {
        return { parsed: null, parseError: String(e2) };
      }
    }
    return { parsed: null, parseError: String(e) };
  }
}

async function callGroq(messages, callLabel, traceLog) {
  const requestBody = { model: MODEL, messages, response_format: { type: "json_object" }, temperature: 0.2 };
  const maxRetries = 8;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startedAt = new Date().toISOString();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const raw = await res.json();

    if (res.status === 429 || raw?.error?.code === "rate_limit_exceeded") {
      const waitMs = 15000 + attempt * 8000; // backoff tăng dần: 23s, 31s, 39s... tới ~1 phút
      console.log(`[${callLabel}] bị rate limit (lần ${attempt}/${maxRetries}), chờ ${Math.round(waitMs / 1000)}s rồi thử lại...`);
      traceLog.push({ callLabel, attempt, startedAt, status: res.status, rateLimited: true, raw });
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    if (!res.ok) {
      traceLog.push({ callLabel, attempt, startedAt, status: res.status, raw });
      throw new Error(`[${callLabel}] Groq trả lỗi: ${JSON.stringify(raw)}`);
    }

    const content = raw.choices?.[0]?.message?.content ?? "";
    const { parsed, parseError } = extractJson(content);
    traceLog.push({ callLabel, attempt, startedAt, status: res.status, usage: raw.usage, parseError });
    return { parsed, parseError, rawContent: content };
  }
  throw new Error(`[${callLabel}] Vẫn bị rate limit sau ${maxRetries} lần thử.`);
}

// Vòng 2a — AI thật chỉ gán tier, có validate cứng + tự thử lại nếu model bỏ sót/lặp index.
async function assignTiers(candidates, traceLog) {
  const maxAttempts = 3;
  let retryNote = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { parsed, parseError } = await callGroq(
      [
        { role: "system", content: buildTierSystemPrompt() },
        { role: "user", content: buildTierUserPrompt(candidates, retryNote) },
      ],
      `assign-tiers-attempt-${attempt}`,
      traceLog
    );
    if (parseError) {
      console.log(`  cảnh báo: gán tier lần ${attempt} parse JSON lỗi (${parseError}) — thử lại.`);
      retryNote = `LẦN TRƯỚC JSON KHÔNG HỢP LỆ (${parseError}). Hãy trả đúng định dạng JSON yêu cầu, không kèm text nào khác.`;
      continue;
    }
    const tiers = parsed?.tiers ?? [];
    const seen = new Set();
    let valid = tiers.length === candidates.length;
    if (valid) {
      for (const t of tiers) {
        if (typeof t.index !== "number" || t.index < 0 || t.index >= candidates.length || seen.has(t.index)) {
          valid = false;
          break;
        }
        seen.add(t.index);
      }
    }
    if (valid) {
      console.log(`  gán tier hợp lệ: đủ ${tiers.length}/${candidates.length} khái niệm, không thiếu/lặp index.`);
      return tiers;
    }
    console.log(`  cảnh báo: gán tier lần ${attempt} KHÔNG hợp lệ (nhận ${tiers.length}/${candidates.length} phần tử, hoặc index lặp/thiếu) — thử lại.`);
    retryNote = `LẦN TRƯỚC BẠN TRẢ ${tiers.length}/${candidates.length} PHẦN TỬ, HOẶC INDEX BỊ LẶP/THIẾU. Lần này BẮT BUỘC trả đúng ${candidates.length} phần tử, mỗi index 0..${candidates.length - 1} xuất hiện đúng 1 lần, không thiếu không thừa, không trùng.`;
  }
  throw new Error(`Không lấy được tier hợp lệ cho ${candidates.length} khái niệm sau ${maxAttempts} lần thử — dừng thay vì âm thầm dùng dữ liệu thiếu.`);
}

// Vòng 2b — gộp trùng lặp bằng code xác định (không AI): chỉ gộp khi tên gần giống NHAU
// VÀ có chung ít nhất 1 segmentId trong evidence. Candidate không khớp ai thì giữ nguyên riêng.
function normalizeName(name) {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function namesLikelyMatch(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

function evidenceSegmentIds(candidate) {
  return new Set((candidate.evidence || []).map((e) => e.segmentId).filter(Boolean));
}

function shareSegment(setA, setB) {
  for (const id of setA) if (setB.has(id)) return true;
  return false;
}

const TIER_RANK = { core: 0, important: 1, supporting: 2 };

function mergeCandidates(taggedCandidates) {
  const groups = [];
  for (const cand of taggedCandidates) {
    const segIds = evidenceSegmentIds(cand);
    let target = null;
    for (const g of groups) {
      const matchesAny = g.members.some((m) => namesLikelyMatch(m.name, cand.name) && shareSegment(evidenceSegmentIds(m), segIds));
      if (matchesAny) {
        target = g;
        break;
      }
    }
    if (target) target.members.push(cand);
    else groups.push({ members: [cand] });
  }
  return groups;
}

// Vòng 2c — dựng schema cuối bằng code xác định (không AI, thuần đổi định dạng dữ liệu đã có).
function slugify(name, index) {
  const base = normalizeName(name).replace(/\s+/g, "_");
  return base ? `${base}_${index}` : `concept_${index}`;
}

function buildFinalConcepts(groups) {
  return groups.map((g, i) => {
    const members = g.members;
    const best = members.reduce((a, b) => (TIER_RANK[a.tier] <= TIER_RANK[b.tier] ? a : b));
    const tier = best.tier;
    const uncertain_signal = members.some((m) => m.uncertain_signal);
    const name = members[0].name;
    const short_summary = members[0].short_summary;
    const learningPoints = [];
    const reasons = [];
    for (const m of members) {
      for (const ev of m.evidence || []) {
        learningPoints.push({ text: m.short_summary, evidence: ev });
        reasons.push({ text: m.reason || m.short_summary, evidence: ev });
      }
    }
    const fallbackEvidence = (members[0].evidence || [])[0];
    return {
      id: slugify(name, i),
      name,
      tier,
      short_summary,
      uncertain_signal,
      mergedFrom: members.length > 1 ? members.map((m) => m.name) : undefined,
      learningPoints: learningPoints.length ? learningPoints : [{ text: short_summary, evidence: fallbackEvidence }],
      reasons: reasons.length ? reasons : [{ text: short_summary, evidence: fallbackEvidence }],
    };
  });
}

async function main() {
  const mdText = readFileSync(TRANSCRIPT_PATH, "utf-8");
  const sections = parseSections(mdText);
  const segments = sections.flatMap((s) => s.segments);
  if (segments.length === 0) throw new Error("Không parse được segment nào từ transcript — kiểm tra TRANSCRIPT_PATH.");
  const segmentMap = new Map(segments.map((s) => [s.id, s.text]));

  const traceLog = [];
  const chunks = buildChunksBySection(sections, CHUNK_SIZE);

  const reusePath = process.env.REUSE_CANDIDATES;
  let allCandidates;
  if (reusePath) {
    allCandidates = JSON.parse(readFileSync(reusePath, "utf-8"));
    console.log(`Bỏ qua vòng 1 — dùng lại ${allCandidates.length} khái niệm nháp từ ${reusePath}`);
  } else {
    console.log(`Transcript: ${segments.length} đoạn trong ${sections.length} heading, chia ${chunks.length} lô (mỗi lô ≤${CHUNK_SIZE} đoạn, không xé heading).`);
    allCandidates = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkSections = chunks[i];
      const chunkText = chunkSections
        .map((sec) => `### ${sec.title}\n` + sec.segments.map((s) => `[${s.id}] ${s.text}`).join("\n\n"))
        .join("\n\n");
      const segCount = chunkSections.reduce((n, s) => n + s.segments.length, 0);
      console.log(`Vòng 1 — gọi AI cho lô ${i + 1}/${chunks.length} (${segCount} đoạn, heading: ${chunkSections.map((s) => s.title).join(" · ")})...`);
      try {
        const { parsed, parseError } = await callGroq(
          [
            { role: "system", content: EXTRACT_SYSTEM_PROMPT },
            { role: "user", content: `Lô ${i + 1}/${chunks.length} của transcript Day 1 — Foundation:\n\n${chunkText}` },
          ],
          `extract-chunk-${i + 1}`,
          traceLog
        );
        if (parseError) {
          console.log(`  cảnh báo: lô ${i + 1} parse JSON lỗi (${parseError}), bỏ qua lô này.`);
        } else {
          const candidates = parsed?.candidates ?? [];
          console.log(`  -> ${candidates.length} khái niệm nháp.`);
          allCandidates.push(...candidates.map((c) => ({ ...c, sourceChunk: i + 1 })));
        }
      } catch (e) {
        // Không để 1 lô lỗi (vd. hết rate limit sau nhiều lần thử) làm mất toàn bộ candidate
        // đã thu được từ các lô trước — log cảnh báo và đi tiếp, ghi nhận thiếu sót trung thực
        // trong trace thay vì crash cả lượt chạy.
        console.log(`  cảnh báo: lô ${i + 1} lỗi (${e.message}), bỏ qua lô này và đi tiếp.`);
        traceLog.push({ callLabel: `extract-chunk-${i + 1}`, fatalError: e.message });
      }
      if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, 8000));
    }
  }

  console.log(`Vòng 2a — gán tier cho ${allCandidates.length} khái niệm nháp (AI thật, có validate)...`);
  const tiers = await assignTiers(allCandidates, traceLog);
  const tierByIndex = new Map(tiers.map((t) => [t.index, t]));
  const taggedCandidates = allCandidates.map((c, i) => {
    const t = tierByIndex.get(i);
    return { ...c, tier: t.tier, uncertain_signal: t.uncertain_signal };
  });

  console.log(`Vòng 2b — gộp trùng lặp bằng code (bảo thủ: tên gần giống + chung segmentId)...`);
  const groups = mergeCandidates(taggedCandidates);
  console.log(`  -> ${allCandidates.length} candidate gộp còn ${groups.length} khái niệm (không candidate nào bị xoá).`);

  console.log(`Vòng 2c — dựng schema cuối bằng code...`);
  const finalConcepts = buildFinalConcepts(groups);
  const finalParsed = { concepts: finalConcepts };

  // Kiểm tra tự động lớp "nguồn sự thật": mọi citation phải trỏ đúng segment có thật.
  // So khớp KHÔNG phân biệt hoa/thường (lệch hoa/thường không tính là fabrication),
  // nhưng vẫn ghi lại cả kết quả so khớp nghiêm ngặt (case-sensitive) để minh bạch.
  const citationChecks = [];
  const schemaIssues = [];
  for (const c of finalConcepts) {
    if (!(c.learningPoints || []).length) schemaIssues.push({ conceptId: c.id, issue: "learningPoints rỗng hoặc thiếu" });
    if (!(c.reasons || []).length) schemaIssues.push({ conceptId: c.id, issue: "reasons rỗng hoặc thiếu" });

    const allEvidence = [
      ...(c.learningPoints || []).map((lp, i) => ({ from: "learningPoints", i, evidence: lp.evidence })),
      ...(c.reasons || []).map((r, i) => ({ from: "reasons", i, evidence: r.evidence })),
    ];
    for (const { from, i, evidence } of allEvidence) {
      const segId = evidence?.segmentId;
      const quote = evidence?.quote;
      const segText = segmentMap.get(segId);
      const segmentExists = Boolean(segText);
      const quoteExact = segmentExists && typeof quote === "string" && segText.includes(quote.trim());
      const quoteVerified = segmentExists && typeof quote === "string" && segText.toLowerCase().includes(quote.trim().toLowerCase());
      citationChecks.push({
        conceptId: c.id,
        conceptName: c.name,
        from,
        index: i,
        segmentId: segId,
        segmentExists,
        quoteVerified,
        quoteExact,
      });
    }
  }
  const coreCount = finalConcepts.filter((c) => c.tier === "core").length;
  const totalCitations = citationChecks.length;
  const verifiedCitations = citationChecks.filter((c) => c.quoteVerified).length;
  const exactCitations = citationChecks.filter((c) => c.quoteExact).length;

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "candidates.json"), JSON.stringify(allCandidates, null, 2), "utf-8");
  writeFileSync(join(OUT_DIR, "tagged-candidates.json"), JSON.stringify(taggedCandidates, null, 2), "utf-8");
  writeFileSync(join(OUT_DIR, "ai-output.json"), JSON.stringify(finalParsed, null, 2), "utf-8");
  writeFileSync(
    join(OUT_DIR, "citation-check.json"),
    JSON.stringify(
      {
        totalCitations,
        verifiedCitations,
        exactCitations,
        coreCount,
        schemaIssues,
        unverified: citationChecks.filter((c) => !c.quoteVerified),
        caseMismatchOnly: citationChecks.filter((c) => c.quoteVerified && !c.quoteExact),
        all: citationChecks,
      },
      null,
      2
    ),
    "utf-8"
  );
  writeFileSync(
    join(OUT_DIR, "trace.json"),
    JSON.stringify(
      {
        model: MODEL,
        transcriptPath: TRANSCRIPT_PATH,
        segmentCount: segments.length,
        sectionCount: sections.length,
        chunkSize: CHUNK_SIZE,
        chunkCount: chunks.length,
        maxCore: MAX_CORE,
        reusedCandidatesFrom: reusePath || null,
        candidateCount: allCandidates.length,
        groupCount: groups.length,
        extractSystemPrompt: EXTRACT_SYSTEM_PROMPT,
        tierSystemPrompt: buildTierSystemPrompt(),
        calls: traceLog,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\nXong. Model: ${MODEL}`);
  console.log(`Concepts cuối cùng: ${finalConcepts.length} (core: ${coreCount}, gợi ý mềm ~${MAX_CORE})`);
  console.log(`Citation verified (không phân biệt hoa/thường): ${verifiedCitations}/${totalCitations} · khớp nguyên văn tuyệt đối: ${exactCitations}/${totalCitations}`);
  console.log(`Schema issues: ${schemaIssues.length}`);
  console.log(`Output: ${OUT_DIR}/{candidates,tagged-candidates,ai-output,citation-check,trace}.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
