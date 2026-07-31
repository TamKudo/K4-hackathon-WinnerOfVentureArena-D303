import { Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnnotatedSpan, Evidence } from '@/types/lecture'

type Props = {
  spans: AnnotatedSpan[]
  /** Trả về global evidence index cho span thứ i trong list này (nếu có evidence) */
  resolveIndex: (spanIndex: number) => number | undefined
  onOpen: (globalIndex: number) => void
  onListen?: (evidence: Evidence) => void
  className?: string
  as?: 'p' | 'div'
}

export function AnnotatedProse({
  spans,
  resolveIndex,
  onOpen,
  onListen,
  className,
  as: Tag = 'p',
}: Props) {
  return (
    <Tag className={cn('lf-prose text-lg leading-8 text-ink', className)}>
      {spans.map((span, i) => {
        if (!span.evidence) {
          return <span key={i}>{span.text}</span>
        }
        const gi = resolveIndex(i)
        return (
          <span key={i} className="inline whitespace-pre-wrap">
            <button
              type="button"
              onClick={() => gi !== undefined && onOpen(gi)}
              className="cite-span cursor-pointer rounded-sm bg-primary-soft/70 px-0.5 font-medium text-ink underline decoration-primary/50 decoration-2 underline-offset-[3px] transition-colors hover:bg-primary-soft hover:decoration-primary"
              title={`Mở [${span.evidence.segmentId}] trong bài giảng`}
            >
              {span.text}
            </button>
            {onListen ? (
              <button
                type="button"
                aria-label="Nghe đoạn này"
                className="ml-0.5 inline-flex translate-y-[2px] rounded p-0.5 text-muted hover:bg-important-soft hover:text-important"
                onClick={(e) => {
                  e.stopPropagation()
                  onListen(span.evidence!)
                }}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </span>
        )
      })}
    </Tag>
  )
}
