'use client'

import { useState, useCallback } from 'react'
import { useHousehold } from '@/hooks/useHousehold'
import { shouldShowWeightReminder } from '@/lib/weight-reminder'
import ScrollWheels from '@/components/ui/ScrollWheels'
import { buildWeightColumns } from '@/lib/weight-columns'

function getDismissKey(): string {
  const now = new Date()
  return `pousse_weight_reminder_${now.getFullYear()}-${now.getMonth()}`
}

function isDismissedThisMonth(): boolean {
  try {
    return sessionStorage.getItem(getDismissKey()) === '1'
  } catch {
    return false
  }
}

function dismissThisMonth(): void {
  try {
    sessionStorage.setItem(getDismissKey(), '1')
  } catch {
    // sessionStorage unavailable (SSR, private browsing)
  }
}

export default function WeightReminderBanner() {
  const { profile, updateProfile } = useHousehold()
  const [dismissed, setDismissed] = useState(isDismissedThisMonth)
  const [showPicker, setShowPicker] = useState(false)
  const [weightValues, setWeightValues] = useState<string[]>([])

  const handleOpenPicker = useCallback(() => {
    if (!profile) return
    const cols = buildWeightColumns(profile.babyWeightHg)
    setWeightValues(cols.map((c) => c.values[c.defaultIndex ?? 0]))
    setShowPicker(true)
  }, [profile])

  const handleConfirm = useCallback(async () => {
    if (weightValues.length < 2) return
    const kg = parseInt(weightValues[0])
    const hg = parseInt(weightValues[1])
    const newHg = kg * 10 + hg
    if (newHg >= 20 && newHg <= 150) {
      await updateProfile({ babyWeightHg: newHg })
    }
    setShowPicker(false)
    dismissThisMonth(); setDismissed(true)
  }, [weightValues, updateProfile])

  if (!profile || dismissed) return null
  if (!shouldShowWeightReminder(profile.babyDob, profile.weightReminder)) return null

  if (showPicker) {
    return (
      <div className="rounded-[20px] bg-surface p-4">
        <p
          className="mb-3 text-center text-text"
          style={{ fontSize: '14px', fontWeight: 700 }}
        >
          Poids actuel de {profile.babyName}
        </p>
        <ScrollWheels
          columns={buildWeightColumns(profile.babyWeightHg)}
          onChange={setWeightValues}
        />
        <div className="mt-3 flex justify-center gap-2">
          <button
            onClick={() => { setShowPicker(false); dismissThisMonth(); setDismissed(true) }}
            className="rounded-full px-4 py-1.5 text-text-sec"
            style={{ fontSize: '12px', fontWeight: 700 }}
          >
            Plus tard
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-full bg-accent px-4 py-1.5 text-white"
            style={{ fontSize: '12px', fontWeight: 700 }}
          >
            OK
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleOpenPicker}
      className="w-full rounded-[20px] bg-surface p-4 text-left"
    >
      <p className="text-text" style={{ fontSize: '14px', fontWeight: 700 }}>
        Il est temps de peser {profile.babyName} !
      </p>
      <p className="mt-1 text-text-sec" style={{ fontSize: '12px', fontWeight: 600 }}>
        Appuyez pour mettre à jour le poids
      </p>
    </button>
  )
}
