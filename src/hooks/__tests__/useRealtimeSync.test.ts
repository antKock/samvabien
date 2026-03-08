import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const { mockSubscribe, mockOn, mockRemoveChannel, mockChannelFn } = vi.hoisted(() => {
  const mockSubscribe = vi.fn()
  const mockOn = vi.fn()
  const mockRemoveChannel = vi.fn()
  const mockChannel = { on: mockOn, subscribe: mockSubscribe }
  mockOn.mockReturnValue(mockChannel)
  mockSubscribe.mockReturnValue(mockChannel)
  return {
    mockSubscribe,
    mockOn,
    mockRemoveChannel,
    mockChannelFn: vi.fn(() => mockChannel),
  }
})

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: mockChannelFn,
    removeChannel: mockRemoveChannel,
  },
}))

import { useRealtimeSync } from '../useRealtimeSync'

const defaultCallbacks = {
  onEventInsert: vi.fn(),
  onEventUpdate: vi.fn(),
  onEventDelete: vi.fn(),
  onProfileUpdate: vi.fn(),
}

describe('useRealtimeSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const mockChannel = { on: mockOn, subscribe: mockSubscribe }
    mockOn.mockReturnValue(mockChannel)
    mockSubscribe.mockReturnValue(mockChannel)
    mockChannelFn.mockReturnValue(mockChannel)
  })

  it('subscribe au bon channel avec le profileId', () => {
    renderHook(() => useRealtimeSync('profile-123', false, defaultCallbacks))

    expect(mockChannelFn).toHaveBeenCalledWith('household:profile-123')
    expect(mockSubscribe).toHaveBeenCalled()
    expect(mockOn).toHaveBeenCalledTimes(4)
  })

  it('ne subscribe pas en mode démo', () => {
    renderHook(() => useRealtimeSync('profile-123', true, defaultCallbacks))

    expect(mockChannelFn).not.toHaveBeenCalled()
  })

  it('ne subscribe pas si profileId est null', () => {
    renderHook(() => useRealtimeSync(null, false, defaultCallbacks))

    expect(mockChannelFn).not.toHaveBeenCalled()
  })

  it('cleanup removeChannel au démontage', () => {
    const { unmount } = renderHook(() =>
      useRealtimeSync('profile-123', false, defaultCallbacks),
    )

    unmount()

    expect(mockRemoveChannel).toHaveBeenCalled()
  })

  it('écoute les postgres_changes INSERT/UPDATE/DELETE sur pousse_events', () => {
    renderHook(() => useRealtimeSync('profile-123', false, defaultCallbacks))

    const onCalls = mockOn.mock.calls
    const eventTypes = onCalls
      .filter(
        (call) =>
          call[0] === 'postgres_changes' &&
          (call[1] as Record<string, unknown>).table === 'pousse_events',
      )
      .map((call) => (call[1] as Record<string, unknown>).event)

    expect(eventTypes).toContain('INSERT')
    expect(eventTypes).toContain('UPDATE')
    expect(eventTypes).toContain('DELETE')
  })

  it('écoute les postgres_changes UPDATE sur pousse_profiles', () => {
    renderHook(() => useRealtimeSync('profile-123', false, defaultCallbacks))

    const onCalls = mockOn.mock.calls
    const profileListeners = onCalls.filter(
      (call) =>
        call[0] === 'postgres_changes' &&
        (call[1] as Record<string, unknown>).table === 'pousse_profiles',
    )

    expect(profileListeners).toHaveLength(1)
    expect((profileListeners[0][1] as Record<string, unknown>).event).toBe('UPDATE')
  })

  it('filtre par profile_id sur pousse_events', () => {
    renderHook(() => useRealtimeSync('profile-123', false, defaultCallbacks))

    const onCalls = mockOn.mock.calls
    const eventsFilter = onCalls.find(
      (call) =>
        call[0] === 'postgres_changes' &&
        (call[1] as Record<string, unknown>).table === 'pousse_events' &&
        (call[1] as Record<string, unknown>).event === 'INSERT',
    )

    expect((eventsFilter![1] as Record<string, unknown>).filter).toBe(
      'profile_id=eq.profile-123',
    )
  })

  it('filtre par id sur pousse_profiles', () => {
    renderHook(() => useRealtimeSync('profile-123', false, defaultCallbacks))

    const onCalls = mockOn.mock.calls
    const profileFilter = onCalls.find(
      (call) =>
        call[0] === 'postgres_changes' &&
        (call[1] as Record<string, unknown>).table === 'pousse_profiles',
    )

    expect((profileFilter![1] as Record<string, unknown>).filter).toBe(
      'id=eq.profile-123',
    )
  })
})
