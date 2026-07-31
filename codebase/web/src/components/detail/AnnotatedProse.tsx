import { Quote, Volume2 } from 'lucide-react'
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
            {/*
              Từ feedback validation (spec §9): user mất ~20 giây mới nhận ra trích dẫn bấm
              được. Thêm icon ngoặc kép + viền nét đứt để báo hiệu affordance ngay từ cái
              nhìn đầu, thay vì chỉ dựa vào gạch chân.
            */}
            <button
              type="button"
              onClick={() => gi !== undefined && onOpen(gi)}
              className="cite-span cursor-pointer rounded-md border border-dashed border-primary/40 bg-primary-soft/70 px-1 py-0.5 font-medium text-ink underline decoration-primary/50 decoration-2 underline-offset-[3px] transition-colors hover:border-solid hover:border-primary hover:bg-primary-soft hover:decoration-primary"
              title={`Bấm để mở đoạn [${span.evidence.segmentId}] trong bài giảng`}
            >
              <Quote
                aria-hidden
                className="mr-0.5 inline-block h-3 w-3 shrink-0 -translate-y-px text-primary"
              />
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
