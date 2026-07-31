import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { TierBadge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Concept } from '@/types/lecture'

const tierBorder: Record<Concept['tier'], string> = {
  core: 'border-l-primary',
  important: 'border-l-important',
  supporting: 'border-l-supporting',
}

export function BentoConceptTile({
  concept,
  lessonId,
  showBadge = false,
  className,
}: {
  concept: Concept
  lessonId: string
  size?: 'lg' | 'md' | 'sm'
  showBadge?: boolean
  className?: string
}) {
  const [params] = useSearchParams()
  const budget = params.get('budget')
  const to = budget
    ? `/bai/${lessonId}/khai-niem/${concept.id}?budget=${encodeURIComponent(budget)}`
    : `/bai/${lessonId}/khai-niem/${concept.id}`

  return (
    <Link
      to={to}
      className={cn(
        'group flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md cursor-pointer border-l-[3px]',
        tierBorder[concept.tier],
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink">
            {concept.name}
          </h3>
          {showBadge ? <TierBadge tier={concept.tier} /> : null}
        </div>
        <p className="mt-1 line-clamp-2 text-base leading-relaxed text-muted">
          {concept.short_summary}
        </p>
        <p className="mt-2 text-sm font-bold text-primary/80">
          ~{concept.estimated_minutes}'
        </p>
      </div>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}
