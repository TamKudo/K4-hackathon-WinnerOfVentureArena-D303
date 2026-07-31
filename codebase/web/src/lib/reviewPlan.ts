import {
  TIER_ORDER,
  type Budget,
  type Concept,
  type EvidenceItem,
  type Lesson,
} from '@/types/lecture'

export function sortedConcepts(lesson: Lesson): Concept[] {
  return [...lesson.concepts].sort(
    (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.order - b.order,
  )
}

export function planForBudget(lesson: Lesson, budget: Budget): Concept[] {
  const all = sortedConcepts(lesson)
  if (budget === 'all') return all
  const limit = Number(budget)
  const picked: Concept[] = []
  let sum = 0
  for (const c of all) {
    if (!picked.length || sum + c.estimated_minutes <= limit) {
      picked.push(c)
      sum += c.estimated_minutes
    } else break
  }
  return picked
}

export function collectEvidence(concept: Concept): EvidenceItem[] {
  const items: EvidenceItem[] = []
  let narrativeIndex = 0
  for (const para of concept.narrative ?? []) {
    for (const span of para) {
      if (span.evidence) {
        items.push({
          ...span.evidence,
          source: 'narrative',
          sourceIndex: narrativeIndex,
          label: 'Trong bài giảng',
        })
        narrativeIndex++
      }
    }
  }
  ;(concept.practiceDepth ?? []).forEach((span, i) => {
    if (span.evidence) {
      items.push({
        ...span.evidence,
        source: 'practice',
        sourceIndex: i,
        label: 'Cách áp dụng',
      })
    }
  })
  ;(concept.reasons ?? []).forEach((r, i) => {
    if (r.evidence) {
      items.push({
        ...r.evidence,
        source: 'reason',
        sourceIndex: i,
        label: 'Lý do ưu tiên',
      })
    }
  })
  return items
}

/** Map span có evidence → index trong collectEvidence (chỉ narrative+practice theo thứ tự) */
export function evidenceIndexForSpan(
  concept: Concept,
  source: 'narrative' | 'practice',
  sourceIndex: number,
): number {
  const list = collectEvidence(concept)
  return list.findIndex(
    (e) => e.source === source && e.sourceIndex === sourceIndex,
  )
}

export function findConcept(lesson: Lesson, conceptId: string) {
  return lesson.concepts.find((c) => c.id === conceptId)
}

export function segmentById(lesson: Lesson, segmentId: string) {
  return lesson.segments.find((s) => s.id === segmentId)
}
