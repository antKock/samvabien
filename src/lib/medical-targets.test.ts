import { describe, it, expect } from 'vitest'
import { getMilkTarget, getSleepTarget, getMilkRange } from './medical-targets'

describe('getMilkTarget', () => {
  it('returns correct range for 4.2 kg baby (weightHg=42)', () => {
    const result = getMilkTarget(42)
    expect(result.min).toBe(504) // 4.2 * 120
    expect(result.max).toBe(756) // 4.2 * 180
  })

  it('returns correct range for newborn ~3 kg (weightHg=30)', () => {
    const result = getMilkTarget(30)
    expect(result.min).toBe(360) // 3.0 * 120
    expect(result.max).toBe(540) // 3.0 * 180
  })

  it('returns correct range for larger baby ~8 kg (weightHg=80)', () => {
    const result = getMilkTarget(80)
    expect(result.min).toBe(960) // 8.0 * 120
    expect(result.max).toBe(1440) // 8.0 * 180
  })
})

describe('getSleepTarget', () => {
  it('returns 12–15h for a 4-month-old baby (in minutes)', () => {
    const dob = new Date()
    dob.setMonth(dob.getMonth() - 4)
    const result = getSleepTarget(dob.toISOString())
    expect(result.min).toBe(12 * 60) // 720 min
    expect(result.max).toBe(15 * 60) // 900 min
  })

  it('returns 14–17h for newborn (< 1 month)', () => {
    const dob = new Date()
    dob.setDate(dob.getDate() - 10)
    const result = getSleepTarget(dob.toISOString())
    expect(result.min).toBe(14 * 60) // 840 min
    expect(result.max).toBe(17 * 60) // 1020 min
  })

  it('returns 14–17h for 2-month-old baby', () => {
    const dob = new Date()
    dob.setMonth(dob.getMonth() - 2)
    const result = getSleepTarget(dob.toISOString())
    expect(result.min).toBe(14 * 60)
    expect(result.max).toBe(17 * 60)
  })

  it('returns 11–14h for 14-month-old baby', () => {
    const dob = new Date()
    dob.setMonth(dob.getMonth() - 14)
    const result = getSleepTarget(dob.toISOString())
    expect(result.min).toBe(11 * 60) // 660 min
    expect(result.max).toBe(14 * 60) // 840 min
  })
})

describe('getMilkRange', () => {
  it('returns slider bounds for 4.2 kg baby', () => {
    const result = getMilkRange(42)
    expect(result.min).toBe(30)
    expect(result.max).toBe(210) // 4.2 * 50 = 210, within [150, 350]
    expect(result.step).toBe(10)
  })

  it('clamps max to 150 for very small baby (2 kg)', () => {
    const result = getMilkRange(20)
    expect(result.min).toBe(30)
    expect(result.max).toBe(150) // 2.0 * 50 = 100, clamped to 150
    expect(result.step).toBe(10)
  })

  it('clamps max to 350 for large baby (9 kg)', () => {
    const result = getMilkRange(90)
    expect(result.min).toBe(30)
    expect(result.max).toBe(350) // 9.0 * 50 = 450, clamped to 350
    expect(result.step).toBe(10)
  })
})
