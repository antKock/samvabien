import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { HouseholdProvider, useHousehold } from '../HouseholdContext'
import type { ReactNode } from 'react'

// Mock fetch for initial load
const mockProfile = {
  id: 'profile-1',
  babyName: 'Léo',
  babyDob: '2026-01-01',
  babyWeightHg: 35,
  joinCode: 'ABCD-1234',
  sleepState: 'awake',
  sleepStateSince: null,
  sleepStateMoment: null,
  weightReminder: false,
  createdAt: '2026-01-01T00:00:00Z',
}

const mockEvents = [
  {
    id: 'event-1',
    profileId: 'profile-1',
    type: 'bottle',
    value: 120,
    startedAt: '2026-03-08T10:00:00Z',
    endedAt: null,
    moment: 'morning',
    createdAt: '2026-03-08T10:00:00Z',
  },
]

beforeEach(() => {
  vi.restoreAllMocks()
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        data: {
          profile: mockProfile,
          events: [...mockEvents],
          devices: [],
        },
      }),
  }) as unknown as typeof fetch
})

function wrapper({ children }: { children: ReactNode }) {
  return <HouseholdProvider>{children}</HouseholdProvider>
}

async function setupHook() {
  const { result } = renderHook(() => useHousehold(), { wrapper })
  // Wait for initial load
  await vi.waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
  return result
}

describe('_ingestRealtimeEvent', () => {
  it('INSERT broadcasté → event ajouté au state', async () => {
    const result = await setupHook()

    act(() => {
      result.current._ingestRealtimeEvent('INSERT', {
        id: 'event-2',
        profile_id: 'profile-1',
        type: 'bottle',
        value: 90,
        started_at: '2026-03-08T12:00:00Z',
        ended_at: null,
        moment: 'noon',
        created_at: '2026-03-08T12:00:00Z',
      })
    })

    expect(result.current.events).toHaveLength(2)
    expect(result.current.events.find((e) => e.id === 'event-2')).toBeDefined()
  })

  it('UPDATE broadcasté → event mis à jour', async () => {
    const result = await setupHook()

    act(() => {
      result.current._ingestRealtimeEvent('UPDATE', {
        id: 'event-1',
        profile_id: 'profile-1',
        type: 'bottle',
        value: 150,
        started_at: '2026-03-08T10:00:00Z',
        ended_at: null,
        moment: 'morning',
        created_at: '2026-03-08T10:00:00Z',
      })
    })

    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].value).toBe(150)
  })

  it('DELETE broadcasté → event retiré', async () => {
    const result = await setupHook()

    act(() => {
      result.current._ingestRealtimeEvent('DELETE', {
        id: 'event-1',
      })
    })

    expect(result.current.events).toHaveLength(0)
  })

  it('doublon optimistic ignoré (même id)', async () => {
    const result = await setupHook()

    act(() => {
      result.current._ingestRealtimeEvent('INSERT', {
        id: 'event-1', // Same id as existing event
        profile_id: 'profile-1',
        type: 'bottle',
        value: 120,
        started_at: '2026-03-08T10:00:00Z',
        ended_at: null,
        moment: 'morning',
        created_at: '2026-03-08T10:00:00Z',
      })
    })

    // Should still have only 1 event, not 2
    expect(result.current.events).toHaveLength(1)
  })

  it('INSERT maintient l\'ordre antéchronologique', async () => {
    const result = await setupHook()

    act(() => {
      result.current._ingestRealtimeEvent('INSERT', {
        id: 'event-earlier',
        profile_id: 'profile-1',
        type: 'bottle',
        value: 60,
        started_at: '2026-03-08T08:00:00Z',
        ended_at: null,
        moment: 'morning',
        created_at: '2026-03-08T08:00:00Z',
      })
    })

    // event-1 (10:00) should come before event-earlier (08:00) in reverse-chrono
    expect(result.current.events[0].id).toBe('event-1')
    expect(result.current.events[1].id).toBe('event-earlier')
  })
})

describe('_ingestRealtimeProfile', () => {
  it('UPDATE profiles → sleepState mis à jour dans le context', async () => {
    const result = await setupHook()

    act(() => {
      result.current._ingestRealtimeProfile({
        id: 'profile-1',
        baby_name: 'Léo',
        baby_dob: '2026-01-01',
        baby_weight_hg: 35,
        join_code: 'ABCD-1234',
        sleep_state: 'nap',
        sleep_state_since: '2026-03-08T14:00:00Z',
        sleep_state_moment: 'afternoon',
        weight_reminder: false,
        created_at: '2026-01-01T00:00:00Z',
      })
    })

    expect(result.current.profile?.sleepState).toBe('nap')
    expect(result.current.profile?.sleepStateSince).toBe('2026-03-08T14:00:00Z')
    expect(result.current.profile?.sleepStateMoment).toBe('afternoon')
  })
})
