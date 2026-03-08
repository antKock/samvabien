'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Profile, BabyEvent, DeviceSession, SleepState, EventType, Moment } from '@/types'

interface HouseholdState {
  profile: Profile | null
  events: BabyEvent[]
  devices: DeviceSession[]
  isDemo: boolean
  isLoading: boolean
  error: string | null
}

interface AddEventParams {
  type: EventType
  value: number
  startedAt?: string
  moment?: Moment
}

interface UpdateEventParams {
  value?: number
  startedAt?: string
  moment?: Moment | null
}

interface UpdateProfileParams {
  babyName?: string
  babyDob?: string
  babyWeightHg?: number
  weightReminder?: boolean
}

interface HouseholdContextValue extends HouseholdState {
  transitionSleepState: (newState: SleepState, time: string) => Promise<void>
  addEvent: (params: AddEventParams) => Promise<void>
  updateEvent: (id: string, data: UpdateEventParams) => Promise<void>
  removeEventLocally: (id: string) => void
  restoreEvent: (event: BabyEvent) => void
  deleteEvent: (id: string) => Promise<void>
  updateProfile: (data: UpdateProfileParams) => Promise<void>
  clearError: () => void
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null)

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HouseholdState>({
    profile: null,
    events: [],
    devices: [],
    isDemo: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/household')
        if (!res.ok) throw new Error('Failed to load household')
        const json = await res.json()
        setState({
          profile: json.data.profile,
          events: json.data.events,
          devices: json.data.devices,
          isDemo: false,
          isLoading: false,
          error: null,
        })
      } catch {
        setState((s) => ({ ...s, isLoading: false }))
      }
    }
    load()
  }, [])

  const transitionSleepState = useCallback(
    async (newState: SleepState, time: string) => {
      // Capture prev profile from latest state via functional update
      let prevProfile: Profile | null = null
      setState((s) => {
        prevProfile = s.profile
        if (!s.profile) return s
        return {
          ...s,
          profile: { ...s.profile, sleepState: newState, sleepStateSince: time, sleepStateMoment: null },
        }
      })

      if (!prevProfile) return

      try {
        const res = await fetch('/api/sleep-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newState, time }),
        })

        if (!res.ok) {
          // Rollback + error feedback
          const json = await res.json().catch(() => ({ error: { message: 'Erreur réseau' } }))
          setState((s) => ({ ...s, profile: prevProfile, error: json.error?.message ?? 'Erreur lors de la transition' }))
          return
        }

        const json = await res.json()
        if (json.data.event) {
          setState((s) => ({
            ...s,
            events: [json.data.event, ...s.events],
          }))
        }
      } catch {
        // Rollback + error feedback
        setState((s) => ({ ...s, profile: prevProfile, error: 'Erreur réseau — la transition n\'a pas été enregistrée' }))
      }
    },
    [],
  )

  const addEvent = useCallback(
    async (params: AddEventParams) => {
      // Optimistic: create temp event with profile id from latest state
      const tempId = `temp-${Date.now()}`
      let prevEvents: BabyEvent[] = []

      setState((s) => {
        prevEvents = s.events
        const optimisticEvent: BabyEvent = {
          id: tempId,
          profileId: s.profile?.id ?? '',
          type: params.type,
          value: params.value,
          startedAt: params.startedAt ?? null,
          endedAt: null,
          moment: params.moment ?? null,
          createdAt: new Date().toISOString(),
        }
        return { ...s, events: [optimisticEvent, ...s.events] }
      })

      try {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        })

        if (!res.ok) {
          const json = await res.json().catch(() => ({ error: { message: 'Erreur réseau' } }))
          setState((s) => ({ ...s, events: prevEvents, error: json.error?.message ?? 'Erreur lors de l\'enregistrement' }))
          return
        }

        const json = await res.json()
        // Replace temp event with server event
        setState((s) => ({
          ...s,
          events: s.events.map((e) => (e.id === tempId ? json.data.event : e)),
        }))
      } catch {
        setState((s) => ({ ...s, events: prevEvents, error: 'Erreur réseau — l\'événement n\'a pas été enregistré' }))
      }
    },
    [],
  )

  const updateEvent = useCallback(
    async (id: string, data: UpdateEventParams) => {
      let prevEvents: BabyEvent[] = []

      // Optimistic update
      setState((s) => {
        prevEvents = s.events
        return {
          ...s,
          events: s.events.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }
      })

      try {
        const res = await fetch(`/api/events/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!res.ok) {
          const json = await res.json().catch(() => ({ error: { message: 'Erreur réseau' } }))
          setState((s) => ({ ...s, events: prevEvents, error: json.error?.message ?? 'Erreur lors de la modification' }))
          return
        }

        const json = await res.json()
        setState((s) => ({
          ...s,
          events: s.events.map((e) => (e.id === id ? json.data.event : e)),
        }))
      } catch {
        setState((s) => ({ ...s, events: prevEvents, error: 'Erreur réseau — la modification n\'a pas été enregistrée' }))
      }
    },
    [],
  )

  const removeEventLocally = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      events: s.events.filter((e) => e.id !== id),
    }))
  }, [])

  const restoreEvent = useCallback((event: BabyEvent) => {
    setState((s) => {
      const events = [...s.events, event].sort((a, b) => {
        const aTime = a.startedAt ?? a.createdAt
        const bTime = b.startedAt ?? b.createdAt
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
      return { ...s, events }
    })
  }, [])

  const deleteEvent = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
        })

        if (!res.ok) {
          const json = await res.json().catch(() => ({ error: { message: 'Erreur réseau' } }))
          setState((s) => ({ ...s, error: json.error?.message ?? 'Erreur lors de la suppression' }))
        }
      } catch {
        setState((s) => ({ ...s, error: 'Erreur réseau — la suppression n\'a pas été enregistrée' }))
      }
    },
    [],
  )

  const updateProfile = useCallback(
    async (data: UpdateProfileParams) => {
      let prevProfile: Profile | null = null

      // Optimistic update
      setState((s) => {
        prevProfile = s.profile
        if (!s.profile) return s
        return {
          ...s,
          profile: { ...s.profile, ...data },
        }
      })

      if (!prevProfile) return

      try {
        const res = await fetch('/api/profiles', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!res.ok) {
          const json = await res.json().catch(() => ({ error: { message: 'Erreur réseau' } }))
          setState((s) => ({ ...s, profile: prevProfile, error: json.error?.message ?? 'Erreur lors de la mise à jour' }))
          return
        }

        const json = await res.json()
        setState((s) => ({ ...s, profile: json.data.profile }))
      } catch {
        setState((s) => ({ ...s, profile: prevProfile, error: 'Erreur réseau — la mise à jour n\'a pas été enregistrée' }))
      }
    },
    [],
  )

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return (
    <HouseholdContext.Provider value={{ ...state, transitionSleepState, addEvent, updateEvent, removeEventLocally, restoreEvent, deleteEvent, updateProfile, clearError }}>
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold(): HouseholdContextValue {
  const ctx = useContext(HouseholdContext)
  if (!ctx) {
    throw new Error('useHousehold must be used within HouseholdProvider')
  }
  return ctx
}
