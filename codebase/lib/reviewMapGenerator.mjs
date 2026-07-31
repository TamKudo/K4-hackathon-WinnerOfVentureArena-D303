// Logic dùng chung cho lời gọi AI thật ở quyết định trung tâm của LectureFocus:
// đọc transcript → gọi Groq 2 vòng (extract candidate, gán tier) → gộp trùng lặp + dựng
// schema cuối bằng code xác định (không AI). Xem lịch sử quyết định 3 lượt sửa prompt ở
// eval/run-1-results.md, eval/run-2-results.md.
//
// Dùng chung bởi:
//   - codebase/generate-review-map.mjs   (CLI, ghi kết quả ra eval/run-N/ cho golden set)
//   - codebase/webapp/server/index.js    (endpoint POST /api/generate, chạy live cho demo)
// Tách ra file riêng để không lặp lại ~300 dòng logic ở hai chỗ.

const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Chia transcript thành các "section" theo heading "## ", giữ nguyên đoạn nào thuộc heading nào.
export function parseSections(mdText) {
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
export function buildChunksBySection(sections, maxSize) {
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

function buildTierSystemPrompt(maxCore) {
  return `Bạn đang hoàn thiện "Review Map" cho LectureFocus. Nhiệm vụ DUY NHẤT của bạn ở bước này: quyết định tier cuối cùng cho từng khái niệm nháp đã cho. Việc gộp trùng lặp và dựng dữ liệu cuối do một bước khác (không phải AI) xử lý — bạn KHÔNG được đổi tên, nội dung, evidence, KHÔNG được gộp hay bỏ bất kỳ khái niệm nào.

Với mỗi khái niệm (có sẵn "index"), quyết định:
- "tier": "core" | "important" | "supporting"
- "uncertain_signal": boolean

${SHARED_RULES}

Gợi ý thêm:
- Buổi học chỉ nên có khoảng ${maxCore} khái niệm "core" — những khái niệm phải ôn kỹ nhất, được giảng viên nhấn mạnh rõ ràng nhất hoặc lặp lại ở phần tóm tắt cuối buổi. Đây là gợi ý mềm, không bắt buộc tuyệt đối nếu có nhiều khái niệm thực sự xứng đáng hơn con số này.
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

async function callGroq({ apiKey, model, messages, callLabel, traceLog, onProgress, maxRetries }) {
  const requestBody = { model, messages, response_format: { type: "json_object" }, temperature: 0.2 };
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startedAt = new Date().toISOString();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const raw = await res.json();

    if (res.status === 429 || raw?.error?.code === "rate_limit_exceeded") {
      const waitMs = 15000 + attempt * 8000; // backoff tăng dần: 23s, 31s, 39s... tới ~1 phút
      onProgress(`[${callLabel}] bị rate limit (lần ${attempt}/${maxRetries}), chờ ${Math.round(waitMs / 1000)}s rồi thử lại...`);
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
async function assignTiers(candidates, { apiKey, model, maxCore, traceLog, onProgress, maxRetries }) {
  const maxAttempts = 3;
  let retryNote = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { parsed, parseError } = await callGroq({
      apiKey,
      model,
      messages: [
        { role: "system", content: buildTierSystemPrompt(maxCore) },
        { role: "user", content: buildTierUserPrompt(candidates, retryNote) },
      ],
      callLabel: `assign-tiers-attempt-${attempt}`,
      traceLog,
      onProgress,
      maxRetries,
    });
    if (parseError) {
      onProgress(`  cảnh báo: gán tier lần ${attempt} parse JSON lỗi (${parseError}) — thử lại.`);
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
      onProgress(`  gán tier hợp lệ: đủ ${tiers.length}/${candidates.length} khái niệm, không thiếu/lặp index.`);
      return tiers;
    }
    onProgress(`  cảnh báo: gán tier lần ${attempt} KHÔNG hợp lệ (nhận ${tiers.length}/${candidates.length} phần tử, hoặc index lặp/thiếu) — thử lại.`);
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

// Kiểm tra tự động lớp "nguồn sự thật": mọi citation phải trỏ đúng segment có thật.
// So khớp KHÔNG phân biệt hoa/thường (lệch hoa/thường không tính là fabrication),
// nhưng vẫn ghi lại cả kết quả so khớp nghiêm ngặt (case-sensitive) để minh bạch.
function checkCitations(finalConcepts, segmentMap) {
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
      citationChecks.push({ conceptId: c.id, conceptName: c.name, from, index: i, segmentId: segId, segmentExists, quoteVerified, quoteExact });
    }
  }
  const totalCitations = citationChecks.length;
  const verifiedCitations = citationChecks.filter((c) => c.quoteVerified).length;
  const exactCitations = citationChecks.filter((c) => c.quoteExact).length;
  return {
    totalCitations,
    verifiedCitations,
    exactCitations,
    coreCount: finalConcepts.filter((c) => c.tier === "core").length,
    schemaIssues,
    unverified: citationChecks.filter((c) => !c.quoteVerified),
    caseMismatchOnly: citationChecks.filter((c) => c.quoteVerified && !c.quoteExact),
    all: citationChecks,
  };
}

// Hàm chính — dùng chung cho CLI (eval, ghi file) và server (live, trả JSON qua API).
export async function generateReviewMap({
  transcriptText,
  apiKey,
  model = "llama-3.3-70b-versatile",
  chunkSize = 18,
  maxCore = 5,
  reuseCandidates = null,
  maxRetries = 8,
  onProgress = () => {},
}) {
  if (!apiKey) throw new Error("Thiếu GROQ_API_KEY.");

  const sections = parseSections(transcriptText);
  const segments = sections.flatMap((s) => s.segments);
  if (segments.length === 0) throw new Error("Không parse được segment nào từ transcript — kiểm tra định dạng [Txx-NNN].");
  const segmentMap = new Map(segments.map((s) => [s.id, s.text]));

  const traceLog = [];
  const chunks = buildChunksBySection(sections, chunkSize);

  let allCandidates;
  if (reuseCandidates) {
    allCandidates = reuseCandidates;
    onProgress(`Bỏ qua vòng 1 — dùng lại ${allCandidates.length} khái niệm nháp có sẵn.`);
  } else {
    onProgress(`Transcript: ${segments.length} đoạn trong ${sections.length} heading, chia ${chunks.length} lô (mỗi lô ≤${chunkSize} đoạn, không xé heading).`);
    allCandidates = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkSections = chunks[i];
      const chunkText = chunkSections
        .map((sec) => `### ${sec.title}\n` + sec.segments.map((s) => `[${s.id}] ${s.text}`).join("\n\n"))
        .join("\n\n");
      const segCount = chunkSections.reduce((n, s) => n + s.segments.length, 0);
      onProgress(`Vòng 1 — gọi AI cho lô ${i + 1}/${chunks.length} (${segCount} đoạn, heading: ${chunkSections.map((s) => s.title).join(" · ")})...`);
      try {
        const { parsed, parseError } = await callGroq({
          apiKey,
          model,
          messages: [
            { role: "system", content: EXTRACT_SYSTEM_PROMPT },
            { role: "user", content: `Lô ${i + 1}/${chunks.length} của transcript:\n\n${chunkText}` },
          ],
          callLabel: `extract-chunk-${i + 1}`,
          traceLog,
          onProgress,
          maxRetries,
        });
        if (parseError) {
          onProgress(`  cảnh báo: lô ${i + 1} parse JSON lỗi (${parseError}), bỏ qua lô này.`);
        } else {
          const candidates = parsed?.candidates ?? [];
          onProgress(`  -> ${candidates.length} khái niệm nháp.`);
          allCandidates.push(...candidates.map((c) => ({ ...c, sourceChunk: i + 1 })));
        }
      } catch (e) {
        // Không để 1 lô lỗi (vd. hết rate limit sau nhiều lần thử) làm mất toàn bộ candidate
        // đã thu được từ các lô trước — log cảnh báo và đi tiếp, ghi nhận thiếu sót trung thực
        // trong trace thay vì crash cả lượt chạy.
        onProgress(`  cảnh báo: lô ${i + 1} lỗi (${e.message}), bỏ qua lô này và đi tiếp.`);
        traceLog.push({ callLabel: `extract-chunk-${i + 1}`, fatalError: e.message });
      }
      if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, 8000));
    }
  }

  if (allCandidates.length === 0) {
    // G10 — thu hẹp phạm vi khi nghi ngờ: không có candidate nào thì trả về rỗng, không bịa.
    return { concepts: [], segments, candidates: [], taggedCandidates: [], citationCheck: checkCitations([], segmentMap), trace: { model, chunkCount: chunks.length, calls: traceLog } };
  }

  onProgress(`Vòng 2a — gán tier cho ${allCandidates.length} khái niệm nháp (AI thật, có validate)...`);
  const tiers = await assignTiers(allCandidates, { apiKey, model, maxCore, traceLog, onProgress, maxRetries });
  const tierByIndex = new Map(tiers.map((t) => [t.index, t]));
  const taggedCandidates = allCandidates.map((c, i) => {
    const t = tierByIndex.get(i);
    return { ...c, tier: t.tier, uncertain_signal: t.uncertain_signal };
  });

  onProgress(`Vòng 2b — gộp trùng lặp bằng code (bảo thủ: tên gần giống + chung segmentId)...`);
  const groups = mergeCandidates(taggedCandidates);
  onProgress(`  -> ${allCandidates.length} candidate gộp còn ${groups.length} khái niệm (không candidate nào bị xoá).`);

  onProgress(`Vòng 2c — dựng schema cuối bằng code...`);
  const concepts = buildFinalConcepts(groups);
  const citationCheck = checkCitations(concepts, segmentMap);

  onProgress(`Xong. Concepts: ${concepts.length} (core: ${citationCheck.coreCount}). Citation verified: ${citationCheck.verifiedCitations}/${citationCheck.totalCitations}.`);

  return {
    concepts,
    segments,
    candidates: allCandidates,
    taggedCandidates,
    citationCheck,
    trace: { model, chunkSize, chunkCount: chunks.length, maxCore, calls: traceLog },
  };
}
