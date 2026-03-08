'use client'

import { useMemo } from 'react'
import ToastBatch from './ToastBatch'
import { useHousehold } from '@/hooks/useHousehold'
import { formatDuration } from '@/lib/format'

const SLEEP_RANGE = { min: 5, max: 180, step: 5 }

function formatMinutes(minutes: number): string {
  return formatDuration(minutes * 60_000)
}

interface ToastBatchSleepProps {
  onClose: () => void
}

export default function ToastBatchSleep({ onClose }: ToastBatchSleepProps) {
  const { events } = useHousehold()

  const defaultValue = useMemo(() => {
    const naps = [...events]
      .filter((e) => e.type === 'nap')
      .sort((a, b) => {
        const aTime = a.startedAt ?? a.createdAt
        const bTime = b.startedAt ?? b.createdAt
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
      .slice(0, 10)
    if (naps.length > 0) {
      const avg = naps.reduce((sum, e) => sum + e.value, 0) / naps.length
      return Math.round(avg / 5) * 5
    }
    return Math.round((SLEEP_RANGE.min + SLEEP_RANGE.max) / 2 / 5) * 5
  }, [events])

  return (
    <ToastBatch
      onClose={onClose}
      eventType="nap"
      accentColor="var(--sleep-accent)"
      defaultValue={defaultValue}
      sliderMin={SLEEP_RANGE.min}
      sliderMax={SLEEP_RANGE.max}
      sliderStep={SLEEP_RANGE.step}
      formatValue={formatMinutes}
    />
  )
}
