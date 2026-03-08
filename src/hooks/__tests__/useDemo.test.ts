import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useDemo } from '../useDemo'

describe('useDemo', () => {
  it('initializes with demo profile and events', () => {
    const { result } = renderHook(() => useDemo())
    expect(result.current.profile.babyName).toBe('Léo')
    expect(result.current.events.length).toBeGreaterThan(0)
    expect(result.current.isDemo).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.devices).toEqual([])
  })

  it('addEvent adds an event to local state without fetch', async () => {
    const { result } = renderHook(() => useDemo())
    const initialCount = result.current.events.length

    await act(async () => {
      await result.current.addEvent({ type: 'bottle', value: 200 })
    })

    expect(result.current.events.length).toBe(initialCount + 1)
    expect(result.current.events[0].id).toMatch(/^demo-new-/)
    expect(result.current.events[0].value).toBe(200)
  })

  it('updateEvent modifies an event in local state', async () => {
    const { result } = renderHook(() => useDemo())
    const eventId = result.current.events[0].id

    await act(async () => {
      await result.current.updateEvent(eventId, { value: 999 })
    })

    const updated = result.current.events.find((e) => e.id === eventId)
    expect(updated?.value).toBe(999)
  })

  it('deleteEvent removes from local state', async () => {
    const { result } = renderHook(() => useDemo())
    const initialCount = result.current.events.length
    const eventId = result.current.events[0].id

    await act(async () => {
      await result.current.deleteEvent(eventId)
    })

    expect(result.current.events.length).toBe(initialCount - 1)
    expect(result.current.events.find((e) => e.id === eventId)).toBeUndefined()
  })

  it('transitionSleepState updates profile locally', async () => {
    const { result } = renderHook(() => useDemo())
    const time = new Date().toISOString()

    await act(async () => {
      await result.current.transitionSleepState('nap', time)
    })

    expect(result.current.profile.sleepState).toBe('nap')
    expect(result.current.profile.sleepStateSince).toBe(time)
  })

  it('updateProfile modifies profile locally', async () => {
    const { result } = renderHook(() => useDemo())

    await act(async () => {
      await result.current.updateProfile({ babyName: 'Mia' })
    })

    expect(result.current.profile.babyName).toBe('Mia')
  })

  it('removeEventLocally removes an event', () => {
    const { result } = renderHook(() => useDemo())
    const eventId = result.current.events[0].id
    const initialCount = result.current.events.length

    act(() => {
      result.current.removeEventLocally(eventId)
    })

    expect(result.current.events.length).toBe(initialCount - 1)
  })
})
