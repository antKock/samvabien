import { describe, it, expect } from 'vitest'
import { DEMO_PROFILE, DEMO_EVENTS } from '../demo-data'

describe('demo-data', () => {
  describe('DEMO_PROFILE', () => {
    it('has baby name Léo', () => {
      expect(DEMO_PROFILE.babyName).toBe('Léo')
    })

    it('has sleepState awake', () => {
      expect(DEMO_PROFILE.sleepState).toBe('awake')
    })

    it('has weight 62 hg', () => {
      expect(DEMO_PROFILE.babyWeightHg).toBe(62)
    })

    it('has joinCode DEMO-0000', () => {
      expect(DEMO_PROFILE.joinCode).toBe('DEMO-0000')
    })

    it('has a DOB approximately 4 months ago', () => {
      const dob = new Date(DEMO_PROFILE.babyDob)
      const now = new Date()
      const diffMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
      expect(diffMonths).toBeGreaterThanOrEqual(3)
      expect(diffMonths).toBeLessThanOrEqual(5)
    })
  })

  describe('DEMO_EVENTS', () => {
    it('contains 7 events', () => {
      expect(DEMO_EVENTS).toHaveLength(7)
    })

    it('has a coherent history: night + bottles + naps', () => {
      const types = DEMO_EVENTS.map((e) => e.type)
      expect(types.filter((t) => t === 'night')).toHaveLength(1)
      expect(types.filter((t) => t === 'bottle')).toHaveLength(4)
      expect(types.filter((t) => t === 'nap')).toHaveLength(2)
    })

    it('all events have stable demo- IDs', () => {
      for (const event of DEMO_EVENTS) {
        expect(event.id).toMatch(/^demo-\d+$/)
      }
    })

    it('all events reference the demo profile', () => {
      for (const event of DEMO_EVENTS) {
        expect(event.profileId).toBe(DEMO_PROFILE.id)
      }
    })

    it('has dates relative to today (not hardcoded)', () => {
      const today = new Date()
      const todayStr = today.toISOString().slice(0, 10)
      const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10)

      for (const event of DEMO_EVENTS) {
        const dateStr = (event.startedAt ?? event.createdAt).slice(0, 10)
        expect([todayStr, yesterdayStr]).toContain(dateStr)
      }
    })

    it('has an afternoon crèche event without startedAt', () => {
      const creche = DEMO_EVENTS.find((e) => e.moment === 'afternoon')
      expect(creche).toBeDefined()
      expect(creche!.startedAt).toBeNull()
      expect(creche!.type).toBe('bottle')
      expect(creche!.value).toBe(120)
    })
  })
})
