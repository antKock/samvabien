import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/guard'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json(
      { error: { message: 'Non autorisé' } },
      { status: 401 }
    )
  }

  const { id } = await params
  const supabase = createServerClient()

  // Verify device belongs to the same profile
  const { data: device } = await supabase
    .from('pousse_device_sessions')
    .select('id, profile_id')
    .eq('id', id)
    .single()

  if (!device || device.profile_id !== session.profileId) {
    return NextResponse.json(
      { error: { message: 'Appareil non trouvé' } },
      { status: 404 }
    )
  }

  // Delete the session
  const { error } = await supabase
    .from('pousse_device_sessions')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: { message: 'Erreur lors de la suppression' } },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: { success: true } })
}
