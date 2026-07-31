export type Tier = 'core' | 'important' | 'supporting'
export type Budget = 'all' | '15' | '30' | '60'

export interface Evidence {
  segmentId: string
  quote: string
  keyPhrase?: string
}

/** Một mảnh trong đoạn văn; có evidence thì click để mở transcript */
export interface AnnotatedSpan {
  text: string
  evidence?: Evidence
}

export interface Reason {
  text: string
  evidence?: Evidence
}

export interface Concept {
  id: string
  name: string
  tier: Tier
  order: number
  estimated_minutes: number
  short_summary: string
  /**
   * AI tự đánh dấu khi tín hiệu trong bài giảng chưa đủ chắc (đoạn nhiều [không nghe rõ],
   * giảng viên tự nhận xét "chỉ mang tính tương đối", nội dung mâu thuẫn với đoạn khác).
   * Xem quy tắc 3 trong SHARED_RULES — codebase/lib/reviewMapGenerator.mjs.
   * Đây là đường đi low-confidence của spec §6: hạ tier hoặc gắn nhãn, không đoán liều.
   */
  uncertain_signal?: boolean
  /** Đoạn văn tổng hợp — mỗi phần tử là một đoạn, mỗi đoạn là các span */
  narrative: AnnotatedSpan[][]
  /** Độ sâu áp dụng: “hợp lý” nghĩa là gì / nên làm gì */
  practiceDepth: AnnotatedSpan[]
  reasons: Reason[]
}

export interface Segment {
  id: string
  text: string
}

export interface LessonCounts {
  total: number
  core: number
  important: number
  supporting: number
}

export interface Lesson {
  id: string
  title: string
  subtitle: string
  disclaimer: string
  transcript_source: string
  concepts: Concept[]
  counts: LessonCounts
  segments: Segment[]
  hasFullTranscript: boolean
}

export interface ConceptsFile {
  lessonOrder: string[]
  lessons: Record<
    string,
    Omit<Lesson, 'hasFullTranscript' | 'segments'> & { segments?: Segment[] }
  >
}

export interface TranscriptsFile {
  [lessonId: string]: { segments: Segment[] }
}

export interface EvidenceItem extends Evidence {
  source: 'narrative' | 'practice' | 'reason'
  sourceIndex: number
  label: string
}

export const TIER_ORDER: Record<Tier, number> = {
  core: 0,
  important: 1,
  supporting: 2,
}

export const TIER_LABEL: Record<Tier, string> = {
  core: 'Trọng tâm',
  important: 'Quan trọng',
  supporting: 'Bổ trợ',
}

export const DEPTH_HINT: Record<Tier, string> = {
  core: 'Ôn sâu — nắm cơ chế, cách áp dụng, và đối chiếu bằng chứng trong bài',
  important: 'Ôn vừa đủ — ý then chốt + cách dùng kèm evidence',
  supporting: 'Bối cảnh ngắn — đọc nhanh nếu còn thời gian',
}

export function countEvidenceSpans(concept: Concept): number {
  let n = 0
  for (const para of concept.narrative ?? []) {
    for (const span of para) if (span.evidence) n++
  }
  for (const span of concept.practiceDepth ?? []) {
    if (span.evidence) n++
  }
  return n
}
