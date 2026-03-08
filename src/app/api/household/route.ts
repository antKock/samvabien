import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/guard'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json(
      { error: { message: 'Non autorisé' } },
      { status: 401 }
    )
  }

  const supabase = createServerClient()

  const [profileResult, devicesResult, eventsResult] = await Promise.all([
    supabase
      .from('pousse_profiles')
      .select('*')
      .eq('id', session.profileId)
      .single(),
    supabase
      .from('pousse_device_sessions')
      .select('*')
      .eq('profile_id', session.profileId)
      .order('last_seen', { ascending: false }),
    supabase
      .from('pousse_events')
      .select('*')
      .eq('profile_id', session.profileId)
      .order('created_at', { ascending: false }),
  ])

  if (!profileResult.data) {
    return NextResponse.json(
      { error: { message: 'Profil introuvable' } },
      { status: 404 }
    )
  }

  const p = profileResult.data
  const profile = {
    id: p.id,
    babyName: p.baby_name,
    babyDob: p.baby_dob,
    babyWeightHg: p.baby_weight_hg,
    joinCode: p.join_code,
    sleepState: p.sleep_state,
    sleepStateSince: p.sleep_state_since,
    sleepStateMoment: p.sleep_state_moment,
    weightReminder: p.weight_reminder,
    createdAt: p.created_at,
  }

  const devices = (devicesResult.data ?? []).map((d) => ({
    id: d.id,
    profileId: d.profile_id,
    deviceName: d.device_name,
    lastSeen: d.last_seen,
    createdAt: d.created_at,
  }))

  const events = (eventsResult.data ?? []).map((e) => ({
    id: e.id,
    profileId: e.profile_id,
    type: e.type,
    value: e.value,
    startedAt: e.started_at,
    endedAt: e.ended_at,
    moment: e.moment,
    createdAt: e.created_at,
  }))

  return NextResponse.json({
    data: { profile, devices, events, currentSessionId: session.sessionId },
  })
}
