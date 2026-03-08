import { SignJWT, jwtVerify } from 'jose'

interface JwtPayload {
  profileId: string
  sessionId: string
}

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(getSecret())
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      profileId: payload.profileId as string,
      sessionId: payload.sessionId as string,
    }
  } catch {
    return null
  }
}
