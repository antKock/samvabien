'use client'

import { useRef, useEffect, useCallback } from 'react'

interface Column {
  label: string
  values: string[]
  defaultIndex?: number
}

interface ScrollWheelsProps {
  columns: Column[]
  onChange: (values: string[]) => void
}

const ITEM_HEIGHT = 44

function WheelColumn({
  column,
  onSelect,
}: {
  column: Column
  onSelect: (value: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(column.defaultIndex ?? 0)

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const container = containerRef.current
    if (!container) return
    container.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: smooth ? 'smooth' : 'instant',
    })
  }, [])

  useEffect(() => {
    scrollToIndex(column.defaultIndex ?? 0, false)
  }, [column.defaultIndex, scrollToIndex])

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const index = Math.round(container.scrollTop / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(index, column.values.length - 1))
    if (clampedIndex !== selectedRef.current) {
      selectedRef.current = clampedIndex
      onSelect(column.values[clampedIndex])
    }
  }, [column.values, onSelect])

  return (
    <div className="flex flex-col items-center">
      <span
        className="text-text-sec mb-1"
        style={{ fontSize: '11px', fontWeight: 600 }}
      >
        {column.label}
      </span>
      <div className="relative h-[132px] w-full overflow-hidden">
        {/* Fade top */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[44px]"
          style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }}
        />
        {/* Fade bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[44px]"
          style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }}
        />
        {/* Highlight center */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[44px] z-10 h-[44px] rounded-[14px] border border-accent/20 bg-accent/5"
        />
        <div
          ref={containerRef}
          className="h-full snap-y snap-mandatory overflow-y-auto scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
          onScroll={handleScroll}
        >
          {/* Spacer top */}
          <div style={{ height: ITEM_HEIGHT }} />
          {column.values.map((value, i) => (
            <div
              key={`${value}-${i}`}
              className="flex snap-center items-center justify-center text-text"
              style={{
                height: ITEM_HEIGHT,
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              {value}
            </div>
          ))}
          {/* Spacer bottom */}
          <div style={{ height: ITEM_HEIGHT }} />
        </div>
      </div>
    </div>
  )
}

export default function ScrollWheels({ columns, onChange }: ScrollWheelsProps) {
  const valuesRef = useRef<string[]>(
    columns.map((col) => col.values[col.defaultIndex ?? 0])
  )

  const handleSelect = useCallback(
    (colIndex: number, value: string) => {
      valuesRef.current[colIndex] = value
      onChange([...valuesRef.current])
    },
    [onChange]
  )

  return (
    <div className="flex gap-2">
      {columns.map((column, index) => (
        <div key={column.label} className="flex-1">
          <WheelColumn
            column={column}
            onSelect={(value) => handleSelect(index, value)}
          />
        </div>
      ))}
    </div>
  )
}
