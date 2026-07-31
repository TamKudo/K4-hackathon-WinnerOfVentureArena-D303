import type { ReactNode } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { BookOpenText, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEvidence } from '@/context/EvidenceContext'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { lessonId: paramLessonId } = useParams()
  const [params] = useSearchParams()
  const { openTranscript } = useEvidence()
  const isLanding = location.pathname === '/'
  const lessonId = paramLessonId || params.get('lesson')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl"
          >
            LectureFocus
          </Link>
          {!isLanding ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" asChild className="text-base">
                <Link to="/tong-quan">
                  <BookMarked className="h-5 w-5" />
                  Ôn tập
                </Link>
              </Button>
              {lessonId ? (
                <Button
                  variant="outline"
                  className="text-base"
                  onClick={() => openTranscript(lessonId)}
                >
                  <BookOpenText className="h-5 w-5" />
                  Bài giảng
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>
      <main
        className={cn(
          'mx-auto px-4 sm:px-6',
          isLanding ? 'max-w-6xl' : 'max-w-6xl py-8 pb-24',
        )}
      >
        {children}
      </main>
    </div>
  )
}
