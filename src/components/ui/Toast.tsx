'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ToastProps {
  children: ReactNode
  onDismiss: () => void
  onBackdropTap: () => void
}

export default function Toast({ children, onDismiss, onBackdropTap }: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onDismiss])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onBackdropTap}
      />
      {/* Toast container */}
      <div
        ref={toastRef}
        className="relative w-full max-w-md bg-surface rounded-t-[20px] p-5"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {children}
      </div>
    </div>
  )
}
