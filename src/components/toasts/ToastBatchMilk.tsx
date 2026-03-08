'use client'

import { useMemo } from 'react'
import ToastBatch from './ToastBatch'
import { useHousehold } from '@/hooks/useHousehold'
import { getMilkRange } from '@/lib/medical-targets'

interface ToastBatchMilkProps {
  onClose: () => void
}

export default function ToastBatchMilk({ onClose }: ToastBatchMilkProps) {
  const { profile, events } = useHousehold()

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

  return (
    <ToastBatch
      onClose={onClose}
      eventType="bottle"
      accentColor="var(--milk-accent)"
      defaultValue={defaultValue}
      sliderMin={range.min}
      sliderMax={range.max}
      sliderStep={range.step}
    />
  )
}
