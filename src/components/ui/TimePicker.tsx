'use client'

import { useState } from 'react'
import ScrollWheels from './ScrollWheels'

interface TimePickerProps {
  initialTime: Date
  onConfirm: (time: Date) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

export default function TimePicker({ initialTime, onConfirm }: TimePickerProps) {
  const [hour, setHour] = useState(initialTime.getHours())
  const [minute, setMinute] = useState(initialTime.getMinutes())

  const handleConfirm = () => {
    const d = new Date(initialTime)
    d.setHours(hour, minute, 0, 0)
    onConfirm(d)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1">
        <div className="w-20">
          <ScrollWheels
            columns={[
              { label: '', values: HOURS, defaultIndex: initialTime.getHours() },
            ]}
            onChange={(values) => {
              setHour(parseInt(values[0], 10))
            }}
          />
        </div>
        <span
          className="text-text font-bold text-xl mt-4"
        >
          h
        </span>
        <div className="w-20">
          <ScrollWheels
            columns={[
              { label: '', values: MINUTES, defaultIndex: initialTime.getMinutes() },
            ]}
            onChange={(values) => {
              setMinute(parseInt(values[0], 10))
            }}
          />
        </div>
      </div>
      <button
        onClick={handleConfirm}
        className="px-6 py-2 rounded-full bg-accent text-surface font-bold text-sm"
      >
        OK
      </button>
    </div>
  )
}
