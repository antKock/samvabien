'use client'

import { useState, useRef, useCallback } from 'react'
import Toast from '@/components/ui/Toast'
import CooldownButton, { type CooldownButtonHandle } from '@/components/ui/CooldownButton'
import TimePicker from '@/components/ui/TimePicker'
import { useHousehold } from '@/hooks/useHousehold'
import { getNextTransitions } from '@/lib/sleep-state-machine'
import { formatTime } from '@/lib/format'
import type { SleepState, TransitionAction } from '@/types'

interface ToastTransitionProps {
  onClose: () => void
}

export default function ToastTransition({ onClose }: ToastTransitionProps) {
  const { profile, transitionSleepState } = useHousehold()
  const sleepState = (profile?.sleepState ?? 'awake') as SleepState
  const now = new Date()
  const transitions = getNextTransitions(sleepState, now.getHours())

  const [primary, setPrimary] = useState<TransitionAction>(transitions.primary)
  const [alt, setAlt] = useState<TransitionAction | undefined>(transitions.alt)
  const [selectedTime, setSelectedTime] = useState<Date>(now)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const cooldownRef = useRef<CooldownButtonHandle>(null)

  const confirmTransition = useCallback(async () => {
    await transitionSleepState(primary.targetState, selectedTime.toISOString())
    onClose()
  }, [primary, selectedTime, transitionSleepState, onClose])

  const handleSwapAlt = useCallback(() => {
    if (!alt) return
    const prevPrimary = primary
    setPrimary(alt)
    setAlt(prevPrimary)
    cooldownRef.current?.reset()
  }, [primary, alt])

  const handleBackdropTap = useCallback(() => {
    // Backdrop tap = confirm primary (same as cooldown expire)
    confirmTransition()
  }, [confirmTransition])

  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose])

  const handleTimeClick = useCallback(() => {
    setIsPickerOpen(true)
    cooldownRef.current?.pause()
  }, [])

  const handleTimeConfirm = useCallback((time: Date) => {
    setSelectedTime(time)
    setIsPickerOpen(false)
    cooldownRef.current?.reset()
  }, [])

  return (
    <Toast onDismiss={handleCancel} onBackdropTap={handleBackdropTap}>
      <div className="flex items-center justify-between">
        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="text-text-sec text-xl p-2"
          aria-label="Annuler"
        >
          ↩
        </button>

        {/* Primary action with cooldown */}
        <CooldownButton
          ref={cooldownRef}
          duration={5000}
          onExpire={confirmTransition}
          onTap={confirmTransition}
          label={primary.label}
          emoji={primary.emoji}
        />

        {/* Time display (tappable for time picker — Story 2.3) */}
        <button
          onClick={handleTimeClick}
          className="text-text font-bold text-lg"
        >
          {formatTime(selectedTime)}
        </button>
      </div>

      {/* Alt action */}
      {alt && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleSwapAlt}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface text-text-sec text-sm font-semibold"
            style={{ border: '1px solid var(--border)' }}
          >
            <span>{alt.emoji}</span>
            <span>{alt.label}</span>
          </button>
        </div>
      )}

      {/* Time picker inline */}
      {isPickerOpen && (
        <div className="mt-4" style={{ transition: 'height 0.3s ease' }}>
          <TimePicker
            initialTime={selectedTime}
            onConfirm={handleTimeConfirm}
          />
        </div>
      )}
    </Toast>
  )
}
