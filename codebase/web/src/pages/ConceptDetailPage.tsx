import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/badge'
import { ReviewUnit } from '@/components/detail/ReviewUnit'
import { useWorkspace } from '@/context/WorkspaceContext'
import { findConcept } from '@/lib/reviewPlan'
import { generateConceptDepth } from '@/lib/generateNarrative'
import type { Concept } from '@/types/lecture'

type DepthSource = 'loading' | 'ai' | 'cache' | 'local' | 'mock'

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
        setConcept(baseConcept)
        setSource('mock')
        toast.error(`AI lỗi — dùng mock. ${result.error}`)
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

  const sourceLabel =
    source === 'loading'
      ? 'Đang sinh AI…'
      : source === 'ai'
        ? 'Nguồn: AI'
        : source === 'cache' || source === 'local'
          ? 'Nguồn: cache'
          : 'Nguồn: mock'

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
