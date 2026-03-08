'use client'

import { useState, useCallback } from 'react'
import Toast from '@/components/ui/Toast'
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

  const confirmTransition = useCallback(async () => {
    await transitionSleepState(primary.targetState, selectedTime.toISOString())
    onClose()
  }, [primary, selectedTime, transitionSleepState, onClose])

  const handleSwapAlt = useCallback(() => {
    if (!alt) return
    const prevPrimary = primary
    setPrimary(alt)
    setAlt(prevPrimary)
  }, [primary, alt])

  const handleBackdropTap = useCallback(() => {
    confirmTransition()
  }, [confirmTransition])

  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose])

  const handleTimeClick = useCallback(() => {
    setIsPickerOpen(true)
  }, [])

  const handleTimeConfirm = useCallback((time: Date) => {
    setSelectedTime(time)
    setIsPickerOpen(false)
  }, [])

  return (
    <Toast
      category="sleep"
      onDismiss={handleCancel}
      onBackdropTap={handleBackdropTap}
      cooldownDuration={5000}
      cooldownActive
      onCooldownComplete={confirmTransition}
    >
      {/* Cancel button */}
      <button
        onClick={handleCancel}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: 'none',
          background: 'color-mix(in srgb, var(--sleep-accent) 15%, transparent)',
          color: 'var(--sleep-icon)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 600,
        }}
        aria-label="Annuler"
      >
        ↩
      </button>

      {/* Primary action */}
      <div className="text-center" style={{ marginTop: 4 }}>
        <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 4 }}>{primary.emoji}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{primary.label}</div>
      </div>

      {/* Time display with ±1 buttons */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          onClick={() => setSelectedTime(prev => new Date(prev.getTime() - 60_000))}
          className="toast-time-btn"
          style={{
            width: 32,
            height: 28,
            borderRadius: 8,
            border: 'none',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            position: 'relative',
            background: 'color-mix(in srgb, var(--sleep-accent) 15%, transparent)',
            color: 'var(--sleep-icon)',
          }}
        >
          -1
        </button>
        <button
          onClick={handleTimeClick}
          className="text-text font-bold text-lg"
        >
          {formatTime(selectedTime)}
        </button>
        <button
          onClick={() => setSelectedTime(prev => new Date(prev.getTime() + 60_000))}
          className="toast-time-btn"
          style={{
            width: 32,
            height: 28,
            borderRadius: 8,
            border: 'none',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            position: 'relative',
            background: 'color-mix(in srgb, var(--sleep-accent) 15%, transparent)',
            color: 'var(--sleep-icon)',
          }}
        >
          +1
        </button>
      </div>

      {/* Confirm button */}
      <div className="mt-3 flex justify-center">
        <button
          onClick={confirmTransition}
          className="px-6 py-2 rounded-full font-bold text-sm"
          style={{
            backgroundColor: 'var(--sleep-accent)',
            color: 'var(--surface)',
            border: 'none',
          }}
        >
          Confirmer
        </button>
      </div>

      {/* Alt action */}
      {alt && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleSwapAlt}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-text-sec text-sm font-semibold"
            style={{
              background: 'color-mix(in srgb, var(--sleep-accent) 10%, transparent)',
              border: '1px solid var(--border)',
            }}
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
