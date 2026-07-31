import type { AnnotatedSpan, Concept, Evidence, Segment } from '@/types/lecture'
import { collectEvidence } from '@/lib/reviewPlan'

export type ConceptDepthInput = {
  lessonId: string
  conceptId: string
  segments: Segment[]
  conceptName: string
  shortSummary: string
  concept?: Concept
  /** Bỏ qua cache (local + server) và gọi Gemini lại */
  refresh?: boolean
}

export type ConceptDepthOutput = {
  narrative: AnnotatedSpan[][]
  practiceDepth: AnnotatedSpan[]
}

export type GenerateDepthResult =
  | { ok: true; data: ConceptDepthOutput; source: 'ai' | 'cache' | 'local' }
  | { ok: false; error: string }

const memoryCache = new Map<string, ConceptDepthOutput>()

function cacheKey(lessonId: string, conceptId: string) {
  return `${lessonId}::${conceptId}`
}

function storageKey(key: string) {
  return `lf-depth:${key}`
}

function localGet(key: string): ConceptDepthOutput | null {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (!raw) return null
    return JSON.parse(raw) as ConceptDepthOutput
  } catch {
    return null
  }
}

function localSet(key: string, value: ConceptDepthOutput) {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch {
    /* ignore quota */
  }
}

function isSpan(x: unknown): x is AnnotatedSpan {
  if (!x || typeof x !== 'object') return false
  const s = x as AnnotatedSpan
  if (typeof s.text !== 'string') return false
  if (s.evidence === undefined) return true
  const e = s.evidence as Evidence
  return (
    typeof e.segmentId === 'string' &&
    typeof e.quote === 'string' &&
    (e.keyPhrase === undefined || typeof e.keyPhrase === 'string')
  )
}

function isNarrative(x: unknown): x is AnnotatedSpan[][] {
  return (
    Array.isArray(x) &&
    x.every((para) => Array.isArray(para) && para.every(isSpan))
  )
}

function isPractice(x: unknown): x is AnnotatedSpan[] {
  return Array.isArray(x) && x.every(isSpan)
}

function sanitizeOutput(
  out: ConceptDepthOutput,
  segments: Segment[],
): ConceptDepthOutput {
  const byId = new Map(segments.map((s) => [s.id, s.text]))

  function cleanSpan(span: AnnotatedSpan): AnnotatedSpan {
    if (!span.evidence) return { text: span.text }
    const text = byId.get(span.evidence.segmentId)
    if (!text || !text.includes(span.evidence.quote)) {
      return { text: span.text }
    }
    return span
  }

  return {
    narrative: out.narrative.map((para) => para.map(cleanSpan)),
    practiceDepth: out.practiceDepth.map(cleanSpan),
  }
}

export function selectSegmentsForPrompt(
  all: Segment[],
  concept?: Concept,
): Segment[] {
  const totalChars = all.reduce((n, s) => n + s.text.length, 0)
  if (totalChars < 60_000) return all
  if (!concept || !all.length) return all.slice(0, 80)

  const indexById = new Map(all.map((s, i) => [s.id, i]))
  const keep = new Set<number>()
  const items = collectEvidence(concept)
  for (const ev of items) {
    const i = indexById.get(ev.segmentId)
    if (i === undefined) continue
    for (let d = -2; d <= 2; d++) {
      const j = i + d
      if (j >= 0 && j < all.length) keep.add(j)
    }
  }
  if (!keep.size) return all.slice(0, 80)
  return [...keep]
    .sort((a, b) => a - b)
    .map((i) => all[i])
}

/**
 * Ưu tiên: memory → localStorage → disk cache server → Gemini.
 * Thành công thì lưu local + disk (server) để lần sau không tốn quota.
 */
export async function generateConceptDepth(
  input: ConceptDepthInput,
): Promise<GenerateDepthResult> {
  const key = cacheKey(input.lessonId, input.conceptId)

  if (!input.refresh) {
    const mem = memoryCache.get(key)
    if (mem) return { ok: true, data: mem, source: 'local' }
    const local = localGet(key)
    if (local?.narrative?.length) {
      memoryCache.set(key, local)
      return { ok: true, data: local, source: 'local' }
    }
  }

  if (!input.segments.length) {
    return {
      ok: false,
      error: 'Chưa có transcript local — không gọi được AI.',
    }
  }

  const segments = selectSegmentsForPrompt(input.segments, input.concept)
  const hints =
    input.concept != null
      ? collectEvidence(input.concept).map((e) => ({
          segmentId: e.segmentId,
          quote: e.quote,
        }))
      : []

  try {
    const res = await fetch('/api/generate-depth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: input.lessonId,
        conceptId: input.conceptId,
        conceptName: input.conceptName,
        shortSummary: input.shortSummary,
        segments,
        existingEvidenceHints: hints,
        refresh: !!input.refresh,
      }),
    })

    const raw = await res.json().catch(() => ({})) as {
      narrative?: unknown
      practiceDepth?: unknown
      source?: string
      error?: string
    }

    if (!res.ok) {
      return {
        ok: false,
        error: raw.error || `API lỗi HTTP ${res.status}`,
      }
    }

    if (!isNarrative(raw.narrative) || !isPractice(raw.practiceDepth)) {
      return {
        ok: false,
        error: 'Phản hồi AI không đúng schema narrative/practiceDepth.',
      }
    }
    if (!raw.narrative.length) {
      return { ok: false, error: 'AI trả narrative rỗng.' }
    }

    const cleaned = sanitizeOutput(
      { narrative: raw.narrative, practiceDepth: raw.practiceDepth },
      segments,
    )
    memoryCache.set(key, cleaned)
    localSet(key, cleaned)
    const source =
      raw.source === 'cache' ? 'cache' : raw.source === 'ai' ? 'ai' : 'ai'
    return { ok: true, data: cleaned, source }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Không gọi được /api/generate-depth',
    }
  }
}

/** @deprecated dùng GenerateDepthResult */
export type ConceptDepthOutputLegacy = ConceptDepthOutput
