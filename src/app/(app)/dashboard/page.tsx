'use client'

import { useState, useCallback, useEffect } from 'react'
import WelcomeBanner from '@/components/onboarding/WelcomeBanner'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import HeroCard from '@/components/dashboard/HeroCard'
import KpiCardMilk from '@/components/dashboard/KpiCardMilk'
import KpiCardSleep from '@/components/dashboard/KpiCardSleep'
import ToastTransition from '@/components/toasts/ToastTransition'
import ToastBottle from '@/components/toasts/ToastBottle'
import ToastBatchMilk from '@/components/toasts/ToastBatchMilk'
import ToastBatchSleep from '@/components/toasts/ToastBatchSleep'
import ToastEdit from '@/components/toasts/ToastEdit'
import ToastUndo from '@/components/toasts/ToastUndo'
import RecapList from '@/components/dashboard/RecapList'
import WeightReminderBanner from '@/components/dashboard/WeightReminderBanner'
import { useHousehold } from '@/hooks/useHousehold'
import type { BabyEvent } from '@/types'
import { getCookie, setCookie } from '@/lib/cookies'

export default function DashboardPage() {
  const { profile, isLoading, isDemo, error, clearError, removeEventLocally, restoreEvent, deleteEvent } = useHousehold()
  const [showBanner, setShowBanner] = useState(() => !getCookie('pousse_welcome_dismissed'))
  const [isToastOpen, setIsToastOpen] = useState(false)
  const [isBottleToastOpen, setIsBottleToastOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<BabyEvent | null>(null)
  const [undoEvent, setUndoEvent] = useState<BabyEvent | null>(null)
  const [isBatchMilkOpen, setIsBatchMilkOpen] = useState(false)
  const [isBatchSleepOpen, setIsBatchSleepOpen] = useState(false)

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(clearError, 4000)
    return () => clearTimeout(timer)
  }, [error, clearError])

  const handleDismissBanner = useCallback(() => {
    setShowBanner(false)
    setCookie('pousse_welcome_dismissed', '1', 365 * 10)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="text-text-sec" style={{ fontSize: '14px', fontWeight: 600 }}>
          Chargement…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg">
      {showBanner && profile && !isDemo && (
        <WelcomeBanner
          joinCode={profile.joinCode}
          onDismiss={handleDismissBanner}
        />
      )}

      <div className="mx-auto max-w-[430px] px-4 py-4 flex flex-col gap-4">
        {/* Weight reminder banner */}
        <WeightReminderBanner />

        {/* Header */}
        <DashboardHeader />

        {/* Hero Card */}
        <HeroCard onTap={() => setIsToastOpen(true)} />

        {/* KPI Cards */}
        <KpiCardMilk onTap={() => setIsBottleToastOpen(true)} onPlusTap={() => setIsBatchMilkOpen(true)} />
        <KpiCardSleep onTap={() => setIsToastOpen(true)} onPlusTap={() => setIsBatchSleepOpen(true)} />

        {/* Récap */}
        <RecapList onEventTap={(event) => { if (!undoEvent) setEditingEvent(event) }} />
      </div>

      {/* Error feedback */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-[430px]">
          <div
            className="bg-surface text-text rounded-[16px] px-4 py-3 text-center"
            style={{ fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {error}
          </div>
        </div>
      )}

      {/* Toast Transition */}
      {isToastOpen && (
        <ToastTransition onClose={() => setIsToastOpen(false)} />
      )}

      {/* Toast Bottle */}
      {isBottleToastOpen && (
        <ToastBottle onClose={() => setIsBottleToastOpen(false)} />
      )}

      {/* Toast Batch Milk (import crèche) */}
      {isBatchMilkOpen && (
        <ToastBatchMilk onClose={() => setIsBatchMilkOpen(false)} />
      )}

      {/* Toast Batch Sleep (import crèche) */}
      {isBatchSleepOpen && (
        <ToastBatchSleep onClose={() => setIsBatchSleepOpen(false)} />
      )}

      {/* Toast Edit */}
      {editingEvent && (
        <ToastEdit
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onDelete={(event) => {
            setEditingEvent(null)
            setUndoEvent(event)
            removeEventLocally(event.id)
          }}
        />
      )}

      {/* Toast Undo */}
      {undoEvent && (
        <ToastUndo
          onConfirm={() => {
            deleteEvent(undoEvent.id)
            setUndoEvent(null)
          }}
          onCancel={() => {
            restoreEvent(undoEvent)
            setUndoEvent(null)
          }}
        />
      )}
    </div>
  )
}
