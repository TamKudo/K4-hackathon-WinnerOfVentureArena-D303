import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/badge'
import { BentoConceptTile } from '@/components/map/BentoConceptTile'
import { useWorkspace } from '@/context/WorkspaceContext'
import { planForBudget } from '@/lib/reviewPlan'
import type { Budget, Concept, Tier } from '@/types/lecture'
import { TIER_LABEL } from '@/types/lecture'
import { cn } from '@/lib/utils'

const budgets: { id: Budget; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: '15', label: "15'" },
  { id: '30', label: "30'" },
  { id: '60', label: "60'" },
]

const tierLabelClass: Record<Tier, string> = {
  core: 'text-primary',
  important: 'text-important',
  supporting: 'text-supporting',
}

function TierSection({
  tier,
  concepts,
  lessonId,
  showBadge = false,
}: {
  tier?: Tier
  concepts: Concept[]
  lessonId: string
  showBadge?: boolean
}) {
  if (!concepts.length) return null
  return (
    <section>
      <h2
        className={cn(
          'mb-2.5 text-sm font-bold uppercase tracking-[0.08em]',
          tier ? tierLabelClass[tier] : 'text-muted',
        )}
      >
        {tier ? TIER_LABEL[tier] : 'Lộ trình ưu tiên'}
      </h2>
      <div className="flex flex-col gap-2.5">
        {concepts.map((c) => (
          <BentoConceptTile
            key={c.id}
            concept={c}
            lessonId={lessonId}
            showBadge={showBadge}
          />
        ))}
      </div>
    </section>
  )
}

