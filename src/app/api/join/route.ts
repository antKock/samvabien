import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { signJwt } from '@/lib/auth/jwt'
import { setAuthCookie } from '@/lib/auth/cookies'
import { JoinSchema } from '@/lib/schemas/join'
import { parseDeviceName } from '@/lib/auth/device'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = JoinSchema.safeParse(body)

    if (!result.success) {
      // NFR6: same generic error for all invalid codes
      return NextResponse.json(
        { error: { message: 'Code introuvable, vérifiez la saisie' } },
        { status: 404 }
      )
    }

    const { joinCode } = result.data
    const supabase = createServerClient()

    // Lookup profile by join_code
    const { data: profile } = await supabase
      .from('pousse_profiles')
      .select('id')
      .eq('join_code', joinCode)
      .single()

    if (!profile) {
      // NFR6: same response whether code exists or not
      return NextResponse.json(
        { error: { message: 'Code introuvable, vérifiez la saisie' } },
        { status: 404 }
      )
    }

    // Create device session
    const deviceName = parseDeviceName(request.headers.get('user-agent'))
    const { data: session, error: sessionError } = await supabase
      .from('pousse_device_sessions')
      .insert({
        profile_id: profile.id,
        device_name: deviceName,
      })
      .select('id')
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: { message: 'Erreur lors de la connexion' } },
        { status: 500 }
      )
    }

    // Sign JWT and set cookie
    const token = await signJwt({
      profileId: profile.id,
      sessionId: session.id,
    })

    const response = NextResponse.json({
      data: { profileId: profile.id },
    })

    setAuthCookie(response, token)
    return response
  } catch {
    return NextResponse.json(
      { error: { message: 'Code introuvable, vérifiez la saisie' } },
      { status: 404 }
    )
  }
}
