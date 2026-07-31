import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEvidence } from '@/context/EvidenceContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { speakText, stopSpeech } from '@/lib/tts'
import { escapeHtml } from '@/lib/utils'
import type { EvidenceItem, Segment } from '@/types/lecture'

function renderSegmentHtml(seg: Segment, active?: EvidenceItem | null) {
  let html = escapeHtml(seg.text)
  if (
    active &&
    active.segmentId === seg.id &&
    active.quote &&
    seg.text.includes(active.quote)
  ) {
    const q = active.quote
    const i = seg.text.indexOf(q)
    const before = escapeHtml(seg.text.slice(0, i))
    const after = escapeHtml(seg.text.slice(i + q.length))
    let mid = escapeHtml(q)
    if (active.keyPhrase && q.includes(active.keyPhrase)) {
      const k = escapeHtml(active.keyPhrase)
      mid = mid.replace(k, `<strong>${k}</strong>`)
    }
    html = `${before}<mark class="quote-mark">${mid}</mark>${after}`
  }
  return html
}

export function TranscriptSheet() {
  const workspace = useWorkspace()
  const { open, lessonId, evidenceList, index, closeEvidence, next, prev } =
    useEvidence()
  const [ttsStatus, setTtsStatus] = useState('')
  const activeRef = useRef<HTMLDivElement | null>(null)

  const lesson = lessonId ? workspace.lessons[lessonId] : null
  const active = evidenceList[index] ?? null

  useEffect(() => {
    if (!open || !active) return
    const id = requestAnimationFrame(() => {
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return () => cancelAnimationFrame(id)
  }, [open, active, index])

  useEffect(() => {
    if (!open) {
      stopSpeech()
      setTtsStatus('')
    }
  }, [open])

  async function listenQuote() {
    if (!active?.quote) {
      toast.warning('Không có trích dẫn để đọc.')
      return
    }
    try {
      const label = `[${active.segmentId}]`
      setTtsStatus(`Đang đọc ${label}…`)
      toast.info(`Đang đọc ${label}…`)
      const voice = await speakText(active.quote, label)
      setTtsStatus(`Đã đọc bằng ${voice}`)
      toast.success(`Đã đọc bằng ${voice}`)
    } catch (e) {
      setTtsStatus('')
      toast.error(e instanceof Error ? e.message : 'Không đọc được.')
    }
  }

  async function listenSegment() {
    if (!active || !lesson) return
    const seg = lesson.segments.find((s) => s.id === active.segmentId)
    const text = seg?.text || active.quote
    if (!text) {
      toast.warning('Chưa có nội dung đoạn này.')
      return
    }
    if (!seg) {
      toast.message('Chế độ quote-only — đang đọc trích dẫn ngắn.')
    }
    try {
      const label = `[${active.segmentId}] · toàn đoạn`
      setTtsStatus(`Đang đọc ${label}…`)
      toast.info(`Đang đọc ${label}…`)
      const voice = await speakText(text, label)
      setTtsStatus(`Đã đọc bằng ${voice}`)
      toast.success(`Đã đọc bằng ${voice}`)
    } catch (e) {
      setTtsStatus('')
      toast.error(e instanceof Error ? e.message : 'Không đọc được.')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) closeEvidence()
      }}
    >
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Bài giảng</SheetTitle>
          <SheetDescription>
            {lesson
              ? lesson.hasFullTranscript
                ? `${lesson.title} · ${lesson.segments.length} đoạn`
                : `${lesson.title} · chế độ quote-only`
              : 'Chọn một bài học để xem bằng chứng.'}
          </SheetDescription>
          {ttsStatus ? (
            <p className="mt-2 text-xs font-semibold text-primary">{ttsStatus}</p>
          ) : null}
        </SheetHeader>

        {evidenceList.length > 0 && active ? (
          <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
            <Button variant="outline" size="sm" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <p className="text-center text-xs font-semibold text-muted">
              {index + 1}/{evidenceList.length} · {active.segmentId} · {active.label}
            </p>
            <Button variant="outline" size="sm" onClick={next}>
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {active ? (
          <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
            <Button variant="outline" size="sm" onClick={() => void listenQuote()}>
              <Volume2 className="h-4 w-4" />
              Nghe đoạn này
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void listenSegment()}>
              Nghe toàn đoạn
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stopSpeech()
                setTtsStatus('')
              }}
            >
              <Pause className="h-4 w-4" />
              Dừng
            </Button>
          </div>
        ) : null}

        <ScrollArea className="flex-1 px-5 py-4">
          {!lesson ? (
            <p className="text-base text-muted">Chưa chọn bài học.</p>
          ) : lesson.hasFullTranscript ? (
            <div className="space-y-2 pb-10">
              {lesson.segments.map((seg) => {
                const isActive = active?.segmentId === seg.id
                return (
                  <div
                    key={seg.id}
                    ref={isActive ? activeRef : undefined}
                    className={`rounded-xl border p-3 transition-colors ${
                      isActive
                        ? 'border-highlight-border bg-important-soft/40'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="mb-1 text-xs font-bold text-muted">
                      {seg.id}
                    </div>
                    <div
                      className="whitespace-pre-wrap text-base leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: renderSegmentHtml(seg, active),
                      }}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3 pb-10">
              <p className="text-base text-muted">
                Transcript đầy đủ chưa được nạp. Đang hiển thị các trích dẫn ngắn gắn với khái niệm.
              </p>
              {(evidenceList.length
                ? evidenceList
                : []
              ).map((ev, i) => (
                <div
                  key={`${ev.segmentId}-${i}`}
                  ref={i === index ? activeRef : undefined}
                  className={`rounded-xl border p-3 ${
                    i === index
                      ? 'border-highlight-border bg-important-soft/40'
                      : 'border-line'
                  }`}
                >
                  <div className="mb-1 text-xs font-bold text-muted">
                    {ev.segmentId}
                  </div>
                  <p className="text-base leading-relaxed">
                    <mark className="quote-mark">{ev.quote}</mark>
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
