import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/guard'
import { createServerClient } from '@/lib/supabase/server'
import { CreateEventSchema } from '@/lib/schemas/event'

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

  const parsed = CreateEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Données invalides' } },
      { status: 400 },
    )
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('pousse_events')
    .insert({
      profile_id: session.profileId,
      type: parsed.data.type,
      value: parsed.data.value,
      started_at: parsed.data.startedAt ?? null,
      moment: parsed.data.moment ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: { message: 'Erreur serveur' } },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      data: {
        event: {
          id: data.id,
          profileId: data.profile_id,
          type: data.type,
          value: data.value,
          startedAt: data.started_at,
          endedAt: data.ended_at,
          moment: data.moment,
          createdAt: data.created_at,
        },
      },
    },
    { status: 201 },
  )
}
