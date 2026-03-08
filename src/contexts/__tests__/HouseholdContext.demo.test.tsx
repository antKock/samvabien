import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HouseholdProvider, useHousehold } from '../HouseholdContext'

// Mock useDemo to avoid importing actual demo data module
vi.mock('@/hooks/useDemo', () => ({
  useDemo: () => ({
    profile: {
      id: 'demo-profile',
      babyName: 'Léo',
      babyDob: '2025-11-08',
      babyWeightHg: 62,
      joinCode: 'DEMO-0000',
      sleepState: 'awake',
      sleepStateSince: null,
      sleepStateMoment: null,
      weightReminder: true,
      createdAt: '2025-11-08',
    },
    events: [],
    devices: [],
    isDemo: true,
    isLoading: false,
    error: null,
    addEvent: vi.fn(),
    updateEvent: vi.fn(),
    removeEventLocally: vi.fn(),
    restoreEvent: vi.fn(),
    deleteEvent: vi.fn(),
    transitionSleepState: vi.fn(),
    updateProfile: vi.fn(),
    clearError: vi.fn(),
    _ingestRealtimeEvent: vi.fn(),
    _ingestRealtimeProfile: vi.fn(),
  }),
}))

function TestConsumer() {
  const ctx = useHousehold()
  return (
    <div>
      <span data-testid="isDemo">{String(ctx.isDemo)}</span>
      <span data-testid="isLoading">{String(ctx.isLoading)}</span>
      <span data-testid="babyName">{ctx.profile?.babyName}</span>
    </div>
  )
}

describe('HouseholdContext en mode démo', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch')

  beforeEach(() => {
    fetchSpy.mockClear()
  })

  it('does not call any API when demo=true', async () => {
    await act(async () => {
      render(
        <HouseholdProvider demo>
          <TestConsumer />
        </HouseholdProvider>
      )
    })

    expect(screen.getByTestId('isDemo').textContent).toBe('true')
    expect(screen.getByTestId('isLoading').textContent).toBe('false')
    expect(screen.getByTestId('babyName').textContent).toBe('Léo')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