export function StudyHubPage() {
  const [params, setParams] = useSearchParams()
  const { lessonOrder, lessons, transcriptsLoaded } = useWorkspace()

  const requestedId = params.get('lesson')
  const lessonId =
    requestedId && lessons[requestedId] ? requestedId : lessonOrder[0]
  const lesson = lessons[lessonId]

  useEffect(() => {
    if (!lessonOrder[0]) return
    if (requestedId && lessons[requestedId] && requestedId === lessonId) return
    const next = new URLSearchParams(params)
    next.set('lesson', lessonId)
    setParams(next, { replace: true })
  }, [requestedId, lessonId, lessonOrder, lessons, params, setParams])

  if (!lesson) {
    return <Navigate to="/tong-quan" replace />
  }

  const budget = (params.get('budget') as Budget) || 'all'
  const list = planForBudget(lesson, budget)
  const totalMin = list.reduce((s, c) => s + c.estimated_minutes, 0)

  const core = list.filter((c) => c.tier === 'core')
  const important = list.filter((c) => c.tier === 'important')
  const supporting = list.filter((c) => c.tier === 'supporting')

  function setLesson(id: string) {
    const next = new URLSearchParams()
    next.set('lesson', id)
    setParams(next, { replace: true })
  }

  function setBudget(b: Budget) {
    const next = new URLSearchParams(params)
    next.set('lesson', lessonId)
    if (b === 'all') next.delete('budget')
    else next.set('budget', b)
    setParams(next, { replace: true })
  }

  return (
    <div className="lf-fade-in mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Ôn tập
        </h1>
        <p className="mt-1.5 text-lg text-muted">
          Chọn bài — xem cần ôn gì trước theo quỹ thời gian.
        </p>
      </div>

      {!transcriptsLoaded ? (
        <p className="rounded-lg border border-important/30 bg-important-soft px-3.5 py-2.5 text-base text-ink/90">
          <span className="font-bold text-important">Transcript local chưa nạp.</span>{' '}
          Vẫn xem được bản đồ và quote.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {lessonOrder.map((id) => {
          const L = lessons[id]
          const active = id === lessonId
          return (
            <Button
              key={id}
              variant={active ? 'default' : 'outline'}
              className="rounded-full text-base"
              onClick={() => setLesson(id)}
            >
              {L.title}
            </Button>
          )
        })}
      </div>

      <div>
        <p className="text-lg font-semibold text-ink">{lesson.subtitle}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Chip className="text-sm">{lesson.counts.total} khái niệm</Chip>
          <Chip className="border-primary/20 bg-primary-soft text-sm text-primary">
            Trọng tâm {lesson.counts.core}
          </Chip>
          <Chip className="border-important/20 bg-important-soft text-sm text-important">
            Quan trọng {lesson.counts.important}
          </Chip>
          <Chip className="border-supporting/20 bg-supporting-soft text-sm text-supporting">
            Bổ trợ {lesson.counts.supporting}
          </Chip>
        </div>
        <p className="mt-2 text-base text-muted">{lesson.disclaimer}</p>

        {/*
          Từ feedback validation (spec §9): 2/5 người thử không hiểu vì sao một khái niệm
          được xếp Trọng tâm. Lý do vốn chỉ hiện trong khối "Vì sao xếp trọng tâm?" ở trang
          chi tiết — quá sâu. Nói tiêu chí ngay đây, đúng nguyên tắc G2 + G11 (spec §4).
        */}
        <details className="mt-2 rounded-lg border border-line bg-surface px-3.5 py-2.5">
          <summary className="cursor-pointer text-base font-semibold text-ink marker:text-muted">
            Mức ưu tiên dựa trên tiêu chí gì?
          </summary>
          <div className="mt-2 space-y-1.5 text-base leading-relaxed text-muted">
            <p>
              Mỗi khái niệm được xếp mức theo <strong className="text-ink">tín hiệu quan sát
              được trong chính bài giảng</strong>, không phải theo độ khó hay dự đoán đề thi:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Giảng viên có nhấn mạnh rõ ràng không ("cực kỳ quan trọng", "mình rất muốn nhắc")</li>
              <li>Khái niệm được giảng trong bao nhiêu đoạn, có lặp lại nhiều lần không</li>
              <li>Có được nhắc lại ở phần tóm tắt cuối buổi hay không</li>
            </ul>
            <p>
              Mở một khái niệm rồi xem mục <strong className="text-ink">"Vì sao xếp trọng tâm?"</strong> để
              đọc lý do cụ thể kèm trích dẫn nguyên văn từ bài giảng.
            </p>
          </div>
        </details>
      </div>

      <div className="sticky top-[57px] z-20 border-y border-line bg-background/95 py-3 backdrop-blur-sm">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em] text-muted">
          Quỹ thời gian
        </p>
        <div className="flex flex-wrap gap-2">
          {budgets.map((b) => (
            <Button
              key={b.id}
              variant={budget === b.id ? 'default' : 'outline'}
              onClick={() => setBudget(b.id)}
              className="rounded-full text-base"
            >
              {b.label}
            </Button>
          ))}
        </div>
        {budget !== 'all' ? (
          <p className="mt-2 text-base text-muted">
            Lộ trình {budget} phút · ước lượng ~{totalMin}'
          </p>
        ) : null}
      </div>

      {/*
        Đường đi failure (spec §6): khi không dựng được bản đồ đủ tin cậy cho buổi này,
        hệ thống nói thẳng là chưa đủ căn cứ thay vì bịa ra khái niệm để lấp chỗ trống.
        Xảy ra khi AI không rút được khái niệm nào có trích dẫn xác minh được — xem
        nhánh trả về concepts:[] trong codebase/lib/reviewMapGenerator.mjs.
      */}
      {list.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface px-5 py-8 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            Chưa dựng được bản đồ ôn tập cho buổi này
          </p>
          <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-muted">
            Không có khái niệm nào đủ căn cứ trong transcript để xếp mức ưu tiên. Hệ thống
            không đoán liều — bạn nên xem lại slide hoặc hỏi giảng viên thay vì dựa vào bản
            đồ này.
          </p>
        </div>
      ) : budget === 'all' ? (
        <div className="space-y-6">
          <TierSection tier="core" concepts={core} lessonId={lessonId} />
          <TierSection
            tier="important"
            concepts={important}
            lessonId={lessonId}
          />
          <TierSection
            tier="supporting"
            concepts={supporting}
            lessonId={lessonId}
          />
        </div>
      ) : (
        <TierSection concepts={list} lessonId={lessonId} showBadge />
      )}
    </div>
  )
}
