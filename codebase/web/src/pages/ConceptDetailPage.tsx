import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/badge'
import { ReviewUnit } from '@/components/detail/ReviewUnit'
import { useWorkspace } from '@/context/WorkspaceContext'
import { findConcept } from '@/lib/reviewPlan'
import { generateConceptDepth } from '@/lib/generateNarrative'
import type { Concept } from '@/types/lecture'

/** 'base' = dữ liệu nền từ eval/run-5 (output AI thật đã đo bằng golden set). */
type DepthSource = 'loading' | 'ai' | 'cache' | 'local' | 'base'

export function ConceptDetailPage() {
  const { lessonId = '', conceptId = '' } = useParams()
  const [params] = useSearchParams()
  const { lessons } = useWorkspace()
  const lesson = lessons[lessonId]
  const baseConcept = lesson ? findConcept(lesson, conceptId) : undefined

  const [source, setSource] = useState<DepthSource>('loading')
  const [concept, setConcept] = useState<Concept | undefined>(baseConcept)

  useEffect(() => {
    if (!lesson || !baseConcept) return
    let cancelled = false
    setSource('loading')
    setConcept(baseConcept)

    void generateConceptDepth({
      lessonId: lesson.id,
      conceptId: baseConcept.id,
      segments: lesson.segments,
      conceptName: baseConcept.name,
      shortSummary: baseConcept.short_summary,
      concept: baseConcept,
    }).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setConcept({
          ...baseConcept,
          narrative: result.data.narrative,
          practiceDepth: result.data.practiceDepth,
        })
        setSource(result.source)
      } else {
        // Không có transcript local → bỏ qua bước làm sâu bằng Gemini và hiển thị nguyên
        // dữ liệu nền, vốn đã là output AI thật (Groq, eval/run-5). Đây là đường đi bình
        // thường khi nộp bài, không phải lỗi — nên không bắn toast đỏ.
        setConcept(baseConcept)
        setSource('base')
      }
    })

    return () => {
      cancelled = true
    }
  }, [lesson, baseConcept])

  if (!lesson || !baseConcept || !concept) {
    return <Navigate to="/tong-quan" replace />
  }

  const budget = params.get('budget')
  const hubParams = new URLSearchParams()
  hubParams.set('lesson', lessonId)
  if (budget) hubParams.set('budget', budget)
  const hubTo = `/tong-quan?${hubParams.toString()}`

  // Dữ liệu nền ('base') là output AI thật đã đo bằng golden set — xem eval/run-5-results.md.
  // 'ai'/'cache' là lớp làm sâu thêm bằng Gemini lúc chạy, chỉ bật khi có transcript local.
  const sourceLabel =
    source === 'loading'
      ? 'Đang sinh AI…'
      : source === 'ai'
        ? 'Nguồn: AI (làm sâu)'
        : source === 'cache' || source === 'local'
          ? 'Nguồn: AI (cache)'
          : 'Nguồn: AI — eval/run-5'

  return (
    <div className="lf-fade-in mx-auto max-w-3xl">
      <Button variant="ghost" asChild className="-ml-2 mb-3 text-base">
        <Link to={hubTo}>
          <ArrowLeft className="h-5 w-5" />
          Ôn tập
        </Link>
      </Button>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {concept.name}
        </h1>
        <Chip
          className={
            source === 'ai' || source === 'cache' || source === 'local'
              ? 'border-primary/20 bg-primary-soft text-sm text-primary'
              : 'text-sm text-muted'
          }
        >
          {sourceLabel}
        </Chip>
      </div>
      <p className="mb-5 max-w-2xl text-lg leading-relaxed text-muted">
        {concept.short_summary}
      </p>

      {/* Đường đi low-confidence (spec §6): nói rõ vì sao thay vì im lặng hạ tier */}
      {concept.uncertain_signal ? (
        <div className="mb-5 flex gap-3 rounded-xl border border-important/30 bg-important/10 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-important" />
          <p className="text-base leading-relaxed text-ink">
            <strong className="font-bold">Tín hiệu chưa chắc.</strong> Đoạn giảng liên quan
            có chỗ nghe không rõ, hoặc giảng viên tự nhận xét phần này chỉ mang tính tương
            đối. Mức ưu tiên đã được hạ xuống thay vì đoán liều — nên đối chiếu lại đoạn
            trích bên dưới trước khi tin.
          </p>
        </div>
      ) : null}

      {source === 'loading' ? (
        <p className="rounded-xl border border-line bg-surface px-5 py-8 text-lg text-muted">
          Đang sinh tóm tắt bằng AI…
        </p>
      ) : (
        <ReviewUnit lesson={lesson} concept={concept} />
      )}
    </div>
  )
}
