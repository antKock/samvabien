'use client'

import type { Moment } from '@/types'

const MOMENTS: { value: Moment; label: string }[] = [
  { value: 'morning', label: 'Matin' },
  { value: 'noon', label: 'Midi' },
  { value: 'afternoon', label: 'Après-midi' },
]

interface MomentSelectorProps {
  value: Moment | null
  onChange: (moment: Moment | null) => void
}

export default function MomentSelector({ value, onChange }: MomentSelectorProps) {
  return (
    <div style={{ display: 'inline-flex', gap: '8px' }}>
      {MOMENTS.map((m) => {
        const isSelected = value === m.value
        return (
          <button
            key={m.value}
            onClick={() => onChange(isSelected ? null : m.value)}
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              border: isSelected ? 'none' : '1px solid var(--border)',
              backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
              color: isSelected ? 'var(--surface)' : 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
