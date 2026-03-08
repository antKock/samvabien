'use client'

import { useState, useMemo, useCallback } from 'react'
import Toast, { type ToastCategory } from '@/components/ui/Toast'
import Slider from '@/components/ui/Slider'
import TimePicker from '@/components/ui/TimePicker'
import MomentSelector from '@/components/ui/MomentSelector'
import { useHousehold } from '@/hooks/useHousehold'
import { getMilkRange } from '@/lib/medical-targets'
import { formatTime } from '@/lib/format'
import type { BabyEvent, EventType, Moment } from '@/types'

const TOAST_TITLES: Record<EventType, { emoji: string; label: string }> = {
  bottle: { emoji: '🍼', label: 'Biberon' },
  nap: { emoji: '😴', label: 'Sieste' },
  night: { emoji: '🌙', label: 'Nuit' },
  'night-wake': { emoji: '🫣', label: 'Réveil nocturne' },
  'night-sleep': { emoji: '🌙', label: 'Nuit' },
}

function getCategoryForEvent(type: EventType): ToastCategory {
  return type === 'bottle' ? 'milk' : 'sleep'
}

interface ToastEditProps {
  event: BabyEvent
  onClose: () => void
  onDelete: (event: BabyEvent) => void
}

export default function ToastEdit({ event, onClose, onDelete }: ToastEditProps) {
  const { profile, updateEvent } = useHousehold()
  const isBottle = event.type === 'bottle'
  const title = TOAST_TITLES[event.type]
  const category = getCategoryForEvent(event.type)

  const range = useMemo(
    () => isBottle ? getMilkRange(profile?.babyWeightHg ?? 40) : { min: 5, max: event.type === 'night' ? 720 : 180, step: 5 },
    [isBottle, profile?.babyWeightHg, event.type],
  )

  const [value, setValue] = useState(event.value)
  const [selectedTime, setSelectedTime] = useState(() =>
    event.startedAt ? new Date(event.startedAt) : new Date()
  )
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(event.moment)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const hasMoment = event.moment !== null && event.startedAt === null

  const handleSave = useCallback(async () => {
    const data: { value?: number; startedAt?: string; moment?: Moment | null } = {}
    if (value !== event.value) data.value = value
    if (hasMoment) {
      if (selectedMoment !== event.moment) data.moment = selectedMoment
    } else {
      if (selectedTime.toISOString() !== event.startedAt) data.startedAt = selectedTime.toISOString()
    }

    if (Object.keys(data).length > 0) {
      await updateEvent(event.id, data)
    }
    onClose()
  }, [value, selectedTime, selectedMoment, event, hasMoment, updateEvent, onClose])

  const handleTimeClick = useCallback(() => {
    setIsPickerOpen(true)
  }, [])

  const handleTimeConfirm = useCallback((time: Date) => {
    setSelectedTime(time)
    setIsPickerOpen(false)
  }, [])

  const accent = isBottle ? 'var(--milk-accent)' : 'var(--sleep-accent)'

  return (
    <Toast category={category} onDismiss={onClose} onBackdropTap={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div style={{ fontSize: '16px', fontWeight: 700 }}>
          {title.emoji} {title.label}
        </div>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: `color-mix(in srgb, ${accent} 15%, transparent)`,
            color: isBottle ? 'var(--milk-icon)' : 'var(--sleep-icon)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
          }}
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Slider */}
      <Slider
        value={value}
        onChange={setValue}
        min={range.min}
        max={range.max}
        step={range.step}
        accentColor={accent}
        unit={isBottle ? 'mL' : 'min'}
      />

      {/* Time or Moment selector */}
      <div className="mt-3">
        {hasMoment ? (
          <MomentSelector value={selectedMoment} onChange={setSelectedMoment} />
        ) : (
          <>
            <button
              onClick={handleTimeClick}
              className="text-text font-bold text-lg"
            >
              {formatTime(selectedTime)}
            </button>
            {isPickerOpen && (
              <div className="mt-3">
                <TimePicker
                  initialTime={selectedTime}
                  onConfirm={handleTimeConfirm}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => onDelete(event)}
          className="flex-1 py-2 rounded-full font-bold text-sm"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          Supprimer
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2 rounded-full font-bold text-sm"
          style={{
            backgroundColor: accent,
            color: 'var(--surface)',
          }}
        >
          Enregistrer
        </button>
      </div>
    </Toast>
  )
}
