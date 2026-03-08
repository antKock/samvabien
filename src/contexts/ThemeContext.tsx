'use client'

import { createContext, useEffect, type ReactNode } from 'react'
import { useHousehold } from '@/hooks/useHousehold'
import { getTheme } from '@/lib/sleep-state-machine'
import type { SleepState } from '@/types'

interface ThemeContextValue {
  theme: 'day' | 'night'
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'day' })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useHousehold()
  const sleepState = (profile?.sleepState ?? 'awake') as SleepState
  const theme = getTheme(sleepState)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export { ThemeContext }
