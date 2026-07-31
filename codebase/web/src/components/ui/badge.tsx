import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Tier } from '@/types/lecture'
import { TIER_LABEL } from '@/types/lecture'

const tierClass: Record<Tier, string> = {
  core: 'bg-primary-soft text-primary',
  important: 'bg-important-soft text-important',
  supporting: 'bg-supporting-soft text-supporting',
}

export function TierBadge({
  tier,
  className,
}: {
  tier: Tier
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-sm font-bold uppercase tracking-wide',
        tierClass[tier],
        className,
      )}
    >
      {TIER_LABEL[tier]}
    </span>
  )
}

export function Chip({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-1 text-sm font-semibold text-ink',
        className,
      )}
    >
      {children}
    </span>
  )
}
