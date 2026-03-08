// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest'
import { signJwt, verifyJwt } from '../jwt'

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-must-be-at-least-32-characters-long'
})

describe('JWT auth', () => {
  it('signe et vérifie un JWT valide', async () => {
    const payload = { profileId: 'abc-123', sessionId: 'sess-456' }
    const token = await signJwt(payload)
    expect(token).toBeTruthy()

    const verified = await verifyJwt(token)
    expect(verified).toEqual(payload)
  })

  it('retourne null pour un token invalide', async () => {
    const result = await verifyJwt('invalid-token')
    expect(result).toBeNull()
  })

  it('retourne null pour un token modifié', async () => {
    const token = await signJwt({ profileId: 'abc', sessionId: 'sess' })
    const result = await verifyJwt(token + 'x')
    expect(result).toBeNull()
  })
})
