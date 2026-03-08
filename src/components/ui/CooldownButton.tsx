'use client'

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'

interface CooldownButtonProps {
  duration?: number // ms, default 5000
  onExpire: () => void
  onTap: () => void
  label: string
  emoji: string
}

export interface CooldownButtonHandle {
  pause: () => void
  resume: () => void
  reset: () => void
}

const CooldownButton = forwardRef<CooldownButtonHandle, CooldownButtonProps>(
  function CooldownButton({ duration = 5000, onExpire, onTap, label, emoji }, ref) {
    const [progress, setProgress] = useState(1) // 1 = full, 0 = expired
    const [isPaused, setIsPaused] = useState(false)
    const startTimeRef = useRef(0)
    const remainingRef = useRef(duration)
    const rafRef = useRef<number | null>(null)
    const onExpireRef = useRef(onExpire)
    onExpireRef.current = onExpire

    useImperativeHandle(ref, () => ({
      pause() {
        setIsPaused(true)
        remainingRef.current = remainingRef.current - (Date.now() - startTimeRef.current)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      },
      resume() {
        setIsPaused(false)
        startTimeRef.current = Date.now()
        // Animation restarts in useEffect
      },
      reset() {
        remainingRef.current = duration
        startTimeRef.current = Date.now()
        setProgress(1)
        setIsPaused(false)
      },
    }))

    useEffect(() => {
      if (isPaused) return

      startTimeRef.current = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current
        const remaining = remainingRef.current - elapsed
        const p = Math.max(0, remaining / duration)
        setProgress(p)

        if (p <= 0) {
          onExpireRef.current()
          return
        }

        rafRef.current = requestAnimationFrame(animate)
      }

      rafRef.current = requestAnimationFrame(animate)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }, [isPaused, duration])

    // SVG circle properties
    const size = 72
    const strokeWidth = 3
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    return (
      <button
        onClick={onTap}
        className="relative flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Cooldown border SVG */}
        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle (counter-clockwise from top) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: isPaused ? 'none' : undefined }}
          />
        </svg>
        {/* Content */}
        <span className="text-2xl">{emoji}</span>
        <span className="text-[10px] font-bold text-text-sec mt-0.5">{label}</span>
      </button>
    )
  },
)

export default CooldownButton
