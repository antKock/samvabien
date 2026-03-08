'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { formatDuration } from '@/lib/format'

/**
 * Hook that returns a live-updating formatted duration since a given timestamp.
 * Updates every second. Returns null if since is null.
 */
export function useSleepChrono(since: string | null): string | null {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!since) return () => {}
      const interval = setInterval(callback, 1000)
      return () => clearInterval(interval)
    },
    [since],
  )

  const getSnapshot = useCallback(() => {
    if (!since) return null
    return formatDuration(Date.now() - new Date(since).getTime())
  }, [since])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
