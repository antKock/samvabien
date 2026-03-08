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

  // Real-time update every 60s when sleep is active
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

    // Sum completed sleep durations (value is in minutes)
    let totalMinutes = sleepEvents.reduce((sum, e) => sum + e.value, 0)

    // Add elapsed time if currently sleeping
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

  // Convert target from minutes to same unit as value for ProgressBar
  const totalMinutes = totalMs / 60_000
  const hasReachedTarget = totalMinutes >= target.min

  return (
    <div className="relative w-full rounded-[16px] bg-sleep-bg px-4 py-3">
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
            Sommeil aujourd&apos;hui
          </span>
          <div className="flex items-center gap-1">
            <span
              className="text-sleep-accent"
              style={{ fontSize: '26px', fontWeight: 800 }}
            >
              {formatDuration(totalMs)}
            </span>
            {hasReachedTarget && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--sleep-accent)"
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
            value={totalMinutes}
            target={target}
            avg={avg > 0 ? avg : undefined}
            accentColor="var(--sleep-accent)"
            trackColor="var(--track)"
          />
        </div>
      </button>

      {onPlusTap && (
        <button
          type="button"
          onClick={onPlusTap}
          className="absolute top-2 right-2 text-sleep-accent"
          style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1 }}
          aria-label="Importer crèche"
        >
          +
        </button>
      )}
    </div>
  )
}
