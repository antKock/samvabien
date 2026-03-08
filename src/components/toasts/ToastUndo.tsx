'use client'

import { useEffect, useRef, useState } from 'react'
import Toast from '@/components/ui/Toast'

interface ToastUndoProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function ToastUndo({ onConfirm, onCancel }: ToastUndoProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onConfirmRef = useRef(onConfirm)
  onConfirmRef.current = onConfirm
  const [started, setStarted] = useState(false)

  useEffect(() => {
    // Trigger animation on next frame
    requestAnimationFrame(() => setStarted(true))
    timerRef.current = setTimeout(() => onConfirmRef.current(), 2000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <Toast onDismiss={onConfirm} onBackdropTap={onConfirm}>
      <div className="flex items-center justify-between">
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>
          🗑️ Supprimé
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-full font-bold text-sm"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          Annuler
        </button>
      </div>
      {/* Cooldown progress bar */}
      <div
        style={{
          marginTop: '8px',
          height: '2px',
          backgroundColor: 'var(--border)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: 'var(--text-sec)',
            width: started ? '0%' : '100%',
            transition: 'width 2s linear',
          }}
        />
      </div>
    </Toast>
  )
}
