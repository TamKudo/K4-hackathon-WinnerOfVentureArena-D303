// Chuyển output AI thật (eval/run-N/ai-output.json) sang schema UI (src/data/concepts.json).
//
// Vì sao cần script này: bản React ban đầu hiển thị 8 khái niệm dựng tay, trong khi số liệu
// chính thức của nhóm là output AI lượt 5 (21 khái niệm, 63,6% golden set). Demo và báo cáo
// phải trỏ về cùng một nguồn — xem spec.md §9.
//
// Đây là bước chuyển ĐỊNH DẠNG thuần tuý, KHÔNG gọi AI, không thêm/bớt/sửa nội dung:
//   - tier, name, short_summary, quote, segmentId  → giữ nguyên từ ai-output.json
//   - narrative                                    → dựng từ learningPoints (mỗi point 1 đoạn)
//   - reasons                                      → giữ nguyên, gắn evidence tương ứng
//   - estimated_minutes                            → suy ra từ tier (core 5' / important 4' / supporting 3')
//   - order                                        → thứ tự sau khi sắp theo tier
//
// Chạy:  node scripts/build-concepts.mjs [run-5]

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(webRoot, '../..')

const RUN = process.argv[2] || 'run-5'
const TIER_ORDER = { core: 0, important: 1, supporting: 2 }
const MINUTES = { core: 5, important: 4, supporting: 3 }

/** Mỗi bài học: id UI, file transcript nguồn, run lấy output AI */
const LESSONS = [
  {
    id: 'day01-foundation',
    title: 'Day 1 — Foundation',
    subtitle: 'Cách LLM hoạt động',
    transcript_source: 'transcript-04-clean.md',
    aiOutput: `eval/${RUN}/ai-output.json`,
  },
]

const DISCLAIMER = 'Bản đồ ưu tiên ôn theo nội dung bài giảng — không phải dự đoán đề thi'

function slug(name, i) {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return base ? `${base}-${i}` : `concept-${i}`
}

/** learningPoints → narrative. Mỗi point thành 1 đoạn: [câu dẫn][span có evidence]. */
function buildNarrative(concept) {
  const seen = new Set()
  const paragraphs = []

  for (const lp of concept.learningPoints ?? []) {
    const ev = lp.evidence
    if (!ev?.segmentId || !ev?.quote) continue

    // Không lặp lại cùng một quote hai lần (output AI có thể trùng giữa learningPoints/reasons)
    const key = `${ev.segmentId}::${ev.quote}`
    if (seen.has(key)) continue
    seen.add(key)

    paragraphs.push([
      { text: lp.text?.trim() ? `${lp.text.trim()} ` : '' },
      { text: `“${ev.quote.trim()}”`, evidence: { segmentId: ev.segmentId, quote: ev.quote } },
    ])
  }

  if (!paragraphs.length) {
    paragraphs.push([{ text: concept.short_summary ?? concept.name }])
  }
  return paragraphs
}

function buildReasons(concept) {
  const seen = new Set()
  const out = []
  for (const r of concept.reasons ?? []) {
    const text = r.text?.trim()
    if (!text || seen.has(text)) continue
    seen.add(text)
    const ev = r.evidence
    out.push({
      text,
      evidence: ev?.segmentId && ev?.quote ? { segmentId: ev.segmentId, quote: ev.quote } : undefined,
    })
  }
  return out
}

/** practiceDepth — gợi ý ôn theo tier. Không phải nội dung AI sinh, chỉ là hướng dẫn cách dùng. */
function buildPractice(concept) {
  const hint = {
    core: 'Khái niệm trọng tâm — nắm cơ chế và đối chiếu lại đúng đoạn giảng được trích bên trên trước khi vào lab/quiz.',
    important: 'Ôn vừa đủ — nắm ý chính và kiểm lại bằng đoạn trích kèm theo.',
    supporting: 'Bối cảnh — đọc nhanh nếu còn thời gian sau khi xong phần trọng tâm.',
  }[concept.tier]
  const flag = concept.uncertain_signal
    ? ' Tín hiệu trong bài giảng chưa thật rõ ở phần này — cân nhắc đối chiếu thêm.'
    : ''
  return [{ text: hint + flag }]
}

function convert(lessonDef) {
  const aiPath = path.join(repoRoot, lessonDef.aiOutput)
  if (!existsSync(aiPath)) {
    throw new Error(`Không tìm thấy ${aiPath} — kiểm tra lại tên run.`)
  }
  const ai = JSON.parse(readFileSync(aiPath, 'utf8'))
  const source = (ai.concepts ?? []).filter((c) => c?.name && c?.tier)

  const sorted = [...source].sort((a, b) => {
    const t = TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
    return t !== 0 ? t : source.indexOf(a) - source.indexOf(b)
  })

  const concepts = sorted.map((c, i) => ({
    id: slug(c.name, i + 1),
    name: c.name,
    tier: c.tier,
    order: i + 1,
    estimated_minutes: MINUTES[c.tier] ?? 4,
    short_summary: c.short_summary ?? c.name,
    // Giữ nguyên cờ AI tự gán — UI đọc field này để hiện nhãn "tín hiệu chưa chắc"
    // (đường đi low-confidence, spec §6). Không tự đặt cờ ở đây.
    uncertain_signal: Boolean(c.uncertain_signal),
    narrative: buildNarrative(c),
    practiceDepth: buildPractice(c),
    reasons: buildReasons(c),
  }))

  const counts = {
    total: concepts.length,
    core: concepts.filter((c) => c.tier === 'core').length,
    important: concepts.filter((c) => c.tier === 'important').length,
    supporting: concepts.filter((c) => c.tier === 'supporting').length,
  }

  return {
    id: lessonDef.id,
    title: lessonDef.title,
    subtitle: lessonDef.subtitle,
    disclaimer: DISCLAIMER,
    transcript_source: lessonDef.transcript_source,
    concepts,
    counts,
  }
}

const lessons = {}
const lessonOrder = []
for (const def of LESSONS) {
  const lesson = convert(def)
  lessons[def.id] = lesson
  lessonOrder.push(def.id)
  console.log(
    `${def.id}: ${lesson.counts.total} khái niệm ` +
      `(core ${lesson.counts.core} · important ${lesson.counts.important} · supporting ${lesson.counts.supporting}) ` +
      `← ${def.aiOutput}`
  )
}

const outPath = path.join(webRoot, 'src/data/concepts.json')
writeFileSync(outPath, JSON.stringify({ lessonOrder, lessons }, null, 2) + '\n', 'utf8')
console.log(`\nĐã ghi ${path.relative(repoRoot, outPath)}`)
console.log(`Nguồn: ${RUN} — output AI thật, xem eval/${RUN}-results.md để biết % golden set.`)
