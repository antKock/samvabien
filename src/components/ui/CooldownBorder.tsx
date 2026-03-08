'use client'

import { useEffect, useState, type RefObject } from 'react'

interface CooldownBorderProps {
  toastRef: RefObject<HTMLDivElement | null>
  duration: number // ms
  accentColor: string
}

export default function CooldownBorder({ toastRef, duration, accentColor }: CooldownBorderProps) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = toastRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setDims({ w: rect.width + 2, h: rect.height + 2 })
  }, [toastRef])

  if (!dims) return null

  const { w, h } = dims
  const s = 1.25 // half stroke-width
  const r = 18
  const mx = w / 2

  const d = [
    `M ${mx} ${s}`,
    `H ${w - s - r}`,
    `A ${r} ${r} 0 0 1 ${w - s} ${s + r}`,
    `V ${h - s - r}`,
    `A ${r} ${r} 0 0 1 ${w - s - r} ${h - s}`,
    `H ${s + r}`,
    `A ${r} ${r} 0 0 1 ${s} ${h - s - r}`,
    `V ${s + r}`,
    `A ${r} ${r} 0 0 1 ${s + r} ${s}`,
    `H ${mx}`,
  ].join(' ')

  const perim = 2 * (w + h - 4 * s) - 8 * r + 2 * Math.PI * r

  return (
    <svg
      style={{
        position: 'absolute',
        inset: -1,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
      width={w}
      height={h}
    >
      <path
        d={d}
        fill="none"
        stroke={accentColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={perim}
        strokeDashoffset={0}
        style={{
          '--perim': perim,
          animation: `cooldown-stroke ${duration}ms linear forwards`,
        } as React.CSSProperties}
      />
    </svg>
  )
}
