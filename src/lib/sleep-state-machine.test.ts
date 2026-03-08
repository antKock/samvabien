import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getNextTransitions, getTheme, getHeroDisplay } from './sleep-state-machine'
import type { SleepState } from '@/types'

describe('getNextTransitions', () => {
  describe('awake state', () => {
    it('6h → sieste primary, coucher alt', () => {
      const r = getNextTransitions('awake', 6)
      expect(r.primary.targetState).toBe('nap')
      expect(r.primary.emoji).toBe('😴')
      expect(r.alt?.targetState).toBe('night')
    })

    it('14h (hors zone ambiguïté) → sieste primary, coucher alt', () => {
      const r = getNextTransitions('awake', 14)
      expect(r.primary.targetState).toBe('nap')
      expect(r.alt?.targetState).toBe('night')
    })

    it('16h59 (= 16) → sieste primary', () => {
      const r = getNextTransitions('awake', 16)
      expect(r.primary.targetState).toBe('nap')
    })

    it('17h (borne inclusive) → coucher primary, sieste alt', () => {
      const r = getNextTransitions('awake', 17)
      expect(r.primary.targetState).toBe('night')
      expect(r.primary.emoji).toBe('🌙')
      expect(r.alt?.targetState).toBe('nap')
    })

    it('18h → coucher primary, sieste alt', () => {
      const r = getNextTransitions('awake', 18)
      expect(r.primary.targetState).toBe('night')
      expect(r.alt?.targetState).toBe('nap')
    })

    it('22h → coucher primary, sieste alt', () => {
      const r = getNextTransitions('awake', 22)
      expect(r.primary.targetState).toBe('night')
      expect(r.alt?.targetState).toBe('nap')
    })

    it('23h → coucher primary, pas d\'alt', () => {
      const r = getNextTransitions('awake', 23)
      expect(r.primary.targetState).toBe('night')
      expect(r.alt).toBeUndefined()
    })

    it('0h → coucher primary, pas d\'alt', () => {
      const r = getNextTransitions('awake', 0)
      expect(r.primary.targetState).toBe('night')
      expect(r.alt).toBeUndefined()
    })

    it('5h → coucher primary, pas d\'alt', () => {
      const r = getNextTransitions('awake', 5)
      expect(r.primary.targetState).toBe('night')
      expect(r.alt).toBeUndefined()
    })
  })

  describe('nap state', () => {
    it('returns fin de sieste, no alt', () => {
      const r = getNextTransitions('nap', 15)
      expect(r.primary.targetState).toBe('awake')
      expect(r.primary.emoji).toBe('☀️')
      expect(r.primary.label).toBe('Fin de sieste')
      expect(r.alt).toBeUndefined()
    })
  })

  describe('night state', () => {
    it('19h → réveil nocturne primary, réveil matin alt', () => {
      const r = getNextTransitions('night', 19)
      expect(r.primary.targetState).toBe('night-wake')
      expect(r.alt?.targetState).toBe('awake')
    })

    it('2h → réveil nocturne primary, réveil matin alt', () => {
      const r = getNextTransitions('night', 2)
      expect(r.primary.targetState).toBe('night-wake')
      expect(r.alt?.targetState).toBe('awake')
    })

    it('5h → réveil matin primary, réveil nocturne alt', () => {
      const r = getNextTransitions('night', 5)
      expect(r.primary.targetState).toBe('awake')
      expect(r.primary.emoji).toBe('☀️')
      expect(r.alt?.targetState).toBe('night-wake')
    })

    it('6h → réveil matin primary, réveil nocturne alt', () => {
      const r = getNextTransitions('night', 6)
      expect(r.primary.targetState).toBe('awake')
      expect(r.alt?.targetState).toBe('night-wake')
    })

    it('7h → réveil matin primary, réveil nocturne alt', () => {
      const r = getNextTransitions('night', 7)
      expect(r.primary.targetState).toBe('awake')
      expect(r.alt?.targetState).toBe('night-wake')
    })

    it('8h → réveil matin primary, pas d\'alt', () => {
      const r = getNextTransitions('night', 8)
      expect(r.primary.targetState).toBe('awake')
      expect(r.alt).toBeUndefined()
    })

    it('10h → réveil matin primary, pas d\'alt', () => {
      const r = getNextTransitions('night', 10)
      expect(r.primary.targetState).toBe('awake')
      expect(r.alt).toBeUndefined()
    })
  })

  describe('night-sleep state (same as night)', () => {
    it('2h → réveil nocturne primary, réveil matin alt', () => {
      const r = getNextTransitions('night-sleep', 2)
      expect(r.primary.targetState).toBe('night-wake')
      expect(r.alt?.targetState).toBe('awake')
    })

    it('6h → réveil matin primary, réveil nocturne alt', () => {
      const r = getNextTransitions('night-sleep', 6)
      expect(r.primary.targetState).toBe('awake')
      expect(r.alt?.targetState).toBe('night-wake')
    })

    it('9h → réveil matin primary, pas d\'alt', () => {
      const r = getNextTransitions('night-sleep', 9)
      expect(r.primary.targetState).toBe('awake')
      expect(r.alt).toBeUndefined()
    })
  })

  describe('night-wake state', () => {
    it('returns rendormi, no alt', () => {
      const r = getNextTransitions('night-wake', 3)
      expect(r.primary.targetState).toBe('night-sleep')
      expect(r.primary.emoji).toBe('🌙')
      expect(r.primary.label).toBe('Rendormi')
      expect(r.alt).toBeUndefined()
    })
  })
})

