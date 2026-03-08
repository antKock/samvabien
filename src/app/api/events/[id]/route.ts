import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/guard'
import { createServerClient } from '@/lib/supabase/server'
import { UpdateEventSchema } from '@/lib/schemas/event'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json(
      { error: { message: 'Non autorisé' } },
      { status: 401 },
    )
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { message: 'Corps de requête invalide' } },
      { status: 400 },
    )
  }

  const parsed = UpdateEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: 'Données invalides' } },
      { status: 400 },
    )
  }

  const supabase = createServerClient()

  // Build update object with snake_case keys
  const update: Record<string, unknown> = {}
  if (parsed.data.value !== undefined) update.value = parsed.data.value
  if (parsed.data.startedAt !== undefined) update.started_at = parsed.data.startedAt
  if (parsed.data.moment !== undefined) update.moment = parsed.data.moment

  const { data, error } = await supabase
    .from('pousse_events')
    .update(update)
    .eq('id', id)
    .eq('profile_id', session.profileId)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: { message: 'Événement non trouvé' } },
      { status: 404 },
    )
  }

  return NextResponse.json({
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
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json(
      { error: { message: 'Non autorisé' } },
      { status: 401 },
    )
  }

  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('pousse_events')
    .delete()
    .eq('id', id)
    .eq('profile_id', session.profileId)
    .select('id')

  if (error) {
    return NextResponse.json(
      { error: { message: 'Erreur serveur' } },
      { status: 500 },
    )
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: { message: 'Événement non trouvé' } },
      { status: 404 },
    )
  }

  return NextResponse.json({ data: { deleted: true } })
}
