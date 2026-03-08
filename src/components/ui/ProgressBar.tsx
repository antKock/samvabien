'use client'

interface ProgressBarProps {
  value: number
  target: { min: number; max: number }
  avg?: number
  accentColor: string
  trackColor: string
}

export default function ProgressBar({
  value,
  target,
  avg,
  accentColor,
  trackColor,
}: ProgressBarProps) {
  // Bar max = target.max * 1.2 (20% margin beyond target zone)
  const barMax = target.max * 1.2
  const fillPct = Math.min(100, (value / barMax) * 100)
  const targetMinPct = (target.min / barMax) * 100
  const targetMaxPct = (target.max / barMax) * 100
  const avgPct = avg !== undefined ? (avg / barMax) * 100 : undefined

  return (
    <div className="relative h-2 w-full" style={{ borderRadius: 4 }}>
      {/* Track */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: trackColor, borderRadius: 4 }}
      />

      {/* Target zone (shaded) */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: `${targetMinPct}%`,
          width: `${targetMaxPct - targetMinPct}%`,
          backgroundColor: accentColor,
          opacity: 0.2,
          borderRadius: 4,
        }}
      />

      {/* Fill */}
      <div
        className="absolute top-0 bottom-0 left-0"
        style={{
          width: `${fillPct}%`,
          backgroundColor: accentColor,
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }}
      />

      {/* Bar-now (circle at end of fill) */}
      {fillPct > 0 && (
        <div
          className="absolute top-1/2"
          style={{
            left: `${fillPct}%`,
            transform: 'translate(-50%, -50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: accentColor,
          }}
        />
      )}

      {/* Bar-avg (hollow ring) */}
      {avgPct !== undefined && avgPct > 0 && (
        <div
          className="absolute top-1/2"
          style={{
            left: `${Math.min(100, avgPct)}%`,
            transform: 'translate(-50%, -50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: trackColor,
            border: `2px solid ${accentColor}`,
            opacity: 0.6,
          }}
        />
      )}
    </div>
  )
}
