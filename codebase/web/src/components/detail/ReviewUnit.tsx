import { useMemo } from 'react'
import { toast } from 'sonner'
import { AnnotatedProse } from '@/components/detail/AnnotatedProse'
import { useEvidence } from '@/context/EvidenceContext'
import { collectEvidence } from '@/lib/reviewPlan'
import { speakText } from '@/lib/tts'
import type { Concept, Evidence, Lesson } from '@/types/lecture'
import { TIER_LABEL } from '@/types/lecture'
import { TierBadge, Chip } from '@/components/ui/badge'

export function ReviewUnit({
  lesson,
  concept,
}: {
  lesson: Lesson
  concept: Concept
}) {
  const evidence = useMemo(() => collectEvidence(concept), [concept])
  const { openEvidence } = useEvidence()

  function openAt(globalIndex: number) {
    openEvidence({
      lessonId: lesson.id,
      evidenceList: evidence,
      index: globalIndex,
    })
  }

  async function listenQuote(ev: Evidence) {
    try {
      toast.info(`Đang đọc [${ev.segmentId}]…`)
      const voice = await speakText(ev.quote, `[${ev.segmentId}]`)
      toast.success(`Đã đọc bằng ${voice}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không đọc được.')
    }
  }

  function makeNarrativeResolver(paraIndex: number) {
    return (spanIndexInPara: number) => {
      if (!concept.narrative[paraIndex][spanIndexInPara]?.evidence) {
        return undefined
      }
      let k = 0
      for (let p = 0; p < concept.narrative.length; p++) {
        for (let s = 0; s < concept.narrative[p].length; s++) {
          if (!concept.narrative[p][s].evidence) continue
          if (p === paraIndex && s === spanIndexInPara) {
            return evidence.findIndex(
              (e) => e.source === 'narrative' && e.sourceIndex === k,
            )
          }
          k++
        }
      }
      return undefined
    }
  }

  function practiceResolve(spanIndex: number) {
    if (!concept.practiceDepth[spanIndex]?.evidence) return undefined
    return evidence.findIndex(
      (e) => e.source === 'practice' && e.sourceIndex === spanIndex,
    )
  }

  return (
    <div className="lf-fade-in space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <TierBadge tier={concept.tier} />
        <Chip className="text-sm">~{concept.estimated_minutes}'</Chip>
      </div>

      <section className="space-y-4 rounded-xl border border-line bg-surface px-5 py-5 shadow-sm">
        {(concept.narrative ?? []).map((para, pi) => (
          <AnnotatedProse
            key={pi}
            spans={para}
            resolveIndex={makeNarrativeResolver(pi)}
            onOpen={openAt}
            onListen={(ev) => void listenQuote(ev)}
          />
        ))}

        {(concept.practiceDepth ?? []).length > 0 ? (
          <div className="border-t border-line pt-4">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.06em] text-primary">
              Cách áp dụng
            </p>
            <AnnotatedProse
              spans={concept.practiceDepth}
              resolveIndex={(i) => practiceResolve(i)}
              onOpen={openAt}
              onListen={(ev) => void listenQuote(ev)}
            />
          </div>
        ) : null}

        <p className="text-base text-muted">
          Chạm phần đánh dấu để xem đúng chỗ trong bài giảng.
        </p>
      </section>

      {(concept.reasons ?? []).length > 0 ? (
        <details className="rounded-xl border border-line bg-surface px-4 py-3">
          <summary className="cursor-pointer text-base font-semibold text-ink">
            Vì sao xếp {TIER_LABEL[concept.tier].toLowerCase()}?
          </summary>
          <ul className="mt-3 space-y-2 border-t border-line pt-3">
            {concept.reasons.map((r, i) => (
              <li key={i} className="text-base leading-relaxed text-ink">
                <span className="font-bold text-primary">✓ </span>
                {r.text}
                {r.evidence ? (
                  <button
                    type="button"
                    className="ml-1 text-base font-semibold text-primary underline decoration-primary/40 underline-offset-2"
                    onClick={() => {
                      const idx = evidence.findIndex(
                        (e) => e.source === 'reason' && e.sourceIndex === i,
                      )
                      if (idx >= 0) openAt(idx)
                    }}
                  >
                    [{r.evidence.segmentId}]
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