describe('getTheme', () => {
  it('awake → day', () => {
    expect(getTheme('awake')).toBe('day')
  })

  const nightStates: SleepState[] = ['nap', 'night', 'night-wake', 'night-sleep']
  nightStates.forEach((state) => {
    it(`${state} → night`, () => {
      expect(getTheme(state)).toBe('night')
    })
  })
})

describe('getHeroDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Use a known local time: 2026-03-08 at 16:14 local
    const now = new Date(2026, 2, 8, 16, 14, 0)
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('awake with since → shows duration, subtitle, and baseLabel', () => {
    const since = new Date(2026, 2, 8, 14, 0, 0).toISOString()
    const result = getHeroDisplay('awake', since, null)
    expect(result.emoji).toBe('☀️')
    expect(result.baseLabel).toBe('Éveillé')
    expect(result.label).toBe('Éveillé depuis 2h14')
    expect(result.duration).toBe('2h14')
    expect(result.subtitle).toBe('Réveillé à 14h00')
  })

  it('nap with since → shows duration and baseLabel', () => {
    const since = new Date(2026, 2, 8, 15, 29, 0).toISOString()
    const result = getHeroDisplay('nap', since, null)
    expect(result.emoji).toBe('😴')
    expect(result.baseLabel).toBe('Dort')
    expect(result.label).toBe('Dort depuis 45min')
    expect(result.duration).toBe('45min')
    expect(result.subtitle).toBe('Endormi à 15h29')
  })

  it('awake with moment (crèche import) → no duration, no subtitle, baseLabel present', () => {
    const result = getHeroDisplay('awake', null, 'morning')
    expect(result.emoji).toBe('☀️')
    expect(result.baseLabel).toBe('Éveillé')
    expect(result.label).toBe('Éveillé')
    expect(result.duration).toBeNull()
    expect(result.subtitle).toBeNull()
  })

  it('nap with moment (crèche import) → no duration, no subtitle', () => {
    const result = getHeroDisplay('nap', null, 'afternoon')
    expect(result.emoji).toBe('😴')
    expect(result.label).toBe('Dort')
    expect(result.duration).toBeNull()
    expect(result.subtitle).toBeNull()
  })

  it('night state shows Dort', () => {
    const since = new Date(2026, 2, 8, 15, 14, 0).toISOString()
    const result = getHeroDisplay('night', since, null)
    expect(result.emoji).toBe('🌙')
    expect(result.label).toBe('Dort depuis 1h00')
  })

  it('night-wake state shows Réveillé', () => {
    const since = new Date(2026, 2, 8, 16, 10, 0).toISOString()
    const result = getHeroDisplay('night-wake', since, null)
    expect(result.emoji).toBe('🫣')
    expect(result.label).toBe('Réveillé depuis 4min')
    expect(result.subtitle).toBe('Réveillé à 16h10')
  })
})
