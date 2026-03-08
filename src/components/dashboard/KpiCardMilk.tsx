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
    <div className="relative w-full" style={{ borderRadius: 18, padding: '11px 11px 11px 14px', background: 'var(--milk-bg)' }}>
      <button
        type="button"
        onClick={onTap}
        className="w-full text-left"
        style={{ border: 'none', cursor: 'pointer', background: 'none' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16 }}>🍼</span>
          <div className="flex-1 min-w-0">
            <span
              className="text-milk-icon"
              style={{ fontSize: 9, fontWeight: 600 }}
            >
              Lait aujourd&apos;hui
            </span>
            <div className="flex items-center gap-1">
              <span
                className="text-text"
                style={{ fontSize: 22, fontWeight: 800 }}
              >
                {totalMl} mL
              </span>
              {hasReachedTarget && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'var(--milk-in-range)',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          </div>

          {onPlusTap && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPlusTap() }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: 'none',
                background: 'color-mix(in srgb, var(--milk-icon) 8%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Importer crèche"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5V9" stroke="var(--milk-icon)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4.5 6.5L7 9L9.5 6.5" stroke="var(--milk-icon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 10.5V11.5C2 12 2.5 12.5 3 12.5H11C11.5 12.5 12 12 12 11.5V10.5" stroke="var(--milk-icon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="mt-2">
          <ProgressBar
            value={totalMl}
            target={target}
            avg={avg > 0 ? avg : undefined}
            accentColor="var(--milk-accent)"
            trackColor="var(--track)"
            category="milk"
          />
        </div>
      </button>
    </div>
  )
}
