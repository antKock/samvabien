'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeSyncCallbacks {
  onEventInsert: (payload: Record<string, unknown>) => void
  onEventUpdate: (payload: Record<string, unknown>) => void
  onEventDelete: (oldRecord: Record<string, unknown>) => void
  onProfileUpdate: (payload: Record<string, unknown>) => void
}

export function useRealtimeSync(
  profileId: string | null,
  isDemo: boolean,
  callbacks: RealtimeSyncCallbacks,
) {
  const callbacksRef = useRef(callbacks)
  useEffect(() => {
    callbacksRef.current = callbacks
  })

  useEffect(() => {
    if (isDemo || !profileId) return

    const channel: RealtimeChannel = supabase
      .channel(`household:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pousse_events',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => callbacksRef.current.onEventInsert(payload.new as Record<string, unknown>),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pousse_events',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => callbacksRef.current.onEventUpdate(payload.new as Record<string, unknown>),
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'pousse_events',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => callbacksRef.current.onEventDelete(payload.old as Record<string, unknown>),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pousse_profiles',
          filter: `id=eq.${profileId}`,
        },
        (payload) => callbacksRef.current.onProfileUpdate(payload.new as Record<string, unknown>),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileId, isDemo])
}
