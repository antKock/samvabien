'use client'

import { useMemo, useState, useEffect } from 'react'
import { useHousehold } from '@/hooks/useHousehold'
import { eventsInCycle, rollingAverage } from '@/lib/cycle-window'
import { getSleepTarget } from '@/lib/medical-targets'
import { formatDuration } from '@/lib/format'
import ProgressBar from '@/components/ui/ProgressBar'

interface KpiCardSleepProps {
  onTap?: () => void
  onPlusTap?: () => void
}

export default function KpiCardSleep({ onTap, onPlusTap }: KpiCardSleepProps) {
  const { profile, events } = useHousehold()
  const [now, setNow] = useState(() => Date.now())

  const isSleeping =
    profile?.sleepState === 'nap' ||
    profile?.sleepState === 'night' ||
    profile?.sleepState === 'night-sleep'

  useEffect(() => {
    if (!isSleeping) return
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [isSleeping])

  const { totalMs, target, avg } = useMemo(() => {
    if (!profile) return { totalMs: 0, target: { min: 0, max: 0 }, avg: 0 }

    const cycleEvents = eventsInCycle(events)
    const sleepEvents = cycleEvents.filter(
      (e) => e.type === 'nap' || e.type === 'night' || e.type === 'night-sleep',
    )

    let totalMinutes = sleepEvents.reduce((sum, e) => sum + e.value, 0)

    if (isSleeping && profile.sleepStateSince) {
      const elapsedMs = now - new Date(profile.sleepStateSince).getTime()
      totalMinutes += elapsedMs / 60_000
    }

    const sleepTarget = getSleepTarget(profile.babyDob)
    const currentHour = new Date().getHours()
    const rollingAvg = rollingAverage(events, 3, currentHour, 'nap')

    return {
      totalMs: Math.floor(totalMinutes) * 60_000,
      target: sleepTarget,
      avg: rollingAvg,
    }
  }, [profile, events, isSleeping, now])

  if (!profile) return null

  const totalMinutes = totalMs / 60_000
  const hasReachedTarget = totalMinutes >= target.min

  return (
    <div className="relative w-full" style={{ borderRadius: 18, padding: '11px 11px 11px 14px', background: 'var(--sleep-bg)' }}>
      <button
        type="button"
        onClick={onTap}
        className="w-full text-left"
        style={{ border: 'none', cursor: 'pointer', background: 'none' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16 }}>😴</span>
          <div className="flex-1 min-w-0">
            <span
              className="text-sleep-icon"
              style={{ fontSize: 9, fontWeight: 600 }}
            >
              Sommeil aujourd&apos;hui
            </span>
            <div className="flex items-center gap-1">
              <span
                className="text-text"
                style={{ fontSize: 22, fontWeight: 800 }}
              >
                {formatDuration(totalMs)}
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
                    background: 'var(--sleep-in-range)',
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
                background: 'color-mix(in srgb, var(--sleep-icon) 8%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Importer crèche"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5V9" stroke="var(--sleep-icon)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4.5 6.5L7 9L9.5 6.5" stroke="var(--sleep-icon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 10.5V11.5C2 12 2.5 12.5 3 12.5H11C11.5 12.5 12 12 12 11.5V10.5" stroke="var(--sleep-icon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="mt-2">
          <ProgressBar
            value={totalMinutes}
            target={target}
            avg={avg > 0 ? avg : undefined}
            accentColor="var(--sleep-accent)"
            trackColor="var(--track)"
            category="sleep"
          />
        </div>
      </button>
    </div>
  )
}
