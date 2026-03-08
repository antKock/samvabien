'use client'

import { useState, useCallback, useMemo } from 'react'
import Toast from '@/components/ui/Toast'
import TimePicker from '@/components/ui/TimePicker'
import Slider from '@/components/ui/Slider'
import { useHousehold } from '@/hooks/useHousehold'
import { getMilkRange } from '@/lib/medical-targets'
import { formatTime } from '@/lib/format'

interface ToastBottleProps {
  onClose: () => void
}

export default function ToastBottle({ onClose }: ToastBottleProps) {
  const { profile, events, addEvent } = useHousehold()

  const range = useMemo(
    () => getMilkRange(profile?.babyWeightHg ?? 40),
    [profile?.babyWeightHg],
  )

  const defaultValue = useMemo(() => {
    const bottles = [...events]
      .filter((e) => e.type === 'bottle')
      .sort((a, b) => {
        const aTime = a.startedAt ?? a.createdAt
        const bTime = b.startedAt ?? b.createdAt
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
      .slice(0, 10)
    if (bottles.length > 0) {
      const avg = bottles.reduce((sum, e) => sum + e.value, 0) / bottles.length
      return Math.round(avg / 10) * 10
    }
    return Math.round((range.min + range.max) / 2 / 10) * 10
  }, [events, range])

  const [mlValue, setMlValue] = useState(defaultValue)
  const [selectedTime, setSelectedTime] = useState(() => new Date())
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const confirm = useCallback(async () => {
    await addEvent({
      type: 'bottle',
      value: mlValue,
      startedAt: selectedTime.toISOString(),
    })
    onClose()
  }, [mlValue, selectedTime, addEvent, onClose])

  const handleBackdropTap = useCallback(() => {
    if (isPickerOpen) return
    confirm()
  }, [confirm, isPickerOpen])

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
      category="milk"
      onDismiss={handleCancel}
      onBackdropTap={handleBackdropTap}
      cooldownDuration={2500}
      cooldownActive={!isPickerOpen}
      onCooldownComplete={confirm}
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
          background: 'color-mix(in srgb, var(--milk-accent) 15%, transparent)',
          color: 'var(--milk-icon)',
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

      {/* Header */}
      <div className="text-center" style={{ marginTop: 4 }}>
        <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 4 }}>🍼</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Biberon</div>
      </div>

      {/* Slider */}
      <div className="mt-3">
        <Slider
          value={mlValue}
          onChange={setMlValue}
          min={range.min}
          max={range.max}
          step={range.step}
          accentColor="var(--milk-accent)"
        />
      </div>

      {/* Time display with ±1 buttons */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          onClick={() => setSelectedTime(prev => new Date(prev.getTime() - 60_000))}
          className="toast-time-btn"
          style={{
            background: 'color-mix(in srgb, var(--milk-accent) 15%, transparent)',
            color: 'var(--milk-icon)',
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
            background: 'color-mix(in srgb, var(--milk-accent) 15%, transparent)',
            color: 'var(--milk-icon)',
          }}
        >
          +1
        </button>
      </div>

      {/* Time picker inline */}
      {isPickerOpen && (
        <div className="mt-4">
          <TimePicker
            initialTime={selectedTime}
            onConfirm={handleTimeConfirm}
          />
        </div>
      )}
    </Toast>
  )
}
