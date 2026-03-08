import { NextRequest } from 'next/server'
import { verifyJwt } from './jwt'
import { getAuthCookie } from './cookies'
import { createServerClient } from '@/lib/supabase/server'

interface Session {
  profileId: string
  sessionId: string
}

export async function getSession(request: NextRequest): Promise<Session | null> {
  const token = getAuthCookie(request)
  if (!token) return null

  const payload = await verifyJwt(token)
  if (!payload) return null

  // Vérifier que la session existe encore en DB (NFR7 : révocation effective)
  const supabase = createServerClient()
  const { data } = await supabase
    .from('pousse_device_sessions')
    .select('id')
    .eq('id', payload.sessionId)
    .eq('profile_id', payload.profileId)
    .single()

  if (!data) return null

  return {
    profileId: payload.profileId,
    sessionId: payload.sessionId,
  }
}
