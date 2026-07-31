import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const tiers = [
  {
    tier: 'Trọng tâm',
    blurb: 'Ôn trước — tín hiệu mạnh trong bài',
    accent: 'border-l-primary text-primary',
    soft: 'bg-primary-soft/80',
  },
  {
    tier: 'Quan trọng',
    blurb: 'Nắm chắc nếu còn thời gian',
    accent: 'border-l-important text-important',
    soft: 'bg-important-soft/80',
  },
  {
    tier: 'Bổ trợ',
    blurb: 'Bối cảnh — đọc nhanh khi còn quỹ',
    accent: 'border-l-supporting text-supporting',
    soft: 'bg-supporting-soft/80',
  },
]

export function LandingPage() {
  return (
    <div className="lf-fade-in">
      <section className="relative -mx-4 overflow-hidden px-4 pb-16 pt-12 sm:-mx-6 sm:px-6 sm:pt-16 lg:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,rgba(15,118,110,0.14),transparent_55%),radial-gradient(ellipse_50%_50%_at_90%_20%,rgba(217,119,6,0.1),transparent_50%),linear-gradient(180deg,#f0f7f6_0%,var(--color-background)_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%230f172a\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="lf-rise">
            <p className="mb-4 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              LectureFocus
            </p>
            <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.12] tracking-tight text-ink sm:text-5xl">
              Biết cần ôn gì trước — không cần biết phải hỏi AI điều gì.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              Bản đồ ôn tập xếp kiến thức theo mức ưu tiên kèm bằng chứng từ bài
              giảng, để bạn ôn đúng trọng tâm trong quỹ thời gian ngắn.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="lf-cta-pulse">
                <Link to="/tong-quan">
                  Bắt đầu ôn tập
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#cach-hoat-dong">Cách hoạt động</a>
              </Button>
            </div>
          </div>

          <div
            className="lf-rise lf-rise-delay relative overflow-hidden rounded-2xl border border-line/80 bg-surface/90 p-5 shadow-[0_20px_50px_-28px_rgba(15,118,110,0.45)] backdrop-blur-sm"
            aria-hidden
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-muted">
              Bản đồ ưu tiên
            </p>
            <div className="space-y-2.5">
              {tiers.map((item, i) => (
                <div
                  key={item.tier}
                  className={`rounded-xl border border-line/70 border-l-[3px] px-4 py-3 ${item.accent} ${item.soft}`}
                  style={{ animationDelay: `${120 + i * 80}ms` }}
                >
                  <p className="font-display text-lg font-semibold text-ink">
                    {item.tier}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{item.blurb}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">
              Mỗi khái niệm gắn trích dẫn trong transcript — kiểm chứng được.
            </p>
          </div>
        </div>
      </section>

      <section id="cach-hoat-dong" className="mx-auto max-w-6xl border-t border-line py-14">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Cách hoạt động
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            ['1', 'Chọn bài vừa học', 'Mở bản đồ ưu tiên ngay trên một màn ôn tập.'],
            ['2', 'Xem Trọng tâm trước', 'Lọc theo quỹ 15–60 phút nếu thời gian eo hẹp.'],
            ['3', 'Đối chiếu lời giảng', 'Mở khái niệm, chạm phần đánh dấu để xem đúng đoạn transcript.'],
          ].map(([n, title, desc]) => (
            <li key={n} className="relative pl-10">
              <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                {n}
              </span>
              <h3 className="font-display text-xl font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-1.5 text-base leading-relaxed text-muted">{desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
