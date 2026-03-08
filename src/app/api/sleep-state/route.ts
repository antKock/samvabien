import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/guard'
import { TransitionSchema } from '@/lib/schemas/sleep-state'
import { getNextTransitions } from '@/lib/sleep-state-machine'
import type { SleepState } from '@/types'

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json(
      { error: { message: 'Non autorisé' } },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { message: 'Corps de requête invalide' } },
      { status: 400 },
    )
  }

  const parsed = TransitionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Données invalides', code: 'VALIDATION_ERROR' } },
      { status: 400 },
    )
  }

  const { newState, time } = parsed.data
  const supabase = createServerClient()

  // Load current profile state
  const { data: profile } = await supabase
    .from('pousse_profiles')
    .select('sleep_state')
    .eq('id', session.profileId)
    .single()

  if (!profile) {
    return NextResponse.json(
      { error: { message: 'Profil introuvable' } },
      { status: 404 },
    )
  }

  // Verify transition is legal
  const currentState = profile.sleep_state as SleepState
  const transitionHour = new Date(time).getHours()
  const transitions = getNextTransitions(currentState, transitionHour)

  const isLegal =
    transitions.primary.targetState === newState ||
    transitions.alt?.targetState === newState

  if (!isLegal) {
    return NextResponse.json(
      { error: { message: 'Transition non autorisée' } },
      { status: 422 },
    )
  }

  // Close previous sleep event if leaving a sleep state
  const leavingSleep = ['nap', 'night', 'night-wake', 'night-sleep'].includes(currentState)
  if (leavingSleep) {
    const { data: prevEvent } = await supabase
      .from('pousse_events')
      .select('id, started_at')
      .eq('profile_id', session.profileId)
      .eq('type', currentState)
      .is('ended_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (prevEvent?.started_at) {
      const durationMin = Math.round(
        (new Date(time).getTime() - new Date(prevEvent.started_at).getTime()) / 60000,
      )
      const { error: closeError } = await supabase
        .from('pousse_events')
        .update({ ended_at: time, value: durationMin })
        .eq('id', prevEvent.id)

      if (closeError) {
        return NextResponse.json(
          { error: { message: 'Erreur lors de la clôture de l\'événement précédent' } },
          { status: 500 },
        )
      }
    }
  }

  // Update profile sleep state
  const { error: profileError } = await supabase
    .from('pousse_profiles')
    .update({
      sleep_state: newState,
      sleep_state_since: time,
      sleep_state_moment: null,
    })
    .eq('id', session.profileId)

  if (profileError) {
    return NextResponse.json(
      { error: { message: 'Erreur lors de la mise à jour du profil' } },
      { status: 500 },
    )
  }

  // Create new event
  const { data: event, error: eventError } = await supabase
    .from('pousse_events')
    .insert({
      profile_id: session.profileId,
      type: newState,
      value: 0,
      started_at: time,
    })
    .select()
    .single()

  if (eventError) {
    return NextResponse.json(
      { error: { message: 'Erreur lors de la création de l\'événement' } },
      { status: 500 },
    )
  }

  return NextResponse.json({
    data: {
      sleepState: newState,
      sleepStateSince: time,
      event: {
        id: event.id,
        profileId: event.profile_id,
        type: event.type,
        value: event.value,
        startedAt: event.started_at,
        endedAt: event.ended_at,
        moment: event.moment,
        createdAt: event.created_at,
      },
    },
  })
}
