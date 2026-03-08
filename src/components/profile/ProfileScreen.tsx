'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useHousehold } from '@/hooks/useHousehold'
import ScrollWheels from '@/components/ui/ScrollWheels'
import { buildWeightColumns } from '@/lib/weight-columns'

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

function formatWeight(hg: number): string {
  const kg = Math.floor(hg / 10)
  const remainder = hg % 10
  return `${kg},${remainder} kg`
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function buildDateColumns(currentDob: string) {
  const current = new Date(currentDob)
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => String(currentYear - 2 + i))

  return [
    { label: 'Jour', values: days, defaultIndex: current.getDate() - 1 },
    { label: 'Mois', values: MONTHS, defaultIndex: current.getMonth() },
    { label: 'Année', values: years, defaultIndex: Math.max(0, years.indexOf(String(current.getFullYear()))) },
  ]
}

export default function ProfileScreen() {
  const router = useRouter()
  const { profile, devices, updateProfile, error, clearError } = useHousehold()

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(clearError, 4000)
    return () => clearTimeout(timer)
  }, [error, clearError])

  const [copiedLink, setCopiedLink] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Inline editing states
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [isEditingDob, setIsEditingDob] = useState(false)
  const [dobValues, setDobValues] = useState<string[]>([])

  const [isEditingWeight, setIsEditingWeight] = useState(false)
  const [weightValues, setWeightValues] = useState<string[]>([])

  const handleCopyLink = useCallback(async () => {
    if (!profile) return
    const link = `${window.location.origin}/join/${profile.joinCode}`
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }, [profile])

  const handleRevokeDevice = useCallback(async (deviceId: string) => {
    const confirmed = window.confirm('Déconnecter cet appareil ?')
    if (!confirmed) return
    await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' })
  }, [])

  const handleLeave = useCallback(async () => {
    const confirmed = window.confirm(
      'Quitter le profil ? Vous perdrez l\'accès aux données.'
    )
    if (!confirmed) return

    setIsLeaving(true)
    try {
      const res = await fetch('/api/leave', { method: 'POST' })
      if (res.ok) {
        router.push('/')
      }
    } finally {
      setIsLeaving(false)
    }
  }, [router])

  // Name editing
  const startEditingName = useCallback(() => {
    if (!profile) return
    setEditName(profile.babyName)
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }, [profile])

  const handleNameBlur = useCallback(async () => {
    setIsEditingName(false)
    const trimmed = editName.trim()
    if (!trimmed || trimmed.length > 30 || trimmed === profile?.babyName) return
    await updateProfile({ babyName: trimmed })
  }, [editName, profile?.babyName, updateProfile])

  // Date editing
  const startEditingDob = useCallback(() => {
    if (!profile) return
    const cols = buildDateColumns(profile.babyDob)
    setDobValues(cols.map((c) => c.values[c.defaultIndex ?? 0]))
    setIsEditingDob(true)
  }, [profile])

  const handleDobConfirm = useCallback(async () => {
    setIsEditingDob(false)
    if (dobValues.length < 3) return
    const monthIndex = MONTHS.indexOf(dobValues[1])
    const year = parseInt(dobValues[2])
    const day = parseInt(dobValues[0])
    const date = new Date(year, monthIndex, day)

    // Reject invalid combos (e.g. Feb 31 rolls to March 3 — getDate() won't match)
    if (isNaN(date.getTime()) || date.getDate() !== day || date > new Date()) return
    const iso = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (iso === profile?.babyDob) return
    await updateProfile({ babyDob: iso })
  }, [dobValues, profile?.babyDob, updateProfile])

  // Weight editing
  const startEditingWeight = useCallback(() => {
    if (!profile) return
    const cols = buildWeightColumns(profile.babyWeightHg)
    setWeightValues(cols.map((c) => c.values[c.defaultIndex ?? 0]))
    setIsEditingWeight(true)
  }, [profile])

  const handleWeightConfirm = useCallback(async () => {
    setIsEditingWeight(false)
    if (weightValues.length < 2) return
    const kg = parseInt(weightValues[0])
    const hg = parseInt(weightValues[1])
    const newHg = kg * 10 + hg
    if (newHg < 20 || newHg > 150 || newHg === profile?.babyWeightHg) return
    await updateProfile({ babyWeightHg: newHg })
  }, [weightValues, profile?.babyWeightHg, updateProfile])

  if (!profile) return null

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-[430px] px-4 py-4">
        {/* Header with back button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-text-sec"
            style={{ fontSize: '20px' }}
            aria-label="Retour"
          >
            ←
          </button>
          <h1
            className="text-text"
            style={{ fontSize: '16px', fontWeight: 800 }}
          >
            Profil
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Section: Informations bébé */}
          <section className="rounded-[20px] bg-surface p-5">
            <h2
              className="mb-4 text-text"
              style={{ fontSize: '14px', fontWeight: 800 }}
            >
              Informations bébé
            </h2>
            <div className="flex flex-col gap-3">
              {/* Prénom — inline editable */}
              <div className="flex items-center justify-between">
                <span className="text-text-sec" style={{ fontSize: '13px', fontWeight: 600 }}>Prénom</span>
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') nameInputRef.current?.blur() }}
                    maxLength={30}
                    className="w-32 rounded-lg border border-accent/30 bg-bg px-2 py-1 text-right text-text outline-none focus:border-accent"
                    style={{ fontSize: '13px', fontWeight: 700 }}
                  />
                ) : (
                  <button
                    onClick={startEditingName}
                    className="text-text"
                    style={{ fontSize: '13px', fontWeight: 700 }}
                  >
                    {profile.babyName}
                  </button>
                )}
              </div>

              {/* Date de naissance — scroll wheels */}
              <div className="flex items-center justify-between">
                <span className="text-text-sec" style={{ fontSize: '13px', fontWeight: 600 }}>Date de naissance</span>
                <button
                  onClick={startEditingDob}
                  className="text-text"
                  style={{ fontSize: '13px', fontWeight: 700 }}
                >
                  {formatDate(profile.babyDob)}
                </button>
              </div>
              {isEditingDob && (
                <div className="rounded-[14px] bg-bg p-3">
                  <ScrollWheels
                    columns={buildDateColumns(profile.babyDob)}
                    onChange={setDobValues}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingDob(false)}
                      className="rounded-full px-4 py-1.5 text-text-sec"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDobConfirm}
                      className="rounded-full bg-accent px-4 py-1.5 text-white"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* Poids — scroll wheels */}
              <div className="flex items-center justify-between">
                <span className="text-text-sec" style={{ fontSize: '13px', fontWeight: 600 }}>Poids</span>
                <button
                  onClick={startEditingWeight}
                  className="text-text"
                  style={{ fontSize: '13px', fontWeight: 700 }}
                >
                  {formatWeight(profile.babyWeightHg)}
                </button>
              </div>
              {isEditingWeight && (
                <div className="rounded-[14px] bg-bg p-3">
                  <ScrollWheels
                    columns={buildWeightColumns(profile.babyWeightHg)}
                    onChange={setWeightValues}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingWeight(false)}
                      className="rounded-full px-4 py-1.5 text-text-sec"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleWeightConfirm}
                      className="rounded-full bg-accent px-4 py-1.5 text-white"
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Rappel de pesée */}
          <section className="rounded-[20px] bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-text" style={{ fontSize: '14px', fontWeight: 800 }}>
                  Rappel de pesée
                </h2>
                <p className="mt-1 text-text-sec" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Un rappel mensuel pour mettre à jour le poids
                </p>
              </div>
              <button
                role="switch"
                aria-checked={profile.weightReminder}
                onClick={() => updateProfile({ weightReminder: !profile.weightReminder })}
                className="mt-0.5 flex h-[28px] w-[48px] shrink-0 items-center rounded-full p-[2px] transition-colors"
                style={{ backgroundColor: profile.weightReminder ? 'var(--accent)' : 'var(--border)' }}
              >
                <div
                  className="h-[24px] w-[24px] rounded-full bg-white shadow transition-transform"
                  style={{ transform: profile.weightReminder ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </section>

          {/* Section: Foyer */}
          <section className="rounded-[20px] bg-surface p-5">
            <h2
              className="mb-4 text-text"
              style={{ fontSize: '14px', fontWeight: 800 }}
            >
              Foyer
            </h2>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-text" style={{ fontSize: '16px', fontWeight: 700 }}>
                {profile.joinCode}
              </span>
              <button
                onClick={handleCopyLink}
                className="rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-accent"
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                {copiedLink ? '✓ Copié !' : 'Copier le lien'}
              </button>
            </div>

            <h3
              className="mb-3 text-text-sec"
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              Appareils connectés
            </h3>

            <div className="flex flex-col gap-2">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-[14px] bg-bg p-3"
                >
                  <div>
                    <p className="text-text" style={{ fontSize: '13px', fontWeight: 700 }}>
                      {device.deviceName ?? 'Appareil inconnu'}
                    </p>
                    <p className="text-text-sec" style={{ fontSize: '11px', fontWeight: 600 }}>
                      Dernière connexion : {formatDate(device.lastSeen)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeDevice(device.id)}
                    className="text-milk-accent"
                    style={{ fontSize: '12px', fontWeight: 700 }}
                  >
                    Déconnecter
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Actions */}
          <section>
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="h-12 w-full rounded-full bg-red-600 text-white disabled:opacity-50"
              style={{ fontSize: '14px', fontWeight: 700 }}
            >
              {isLeaving ? '...' : 'Quitter le profil'}
            </button>
          </section>
        </div>
      </div>

      {/* Error feedback */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-[430px]">
          <button
            onClick={clearError}
            className="w-full rounded-[16px] bg-surface px-4 py-3 text-center text-text"
            style={{ fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {error}
          </button>
        </div>
      )}
    </div>
  )
}
