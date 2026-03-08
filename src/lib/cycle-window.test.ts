import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { currentCycleStart, eventsInCycle, rollingAverage } from './cycle-window'
import type { BabyEvent } from '@/types'

function makeEvent(overrides: Partial<BabyEvent> & { type: string }): BabyEvent {
  return {
    id: Math.random().toString(36),
    profileId: 'p1',
    type: overrides.type as BabyEvent['type'],
    value: overrides.value ?? 0,
    startedAt: overrides.startedAt ?? null,
    endedAt: overrides.endedAt ?? null,
    moment: overrides.moment ?? null,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  }
}

describe('currentCycleStart', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 8, 14, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns bedtime timestamp when night event exists', () => {
    const events: BabyEvent[] = [
      makeEvent({
        type: 'night',
        startedAt: new Date(2026, 2, 7, 19, 30, 0).toISOString(),
        createdAt: new Date(2026, 2, 7, 19, 30, 0).toISOString(),
      }),
      makeEvent({
        type: 'nap',
        startedAt: new Date(2026, 2, 7, 13, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 7, 13, 0, 0).toISOString(),
      }),
    ]

    const result = currentCycleStart(events)
    expect(result.getHours()).toBe(19)
    expect(result.getMinutes()).toBe(30)
  })

  it('returns midnight today when no night event exists', () => {
    const events: BabyEvent[] = [
      makeEvent({
        type: 'nap',
        startedAt: new Date(2026, 2, 7, 13, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 7, 13, 0, 0).toISOString(),
      }),
    ]

    const result = currentCycleStart(events)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getDate()).toBe(8) // today
  })

  it('returns midnight today when events array is empty', () => {
    const result = currentCycleStart([])
    expect(result.getHours()).toBe(0)
    expect(result.getDate()).toBe(8)
  })
})

describe('eventsInCycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 8, 14, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('filters events before cycle start', () => {
    const bedtime = new Date(2026, 2, 7, 19, 30, 0)
    const events: BabyEvent[] = [
      makeEvent({
        type: 'night',
        startedAt: bedtime.toISOString(),
        createdAt: bedtime.toISOString(),
      }),
      makeEvent({
        type: 'nap',
        startedAt: new Date(2026, 2, 7, 13, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 7, 13, 0, 0).toISOString(),
      }),
      makeEvent({
        type: 'nap',
        startedAt: new Date(2026, 2, 8, 10, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 8, 10, 0, 0).toISOString(),
      }),
    ]

    const result = eventsInCycle(events)
    // nap at 13h is before bedtime at 19h30 → excluded
    // night at 19h30 → included (= cycle start)
    // nap at 10h today → included
    expect(result).toHaveLength(2)
  })

  it('returns events in reverse chronological order', () => {
    const events: BabyEvent[] = [
      makeEvent({
        type: 'night',
        startedAt: new Date(2026, 2, 7, 19, 30, 0).toISOString(),
        createdAt: new Date(2026, 2, 7, 19, 30, 0).toISOString(),
      }),
      makeEvent({
        type: 'nap',
        startedAt: new Date(2026, 2, 8, 10, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 8, 10, 0, 0).toISOString(),
      }),
    ]

    const result = eventsInCycle(events)
    expect(result[0].type).toBe('nap') // 10h today = more recent
    expect(result[1].type).toBe('night') // 19h30 yesterday
  })

  it('handles crèche events with moment', () => {
    const events: BabyEvent[] = [
      makeEvent({
        type: 'nap',
        moment: 'afternoon',
        createdAt: new Date(2026, 2, 8, 12, 0, 0).toISOString(),
      }),
    ]

    // No night event → cycle starts at midnight today
    // afternoon → 15h → after midnight → included
    const result = eventsInCycle(events)
    expect(result).toHaveLength(1)
  })
})

describe('rollingAverage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 8, 14, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calculates average over 3 days with contextHour', () => {
    const events: BabyEvent[] = [
      // Day J-1 (Mar 7) before 14h
      makeEvent({
        type: 'nap',
        value: 60,
        startedAt: new Date(2026, 2, 7, 10, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 7, 10, 0, 0).toISOString(),
      }),
      // Day J-2 (Mar 6) before 14h
      makeEvent({
        type: 'nap',
        value: 90,
        startedAt: new Date(2026, 2, 6, 11, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 6, 11, 0, 0).toISOString(),
      }),
      // Day J-3 (Mar 5) before 14h
      makeEvent({
        type: 'nap',
        value: 45,
        startedAt: new Date(2026, 2, 5, 9, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 5, 9, 0, 0).toISOString(),
      }),
    ]

    const result = rollingAverage(events, 3, 14, 'nap')
    expect(result).toBe(65) // (60+90+45)/3 = 65
  })

  it('returns 0 when no matching events', () => {
    const result = rollingAverage([], 3, 14, 'bottle')
    expect(result).toBe(0)
  })

  it('divides by total days requested, not days with data', () => {
    const events: BabyEvent[] = [
      // Only J-1 has data, J-2 and J-3 have nothing
      makeEvent({
        type: 'nap',
        value: 90,
        startedAt: new Date(2026, 2, 7, 10, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 7, 10, 0, 0).toISOString(),
      }),
    ]

    const result = rollingAverage(events, 3, 14, 'nap')
    expect(result).toBe(30) // 90/3 = 30, not 90/1
  })

  it('excludes events after contextHour', () => {
    const events: BabyEvent[] = [
      makeEvent({
        type: 'nap',
        value: 60,
        startedAt: new Date(2026, 2, 7, 10, 0, 0).toISOString(),
        createdAt: new Date(2026, 2, 7, 10, 0, 0).toISOString(),
      }),
      makeEvent({
        type: 'nap',
        value: 120,
        startedAt: new Date(2026, 2, 7, 16, 0, 0).toISOString(), // After 14h context
        createdAt: new Date(2026, 2, 7, 16, 0, 0).toISOString(),
      }),
    ]

    const result = rollingAverage(events, 1, 14, 'nap')
    expect(result).toBe(60) // Only the 10h event counts
  })
})
