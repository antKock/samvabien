'use client'

import { useRouter } from 'next/navigation'

export default function DemoBanner() {
  const router = useRouter()

  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-border bg-surface px-4 py-1.5"
    >
      <span
        className="text-text-sec"
        style={{ fontSize: '12px', fontWeight: 600 }}
      >
        Mode démo — données non conservées
      </span>
      <button
        onClick={() => router.push('/')}
        className="text-text-sec underline"
        style={{ fontSize: '12px', fontWeight: 600 }}
      >
        Quitter
      </button>
    </div>
  )
}
