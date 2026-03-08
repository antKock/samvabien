import type { BabyEvent } from '@/types'

const MOMENT_HOURS: Record<string, number> = {
  morning: 12,
  noon: 13,
  afternoon: 17,
}

/**
 * Find the start of the current sleep cycle (last 'night' event = bedtime).
 * Only 'night' events start a new cycle — 'night-sleep' (re-endormissement)
 * continues the existing cycle, it doesn't reset it.
 * Falls back to midnight today if no bedtime found.
 */
export function currentCycleStart(events: BabyEvent[]): Date {
  // Sort by most recent first (by startedAt or createdAt)
  const sorted = [...events].sort((a, b) => {
    const aTime = a.startedAt ? new Date(a.startedAt).getTime() : new Date(a.createdAt).getTime()
    const bTime = b.startedAt ? new Date(b.startedAt).getTime() : new Date(b.createdAt).getTime()
    return bTime - aTime
  })

  for (const event of sorted) {
    if (event.type === 'night') {
      if (event.startedAt) {
        return new Date(event.startedAt)
      }
    }
  }

  // Fallback: midnight today
  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)
  return midnight
}

/**
 * Get event timestamp (started_at or moment-based approximation).
 */
function getEventTime(event: BabyEvent): Date | null {
  if (event.startedAt) return new Date(event.startedAt)
  if (event.moment && MOMENT_HOURS[event.moment] !== undefined) {
    const d = new Date(event.createdAt)
    d.setHours(MOMENT_HOURS[event.moment], 0, 0, 0)
    return d
  }
  return null
}

/**
 * Filter events that belong to the current cycle (>= cycleStart).
 * Returns in reverse chronological order (most recent first).
 */
export function eventsInCycle(events: BabyEvent[]): BabyEvent[] {
  const cycleStart = currentCycleStart(events)
  const cycleStartTime = cycleStart.getTime()

  return events
    .filter((event) => {
      const t = getEventTime(event)
      return t !== null && t.getTime() >= cycleStartTime
    })
    .sort((a, b) => {
      const aTime = getEventTime(a)!.getTime()
      const bTime = getEventTime(b)!.getTime()
      return bTime - aTime
    })
}

/**
 * Calculate rolling average over N days (excluding current cycle).
 * Contextualized to contextHour: only count events before that hour each day.
 * Always divides by `days` (not by days with data) — spec: "Moyenne = somme / 3".
 *
 * Note: type 'nap' includes both 'nap' and 'night' events (total sleep).
 */
export function rollingAverage(
  events: BabyEvent[],
  days: number,
  contextHour: number,
  type: 'bottle' | 'nap',
): number {
  if (days <= 0) return 0

  const now = new Date()
  const todayMidnight = new Date(now)
  todayMidnight.setHours(0, 0, 0, 0)

  let totalValue = 0

  for (let d = 1; d <= days; d++) {
    const dayStart = new Date(todayMidnight)
    dayStart.setDate(dayStart.getDate() - d)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(contextHour, 0, 0, 0)

    for (const event of events) {
      if (event.type !== type && !(type === 'nap' && event.type === 'night')) continue

      const t = getEventTime(event)
      if (!t) continue

      if (t.getTime() >= dayStart.getTime() && t.getTime() < dayEnd.getTime()) {
        totalValue += event.value
      }
    }
  }

  return Math.round(totalValue / days)
}
