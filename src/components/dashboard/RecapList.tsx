'use client'

import { useHousehold } from '@/hooks/useHousehold'
import { eventsInCycle } from '@/lib/cycle-window'
import RecapItem from './RecapItem'
import type { BabyEvent } from '@/types'

interface RecapListProps {
  onEventTap: (event: BabyEvent) => void
}

export default function RecapList({ onEventTap }: RecapListProps) {
  const { events } = useHousehold()

  const cycleEvents = eventsInCycle(events)
    .filter((event) => {
      // Bottles always shown (no endedAt concept)
      if (event.type === 'bottle') return true
      // Sleep events: hide if still in progress (no endedAt)
      return event.endedAt !== null
    })

  return (
    <div style={{ marginTop: '6px' }}>
      <div
        style={{
          fontSize: '9px',
          fontWeight: 700,
          color: 'var(--text-sec)',
          textTransform: 'uppercase',
        }}
      >
        Aujourd&apos;hui
      </div>
      {cycleEvents.length === 0 ? (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-sec)',
            textAlign: 'center',
            padding: '16px 0',
          }}
        >
          Les événements s&apos;afficheront ici
        </div>
      ) : (
        <div>
          {cycleEvents.map((event) => (
            <RecapItem key={event.id} event={event} onTap={onEventTap} />
          ))}
        </div>
      )}
    </div>
  )
}
