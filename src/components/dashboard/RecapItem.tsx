'use client'

import { formatTime, formatDuration } from '@/lib/format'
import type { BabyEvent } from '@/types'

const MOMENT_LABELS: Record<string, string> = {
  morning: 'Matin',
  noon: 'Midi',
  afternoon: 'Après-midi',
}

const EVENT_LABELS: Record<string, string> = {
  bottle: 'Biberon',
  nap: 'Sieste',
  night: 'Nuit',
  'night-wake': 'Réveil nocturne',
  'night-sleep': 'Nuit',
}

interface RecapItemProps {
  event: BabyEvent
  onTap: (event: BabyEvent) => void
}

export default function RecapItem({ event, onTap }: RecapItemProps) {
  const isBottle = event.type === 'bottle'
  const dotColor = isBottle ? 'var(--milk-accent)' : 'var(--sleep-accent)'
  const valueColor = isBottle ? 'var(--milk-icon)' : 'var(--sleep-icon)'

  const label = EVENT_LABELS[event.type] ?? event.type

  // Time display
  let timeDisplay: string
  const hasRange = (event.type === 'night' || event.type === 'night-wake' || event.type === 'night-sleep') && event.startedAt && event.endedAt
  if (hasRange) {
    timeDisplay = `${formatTime(new Date(event.startedAt!))}–${formatTime(new Date(event.endedAt!))}`
  } else if (event.startedAt) {
    timeDisplay = formatTime(new Date(event.startedAt))
  } else if (event.moment && MOMENT_LABELS[event.moment]) {
    timeDisplay = MOMENT_LABELS[event.moment]
  } else {
    timeDisplay = ''
  }

  // Value display
  const valueDisplay = isBottle
    ? `${event.value} mL`
    : formatDuration(event.value * 60000)

  return (
    <div
      onClick={() => onTap(event)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 0',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
      }}
    >
      {/* Dot */}
      <div
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
        }}
      />

      {/* Label */}
      <div style={{ flex: 1, fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>
        {label}
      </div>

      {/* Time */}
      <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-sec)' }}>
        {timeDisplay}
      </div>

      {/* Value */}
      <div style={{ fontSize: '11px', fontWeight: 700, color: valueColor }}>
        {valueDisplay}
      </div>
    </div>
  )
}
