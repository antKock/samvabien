'use client'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  accentColor: string
  unit?: string
  formatValue?: (value: number) => string
}

export default function Slider({ value, onChange, min, max, step, accentColor, unit = 'mL', formatValue }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="relative w-full pt-6 pb-1">
      {/* Tooltip above thumb */}
      <div
        className="absolute top-0 font-extrabold text-text"
        style={{
          left: `${pct}%`,
          transform: 'translateX(-50%)',
          fontSize: '14px',
        }}
      >
        {formatValue ? formatValue(value) : `${value} ${unit}`}
      </div>

      {/* Range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input w-full"
        style={
          {
            '--slider-accent': accentColor,
            '--slider-pct': `${pct}%`,
          } as React.CSSProperties
        }
      />

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-text-sec" style={{ fontSize: '10px', fontWeight: 600 }}>{formatValue ? formatValue(min) : min}</span>
        <span className="text-text-sec" style={{ fontSize: '10px', fontWeight: 600 }}>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  )
}
