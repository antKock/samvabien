import { describe, it, expect, vi, afterEach } from 'vitest'
import { getNextReminderDate, shouldShowWeightReminder } from './weight-reminder'

describe('getNextReminderDate', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('retourne jour+10 du mois courant si pas encore passé', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 1)) // 1 mars 2026

    const result = getNextReminderDate('2025-12-15') // né le 15 → rappel le 25
    expect(result.getDate()).toBe(25)
    expect(result.getMonth()).toBe(2) // mars
  })

  it('retourne le mois suivant si le jour est passé', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 28)) // 28 mars 2026

    const result = getNextReminderDate('2025-12-15') // né le 15 → rappel le 25
    expect(result.getMonth()).toBe(3) // avril
    expect(result.getDate()).toBe(25)
  })

  it('clamp au dernier jour du mois pour février (né le 30)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 1)) // 1 février 2026

    const result = getNextReminderDate('2025-06-30') // né le 30 → rappel le 40 → clamp
    expect(result.getMonth()).toBe(1) // février
    expect(result.getDate()).toBe(28) // dernier jour de fév 2026
  })

  it('clamp pour un bébé né le 31', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 1)) // 1 février 2026

    const result = getNextReminderDate('2025-07-31') // 31+10=41 → clamp à 28
    expect(result.getDate()).toBe(28)
  })

  it('bébé né le 1er → rappel le 11', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 5)) // 5 mars

    const result = getNextReminderDate('2025-08-01') // 1+10=11
    expect(result.getDate()).toBe(11)
    expect(result.getMonth()).toBe(2)
  })
})

describe('shouldShowWeightReminder', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('retourne false si weightReminder est désactivé', () => {
    expect(shouldShowWeightReminder('2025-12-15', false)).toBe(false)
  })

  it('retourne true si la date de rappel est aujourd\'hui', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 25)) // 25 mars

    expect(shouldShowWeightReminder('2025-12-15', true)).toBe(true) // 15+10=25
  })

  it('retourne true si la date de rappel est passée ce mois', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 28)) // 28 mars

    expect(shouldShowWeightReminder('2025-12-15', true)).toBe(true)
  })

  it('retourne false si la date de rappel n\'est pas encore arrivée', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 20)) // 20 mars

    expect(shouldShowWeightReminder('2025-12-15', true)).toBe(false) // rappel le 25, pas encore arrivé
  })
})
