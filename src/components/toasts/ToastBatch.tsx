'use client'

import { useState, useCallback } from 'react'
import Toast, { type ToastCategory } from '@/components/ui/Toast'
import Slider from '@/components/ui/Slider'
import MomentSelector from '@/components/ui/MomentSelector'
import { useHousehold } from '@/hooks/useHousehold'
import type { EventType, Moment } from '@/types'

interface ToastBatchProps {
  onClose: () => void
  eventType: EventType
  accentColor: string
  defaultValue: number
  sliderMin: number
  sliderMax: number
  sliderStep: number
  formatValue?: (value: number) => string
  category: ToastCategory
}

export default function ToastBatch({
  onClose,
  eventType,
  accentColor,
  defaultValue,
  sliderMin,
  sliderMax,
  sliderStep,
  formatValue,
  category,
}: ToastBatchProps) {
  const { addEvent } = useHousehold()

  const [value, setValue] = useState(defaultValue)
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = useCallback(async () => {
    if (isSubmitting || !selectedMoment) return
    setIsSubmitting(true)
    try {
      await addEvent({
        type: eventType,
        value,
        moment: selectedMoment ?? undefined,
      })
      setSelectedMoment(null)
      setValue(defaultValue)
    } finally {
      setIsSubmitting(false)
    }
  }, [value, selectedMoment, addEvent, defaultValue, eventType, isSubmitting])

  const handleFinish = useCallback(async () => {
    if (isSubmitting || !selectedMoment) return
    setIsSubmitting(true)
    try {
      await addEvent({
        type: eventType,
        value,
        moment: selectedMoment ?? undefined,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }, [value, selectedMoment, addEvent, onClose, eventType, isSubmitting])

  const handleDismiss = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <Toast category={category} onDismiss={handleDismiss} onBackdropTap={handleDismiss}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
            color: category === 'milk' ? 'var(--milk-icon)' : 'var(--sleep-icon)',
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
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m8 11 4 4 4-4" />
            <path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
          </svg>
          <span className="text-text font-bold" style={{ fontSize: '16px' }}>
            Import
          </span>
        </div>
      </div>

      {/* Slider */}
      <Slider
        value={value}
        onChange={setValue}
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        accentColor={accentColor}
        formatValue={formatValue}
      />

      {/* Moment Selector */}
      <div className="mt-3 flex justify-center">
        <MomentSelector value={selectedMoment} onChange={setSelectedMoment} />
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleNext}
          disabled={isSubmitting || !selectedMoment}
          className="flex-1 rounded-full py-2 font-bold"
          style={{
            fontSize: '15px',
            border: `2px solid ${accentColor}`,
            color: accentColor,
            backgroundColor: 'transparent',
            opacity: isSubmitting || !selectedMoment ? 0.5 : 1,
          }}
        >
          Suivant
        </button>
        <button
          onClick={handleFinish}
          disabled={isSubmitting || !selectedMoment}
          className="flex-1 rounded-full py-2 font-bold"
          style={{
            fontSize: '15px',
            backgroundColor: accentColor,
            color: 'var(--surface)',
            border: 'none',
            opacity: isSubmitting || !selectedMoment ? 0.5 : 1,
          }}
        >
          Terminer
        </button>
      </div>
    </Toast>
  )
}
