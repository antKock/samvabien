'use client'

import { useHousehold } from '@/hooks/useHousehold'
import { useSleepChrono } from '@/hooks/useSleepChrono'
import { getHeroDisplay, getTheme } from '@/lib/sleep-state-machine'
import type { SleepState } from '@/types'

interface HeroCardProps {
  onTap: () => void
}

export default function HeroCard({ onTap }: HeroCardProps) {
  const { profile } = useHousehold()

  const sleepState = (profile?.sleepState ?? 'awake') as SleepState
  const since = profile?.sleepStateSince ?? null
  const moment = profile?.sleepStateMoment ?? null

  const liveDuration = useSleepChrono(since)
  const display = getHeroDisplay(sleepState, since, moment)
  const theme = getTheme(sleepState)

  const hasDuration = !!(liveDuration && since)
  const isDay = theme === 'day'

  // Gradient background
  const gradient = isDay
    ? 'linear-gradient(160deg, color-mix(in srgb, var(--hero-g1) 93%, transparent), var(--hero-g3))'
    : 'linear-gradient(155deg, var(--hero-g1), var(--hero-g3))'

  // Triple shadow
  const shadow = isDay
    ? '0 2px 6px color-mix(in srgb, var(--hero-g3) 19%, transparent), 0 8px 20px color-mix(in srgb, var(--hero-g3) 15%, transparent), 0 16px 40px color-mix(in srgb, var(--hero-g3) 8%, transparent)'
    : '0 2px 6px color-mix(in srgb, var(--hero-g3) 21%, transparent), 0 8px 22px color-mix(in srgb, var(--hero-g3) 15%, transparent), 0 18px 44px color-mix(in srgb, var(--hero-g3) 9%, transparent)'

  // Text colors
  const textColor = isDay ? 'var(--sleep-bg)' : 'var(--hero-text)'
  const subtitleColor = isDay ? 'color-mix(in srgb, var(--sleep-bg) 65%, transparent)' : 'var(--hero-text)'

  return (
    <button
      onClick={onTap}
      className="w-full text-center cursor-pointer"
      style={{
        background: gradient,
        boxShadow: shadow,
        borderRadius: 22,
        padding: hasDuration ? '20px 18px 16px' : '24px 18px 22px',
        transform: 'translateY(-1px)',
        border: 'none',
      }}
    >
      <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 3 }}>{display.emoji}</div>
      {hasDuration ? (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: textColor }}>
            {display.baseLabel} depuis
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px', color: textColor }}>
            {liveDuration}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>
          {display.label}
        </div>
      )}
      {display.subtitle && (
        <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2, color: subtitleColor }}>
          {display.subtitle}
        </div>
      )}
    </button>
  )
}
