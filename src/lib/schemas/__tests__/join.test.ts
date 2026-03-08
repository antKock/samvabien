import { describe, it, expect } from 'vitest'
import { JoinSchema } from '../join'

describe('JoinSchema', () => {
  it('valide un code correct avec tiret', () => {
    const result = JoinSchema.safeParse({ joinCode: 'OLVR-4821' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.joinCode).toBe('OLVR-4821')
    }
  })

  it('valide un code sans tiret', () => {
    const result = JoinSchema.safeParse({ joinCode: 'OLVR4821' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.joinCode).toBe('OLVR-4821')
    }
  })

  it('normalise en majuscules', () => {
    const result = JoinSchema.safeParse({ joinCode: 'olvr-4821' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.joinCode).toBe('OLVR-4821')
    }
  })

  it('rejette un code trop court', () => {
    const result = JoinSchema.safeParse({ joinCode: 'OLV-482' })
    expect(result.success).toBe(false)
  })

  it('rejette un code avec mauvais format', () => {
    const result = JoinSchema.safeParse({ joinCode: '1234-ABCD' })
    expect(result.success).toBe(false)
  })
})
