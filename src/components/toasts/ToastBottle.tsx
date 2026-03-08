'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import Toast from '@/components/ui/Toast'
import CooldownButton, { type CooldownButtonHandle } from '@/components/ui/CooldownButton'
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
  const cooldownRef = useRef<CooldownButtonHandle>(null)

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
    // Fallback: median of range
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
    confirm()
  }, [confirm])

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
          onExpire={confirm}
          onTap={confirm}
          label="Biberon"
          emoji="🍼"
        />

        {/* Time display (tappable) */}
        <button
          onClick={handleTimeClick}
          className="text-text font-bold text-lg"
        >
          {formatTime(selectedTime)}
        </button>
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
