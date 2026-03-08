'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import CooldownBorder from './CooldownBorder'

export type ToastCategory = 'sleep' | 'milk'

interface ToastProps {
  children: ReactNode
  category: ToastCategory
  onDismiss: () => void
  onBackdropTap: () => void
  cooldownDuration?: number
  cooldownActive?: boolean
  onCooldownComplete?: () => void
}

export default function Toast({
  children,
  category,
  onDismiss,
  onBackdropTap,
  cooldownDuration,
  cooldownActive = false,
  onCooldownComplete,
}: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onDismiss])

  // Tap outside toast handler
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (toastRef.current && !toastRef.current.contains(e.target as Node)) {
        onBackdropTap()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onBackdropTap])

  // Auto-confirm when cooldown completes
  useEffect(() => {
    if (!cooldownActive || !cooldownDuration || !onCooldownComplete) return
    const timer = setTimeout(onCooldownComplete, cooldownDuration)
    return () => clearTimeout(timer)
  }, [cooldownActive, cooldownDuration, onCooldownComplete])

  const bg = category === 'milk' ? 'var(--milk-bg)' : 'var(--sleep-bg)'
  const accent = category === 'milk' ? 'var(--milk-accent)' : 'var(--sleep-accent)'

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 13,
        right: 13,
        zIndex: 20,
      }}
    >
      <div
        ref={toastRef}
        style={{
          borderRadius: 18,
          padding: '16px 16px 20px',
          position: 'relative',
          background: bg,
          border: `1.5px solid color-mix(in srgb, ${accent} 30%, transparent)`,
          boxShadow: `0 -4px 20px color-mix(in srgb, ${accent} 15%, transparent)`,
          animation: 'toast-enter 350ms ease-out',
        }}
      >
        {cooldownActive && cooldownDuration && (
          <CooldownBorder
            toastRef={toastRef}
            duration={cooldownDuration}
            accentColor={accent}
          />
        )}
        {children}
      </div>
    </div>
  )
}
