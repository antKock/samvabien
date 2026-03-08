'use client'

import { useState, useCallback } from 'react'

interface WelcomeBannerProps {
  joinCode: string
  onDismiss: () => void
}

export default function WelcomeBanner({ joinCode, onDismiss }: WelcomeBannerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const link = `${window.location.origin}/join/${joinCode}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [joinCode])

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onDismiss()
    }
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16"
      onClick={handleBackdropClick}
    >
      <div className="relative mx-4 w-full max-w-[400px] rounded-[20px] bg-surface p-5 shadow-lg">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-text-sec"
          style={{ fontSize: '16px', fontWeight: 700 }}
          aria-label="Fermer"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '32px' }}>🎉</span>

          <h2
            className="text-text"
            style={{ fontSize: '20px', fontWeight: 800 }}
          >
            Bienvenue !
          </h2>

          <p
            className="text-center text-text-sec"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            Partagez ce code pour que l&apos;autre parent puisse rejoindre le foyer :
          </p>

          <p
            className="text-text"
            style={{ fontSize: '16px', fontWeight: 700 }}
          >
            {joinCode}
          </p>

          <button
            onClick={handleCopy}
            className="h-10 w-full rounded-full border border-accent/20 bg-accent/10 text-accent"
            style={{ fontSize: '13px', fontWeight: 700 }}
          >
            {copied ? '✓ Copié !' : 'Copier le lien'}
          </button>
        </div>
      </div>
    </div>
  )
}
