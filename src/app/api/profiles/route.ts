import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { signJwt } from '@/lib/auth/jwt'
import { setAuthCookie } from '@/lib/auth/cookies'
import { CreateProfileSchema, UpdateProfileSchema } from '@/lib/schemas/profile'
import { parseDeviceName } from '@/lib/auth/device'
import { getSession } from '@/lib/auth/guard'

function generateJoinCode(): string {
  const letters = Array.from({ length: 4 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('')
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${letters}-${digits}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = CreateProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: { message: result.error.issues[0].message } },
        { status: 400 }
      )
    }

    const { babyName, babyDob, babyWeightHg } = result.data
    const supabase = createServerClient()

    // Generate unique join code with retry
    let joinCode: string | null = null
    for (let i = 0; i < 5; i++) {
      const candidate = generateJoinCode()
      const { data: existing } = await supabase
        .from('pousse_profiles')
        .select('id')
        .eq('join_code', candidate)
        .single()

      if (!existing) {
        joinCode = candidate
        break
      }
    }

    if (!joinCode) {
      return NextResponse.json(
        { error: { message: 'Erreur lors de la génération du code, réessayez' } },
        { status: 500 }
      )
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('pousse_profiles')
      .insert({
        baby_name: babyName,
        baby_dob: babyDob,
        baby_weight_hg: babyWeightHg,
        join_code: joinCode,
      })
      .select('id')
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: { message: 'Erreur lors de la création du profil' } },
        { status: 500 }
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
        { error: { message: 'Erreur lors de la création de la session' } },
        { status: 500 }
      )
    }

    // Sign JWT and set cookie
    const token = await signJwt({
      profileId: profile.id,
      sessionId: session.id,
    })

    const response = NextResponse.json({
      data: { profileId: profile.id, joinCode },
    })

    setAuthCookie(response, token)
    return response
  } catch {
    return NextResponse.json(
      { error: { message: 'Erreur interne' } },
      { status: 500 }
    )
  }
}

const camelToSnake: Record<string, string> = {
  babyName: 'baby_name',
  babyDob: 'baby_dob',
  babyWeightHg: 'baby_weight_hg',
  weightReminder: 'weight_reminder',
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json(
        { error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = UpdateProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: { message: result.error.issues[0].message } },
        { status: 400 }
      )
    }

    // Map camelCase to snake_case for DB
    const dbUpdate: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(result.data)) {
      if (value !== undefined && camelToSnake[key]) {
        dbUpdate[camelToSnake[key]] = value
      }
    }

    const supabase = createServerClient()
    const { data: updated, error } = await supabase
      .from('pousse_profiles')
      .update(dbUpdate)
      .eq('id', session.profileId)
      .select('*')
      .single()

    if (error || !updated) {
      return NextResponse.json(
        { error: { message: 'Erreur lors de la mise à jour du profil' } },
        { status: 500 }
      )
    }

    const profile = {
      id: updated.id,
      babyName: updated.baby_name,
      babyDob: updated.baby_dob,
      babyWeightHg: updated.baby_weight_hg,
      joinCode: updated.join_code,
      sleepState: updated.sleep_state,
      sleepStateSince: updated.sleep_state_since,
      sleepStateMoment: updated.sleep_state_moment,
      weightReminder: updated.weight_reminder,
      createdAt: updated.created_at,
    }

    return NextResponse.json({ data: { profile } })
  } catch {
    return NextResponse.json(
      { error: { message: 'Erreur interne' } },
      { status: 500 }
    )
  }
}
