'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ScrollWheels from '@/components/ui/ScrollWheels'
import { CreateProfileSchema } from '@/lib/schemas/profile'

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export default function OnboardingForm() {
  const router = useRouter()
  const [babyName, setBabyName] = useState('')
  const [dobValues, setDobValues] = useState<string[]>(['15', 'Mars', '2025'])
  const [weightValues, setWeightValues] = useState<string[]>(['3', '5'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = useMemo(() => new Date(), [])

  const dobColumns = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
    const months = MONTHS
    const currentYear = today.getFullYear()
    const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i))

    return [
      { label: 'Jour', values: days, defaultIndex: 14 },
      { label: 'Mois', values: months, defaultIndex: today.getMonth() },
      { label: 'Année', values: years, defaultIndex: 0 },
    ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const weightColumns = useMemo(() => {
    const kgs = Array.from({ length: 14 }, (_, i) => String(i + 2))
    const hgs = Array.from({ length: 10 }, (_, i) => String(i))
    return [
      { label: 'kg', values: kgs, defaultIndex: 1 },
      { label: 'hg', values: hgs, defaultIndex: 5 },
    ]
  }, [])

  const parsedDob = useMemo(() => {
    const day = parseInt(dobValues[0])
    const monthIndex = MONTHS.indexOf(dobValues[1])
    const year = parseInt(dobValues[2])
    if (isNaN(day) || monthIndex === -1 || isNaN(year)) return null
    const maxDays = getDaysInMonth(monthIndex, year)
    const clampedDay = Math.min(day, maxDays)
    const date = new Date(year, monthIndex, clampedDay)
    if (date > today) return null
    return date.toISOString().split('T')[0]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dobValues])

  const parsedWeightHg = useMemo(() => {
    const kg = parseInt(weightValues[0])
    const hg = parseInt(weightValues[1])
    if (isNaN(kg) || isNaN(hg)) return null
    return kg * 10 + hg
  }, [weightValues])

  const isValid = babyName.trim().length >= 1 && parsedDob !== null && parsedWeightHg !== null

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return

    const data = {
      babyName: babyName.trim(),
      babyDob: parsedDob!,
      babyWeightHg: parsedWeightHg!,
    }

    const result = CreateProfileSchema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.message ?? 'Une erreur est survenue')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Erreur de connexion')
    } finally {
      setIsSubmitting(false)
    }
  }, [isValid, isSubmitting, babyName, parsedDob, parsedWeightHg, router])

  return (
    <div className="flex min-h-dvh flex-col bg-bg px-6 py-8">
      <div className="mx-auto w-full max-w-[430px]">
        <h1
          className="mb-8 text-center text-text"
          style={{ fontSize: '24px', fontWeight: 800 }}
        >
          Créer un profil
        </h1>

        <div className="flex flex-col gap-6">
          {/* Prénom */}
          <div>
            <label
              htmlFor="baby-name"
              className="mb-2 block text-text"
              style={{ fontSize: '13px', fontWeight: 700 }}
            >
              Prénom du bébé
            </label>
            <input
              id="baby-name"
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              maxLength={30}
              placeholder="Prénom"
              className="h-12 w-full rounded-[14px] border border-border bg-surface px-4 text-text outline-none focus:border-accent"
              style={{ fontSize: '14px', fontWeight: 600 }}
            />
          </div>

          {/* Date de naissance */}
          <div>
            <label
              className="mb-2 block text-text"
              style={{ fontSize: '13px', fontWeight: 700 }}
            >
              Date de naissance
            </label>
            <ScrollWheels columns={dobColumns} onChange={setDobValues} />
          </div>

          {/* Poids */}
          <div>
            <label
              className="mb-2 block text-text"
              style={{ fontSize: '13px', fontWeight: 700 }}
            >
              Poids
            </label>
            <ScrollWheels columns={weightColumns} onChange={setWeightValues} />
          </div>

          {error && (
            <p
              className="text-center text-milk-accent"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="h-12 w-full rounded-full bg-accent text-white disabled:opacity-50"
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            {isSubmitting ? '...' : "C'est parti"}
          </button>
        </div>
      </div>
    </div>
  )
}
