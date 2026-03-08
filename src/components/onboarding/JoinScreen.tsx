'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface JoinScreenProps {
  initialCode?: string
}

function normalizeCode(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  if (clean.length > 4) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`
  }
  return clean
}

function isCompleteCode(normalized: string): boolean {
  return /^[A-Z]{4}-\d{4}$/.test(normalized)
}

export default function JoinScreen({ initialCode }: JoinScreenProps) {
  const router = useRouter()
  const [code, setCode] = useState(initialCode ? normalizeCode(initialCode) : '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lookup = useCallback(async (joinCode: string) => {
    setStatus('loading')
    setError(null)

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode }),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.message ?? 'Code introuvable, vérifiez la saisie')
        setStatus('error')
        return
      }

      // Pré-poser le cookie dismiss pour que le banner de bienvenue ne s'affiche pas (réservé aux créateurs)
      document.cookie = 'pousse_welcome_dismissed=1; path=/; max-age=315360000'
      router.push('/dashboard')
    } catch {
      setError('Erreur de connexion')
      setStatus('error')
    }
  }, [router])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeCode(e.target.value)
    setCode(normalized)
    setStatus('idle')
    setError(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (isCompleteCode(normalized)) {
      debounceRef.current = setTimeout(() => {
        lookup(normalized)
      }, 300)
    }
  }, [lookup])

  // Auto-lookup for initial code from URL
  useEffect(() => {
    if (initialCode) {
      const normalized = normalizeCode(initialCode)
      if (isCompleteCode(normalized)) {
        lookup(normalized)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <div className="flex w-full max-w-[430px] flex-col items-center gap-8">
        <h1
          className="text-text"
          style={{ fontSize: '24px', fontWeight: 800 }}
        >
          Rejoindre un foyer
        </h1>

        <p
          className="text-center text-text-sec"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          Saisissez le code d&apos;invitation partagé par l&apos;autre parent
        </p>

        <div className="relative w-full">
          <input
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="Code d'invitation"
            className="h-14 w-full rounded-[14px] border border-border bg-surface px-4 text-center text-text outline-none focus:border-accent"
            style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '2px' }}
            maxLength={9}
            autoFocus
          />

          {status === 'loading' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent"
              />
            </div>
          )}
        </div>

        {error && (
          <p
            className="text-center text-milk-accent"
            style={{ fontSize: '12px', fontWeight: 600 }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
