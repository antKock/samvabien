import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/guard'
import { clearAuthCookie } from '@/lib/auth/cookies'

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json(
      { error: { message: 'Non autorisé' } },
      { status: 401 }
    )
  }

  const supabase = createServerClient()

  // Count active sessions for this profile
  const { count } = await supabase
    .from('pousse_device_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', session.profileId)

  const isLastSession = (count ?? 0) <= 1

  if (isLastSession) {
    // Hard delete: remove profile (cascades to sessions and events)
    const { error } = await supabase
      .from('pousse_profiles')
      .delete()
      .eq('id', session.profileId)

    if (error) {
      return NextResponse.json(
        { error: { message: 'Erreur lors de la suppression' } },
        { status: 500 }
      )
    }
  } else {
    // Only remove this session
    const { error } = await supabase
      .from('pousse_device_sessions')
      .delete()
      .eq('id', session.sessionId)

    if (error) {
      return NextResponse.json(
        { error: { message: 'Erreur lors de la déconnexion' } },
        { status: 500 }
      )
    }
  }

  const response = NextResponse.json({
    data: { deleted: isLastSession },
  })

  clearAuthCookie(response)
  return response
}
