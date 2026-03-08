'use client'

import { useState, useCallback } from 'react'
import { DEMO_PROFILE, DEMO_EVENTS } from '@/lib/demo-data'
import type { Profile, BabyEvent, SleepState, EventType, Moment } from '@/types'

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

export function useDemo() {
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE)
  const [events, setEvents] = useState<BabyEvent[]>(DEMO_EVENTS)

  const addEvent = useCallback(async (params: AddEventParams) => {
    const newEvent: BabyEvent = {
      id: `demo-new-${Date.now()}`,
      profileId: profile.id,
      type: params.type,
      value: params.value,
      startedAt: params.startedAt ?? null,
      endedAt: null,
      moment: params.moment ?? null,
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [newEvent, ...prev])
  }, [profile.id])

  const updateEvent = useCallback(async (id: string, data: UpdateEventParams) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    )
  }, [])

  const removeEventLocally = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const restoreEvent = useCallback((event: BabyEvent) => {
    setEvents((prev) => {
      const events = [...prev, event].sort((a, b) => {
        const aTime = a.startedAt ?? a.createdAt
        const bTime = b.startedAt ?? b.createdAt
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
      return events
    })
  }, [])

  const deleteEvent = useCallback(async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const transitionSleepState = useCallback(async (newState: SleepState, time: string) => {
    setProfile((prev) => ({
      ...prev,
      sleepState: newState,
      sleepStateSince: time,
      sleepStateMoment: null,
    }))

    // Create transition event in memory
    const eventTypeMap: Record<SleepState, EventType> = {
      awake: 'nap',
      nap: 'nap',
      night: 'night',
      'night-wake': 'night-wake',
    }
    const eventType = eventTypeMap[newState]
    const newEvent: BabyEvent = {
      id: `demo-new-${Date.now()}`,
      profileId: profile.id,
      type: eventType,
      value: 0,
      startedAt: time,
      endedAt: null,
      moment: null,
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [newEvent, ...prev])
  }, [profile.id])

  const updateProfile = useCallback(async (data: UpdateProfileParams) => {
    setProfile((prev) => ({ ...prev, ...data }))
  }, [])

  return {
    profile,
    events,
    devices: [],
    isDemo: true as const,
    isLoading: false,
    error: null as string | null,
    addEvent,
    updateEvent,
    removeEventLocally,
    restoreEvent,
    deleteEvent,
    transitionSleepState,
    updateProfile,
    clearError: () => {},
    _ingestRealtimeEvent: () => {},
    _ingestRealtimeProfile: () => {},
  }
}
