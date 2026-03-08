import { describe, it, expect } from 'vitest'
import { CreateProfileSchema, UpdateProfileSchema } from '../profile'

describe('CreateProfileSchema', () => {
  it('valide des données correctes', () => {
    const result = CreateProfileSchema.safeParse({
      babyName: 'Léo',
      babyDob: '2025-06-15',
      babyWeightHg: 35,
    })
    expect(result.success).toBe(true)
  })

  it('rejette un prénom vide', () => {
    const result = CreateProfileSchema.safeParse({
      babyName: '',
      babyDob: '2025-06-15',
      babyWeightHg: 35,
    })
    expect(result.success).toBe(false)
  })

  it('rejette un prénom trop long', () => {
    const result = CreateProfileSchema.safeParse({
      babyName: 'a'.repeat(31),
      babyDob: '2025-06-15',
      babyWeightHg: 35,
    })
    expect(result.success).toBe(false)
  })

  it('rejette un poids hors limites', () => {
    expect(
      CreateProfileSchema.safeParse({
        babyName: 'Léo',
        babyDob: '2025-06-15',
        babyWeightHg: 10,
      }).success
    ).toBe(false)

    expect(
      CreateProfileSchema.safeParse({
        babyName: 'Léo',
        babyDob: '2025-06-15',
        babyWeightHg: 160,
      }).success
    ).toBe(false)
  })

  it('rejette une date future', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const result = CreateProfileSchema.safeParse({
      babyName: 'Léo',
      babyDob: futureDate.toISOString().split('T')[0],
      babyWeightHg: 35,
    })
    expect(result.success).toBe(false)
  })

  it('trim le prénom', () => {
    const result = CreateProfileSchema.safeParse({
      babyName: '  Léo  ',
      babyDob: '2025-06-15',
      babyWeightHg: 35,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.babyName).toBe('Léo')
    }
  })
})

describe('UpdateProfileSchema', () => {
  it('valide une mise à jour du prénom seul', () => {
    const result = UpdateProfileSchema.safeParse({ babyName: 'Mia' })
    expect(result.success).toBe(true)
  })

  it('valide une mise à jour du poids seul', () => {
    const result = UpdateProfileSchema.safeParse({ babyWeightHg: 45 })
    expect(result.success).toBe(true)
  })

  it('valide une mise à jour de la date seule', () => {
    const result = UpdateProfileSchema.safeParse({ babyDob: '2025-06-15' })
    expect(result.success).toBe(true)
  })

  it('valide une mise à jour du weightReminder', () => {
    const result = UpdateProfileSchema.safeParse({ weightReminder: false })
    expect(result.success).toBe(true)
  })

  it('valide une mise à jour de plusieurs champs', () => {
    const result = UpdateProfileSchema.safeParse({
      babyName: 'Mia',
      babyWeightHg: 50,
    })
    expect(result.success).toBe(true)
  })

  it('rejette un objet vide (aucun champ)', () => {
    const result = UpdateProfileSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejette un prénom vide', () => {
    const result = UpdateProfileSchema.safeParse({ babyName: '' })
    expect(result.success).toBe(false)
  })

  it('rejette un poids hors limites', () => {
    expect(UpdateProfileSchema.safeParse({ babyWeightHg: 10 }).success).toBe(false)
    expect(UpdateProfileSchema.safeParse({ babyWeightHg: 160 }).success).toBe(false)
  })

  it('rejette une date future', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const result = UpdateProfileSchema.safeParse({
      babyDob: futureDate.toISOString().split('T')[0],
    })
    expect(result.success).toBe(false)
  })
})
