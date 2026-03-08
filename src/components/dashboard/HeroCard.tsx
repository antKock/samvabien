'use client'

import { useHousehold } from '@/hooks/useHousehold'
import { useSleepChrono } from '@/hooks/useSleepChrono'
import { getHeroDisplay } from '@/lib/sleep-state-machine'
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

  // Use live duration from useSleepChrono instead of the one-shot duration from getHeroDisplay
  const label = liveDuration && since
    ? `${display.baseLabel} depuis ${liveDuration}`
    : display.label

  return (
    <button
      onClick={onTap}
      className="w-full bg-surface rounded-[20px] p-5 text-center cursor-pointer"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="text-[32px] leading-none mb-2">{display.emoji}</div>
      <div
        className="text-hero-text"
        style={{ fontSize: '20px', fontWeight: 800 }}
      >
        {label}
      </div>
      {display.subtitle && (
        <div
          className="text-text-sec mt-1"
          style={{ fontSize: '12px', fontWeight: 600 }}
        >
          {display.subtitle}
        </div>
      )}
    </button>
  )
}
