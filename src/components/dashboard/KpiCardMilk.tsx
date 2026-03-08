'use client'

import { useMemo } from 'react'
import { useHousehold } from '@/hooks/useHousehold'
import { eventsInCycle, rollingAverage } from '@/lib/cycle-window'
import { getMilkTarget } from '@/lib/medical-targets'
import ProgressBar from '@/components/ui/ProgressBar'

interface KpiCardMilkProps {
  onTap?: () => void
  onPlusTap?: () => void
}

export default function KpiCardMilk({ onTap, onPlusTap }: KpiCardMilkProps) {
  const { profile, events } = useHousehold()

  const { totalMl, target, avg } = useMemo(() => {
    if (!profile) return { totalMl: 0, target: { min: 0, max: 0 }, avg: 0 }

    const cycleEvents = eventsInCycle(events)
    const bottles = cycleEvents.filter((e) => e.type === 'bottle')
    const total = bottles.reduce((sum, e) => sum + e.value, 0)

    const milkTarget = getMilkTarget(profile.babyWeightHg)
    const currentHour = new Date().getHours()
    const rollingAvg = rollingAverage(events, 3, currentHour, 'bottle')

    return { totalMl: total, target: milkTarget, avg: rollingAvg }
  }, [profile, events])

  if (!profile) return null

  const hasReachedTarget = totalMl >= target.min

  return (
    <div className="relative w-full rounded-[16px] bg-milk-bg px-4 py-3">
      <button
        type="button"
        onClick={onTap}
        className="w-full text-left"
        style={{ border: 'none', cursor: 'pointer', background: 'none' }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-text-sec"
            style={{ fontSize: '11px', fontWeight: 600 }}
          >
            Lait aujourd&apos;hui
          </span>
          <div className="flex items-center gap-1">
            <span
              className="text-milk-accent"
              style={{ fontSize: '26px', fontWeight: 800 }}
            >
              {totalMl} mL
            </span>
            {hasReachedTarget && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--milk-accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>

        <div className="mt-2">
          <ProgressBar
            value={totalMl}
            target={target}
            avg={avg > 0 ? avg : undefined}
            accentColor="var(--milk-accent)"
            trackColor="var(--track)"
          />
        </div>
      </button>

      {onPlusTap && (
        <button
          type="button"
          onClick={onPlusTap}
          className="absolute top-2 right-2 text-milk-accent"
          style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1 }}
          aria-label="Importer crèche"
        >
          +
        </button>
      )}
    </div>
  )
}
