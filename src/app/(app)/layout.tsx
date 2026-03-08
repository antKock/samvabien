'use client'

import { Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { HouseholdProvider, useHousehold } from '@/contexts/HouseholdContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import DemoBanner from '@/components/ui/DemoBanner'

function RealtimeSyncBridge() {
  const { profile, isDemo, _ingestRealtimeEvent, _ingestRealtimeProfile } = useHousehold()

  const onEventInsert = useCallback(
    (payload: Record<string, unknown>) => _ingestRealtimeEvent('INSERT', payload),
    [_ingestRealtimeEvent],
  )
  const onEventUpdate = useCallback(
    (payload: Record<string, unknown>) => _ingestRealtimeEvent('UPDATE', payload),
    [_ingestRealtimeEvent],
  )
  const onEventDelete = useCallback(
    (oldRecord: Record<string, unknown>) => _ingestRealtimeEvent('DELETE', oldRecord),
    [_ingestRealtimeEvent],
  )
  const onProfileUpdate = useCallback(
    (payload: Record<string, unknown>) => _ingestRealtimeProfile(payload),
    [_ingestRealtimeProfile],
  )

  useRealtimeSync(profile?.id ?? null, isDemo, {
    onEventInsert,
    onEventUpdate,
    onEventDelete,
    onProfileUpdate,
  })

  return null
}

function DemoBannerBridge() {
  const { isDemo } = useHousehold()
  if (!isDemo) return null
  return <DemoBanner />
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  return (
    <HouseholdProvider demo={isDemo}>
      <RealtimeSyncBridge />
      <DemoBannerBridge />
      <ThemeProvider>{children}</ThemeProvider>
    </HouseholdProvider>
  )
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={null}>
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  )
}
