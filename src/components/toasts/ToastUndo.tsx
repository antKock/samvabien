'use client'

import Toast from '@/components/ui/Toast'
import type { ToastCategory } from '@/components/ui/Toast'

interface ToastUndoProps {
  onConfirm: () => void
  onCancel: () => void
  category?: ToastCategory
}

export default function ToastUndo({ onConfirm, onCancel, category = 'sleep' }: ToastUndoProps) {
  return (
    <Toast
      category={category}
      onDismiss={onConfirm}
      onBackdropTap={onConfirm}
      cooldownDuration={2000}
      cooldownActive
      onCooldownComplete={onConfirm}
    >
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
    </Toast>
  )
}
