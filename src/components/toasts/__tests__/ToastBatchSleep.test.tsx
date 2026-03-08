import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ToastBatchSleep from '../ToastBatchSleep'

const mockAddEvent = vi.fn().mockResolvedValue(undefined)
const mockProfile = {
  id: 'p1',
  babyName: 'Bébé',
  babyDob: '2025-06-01',
  babyWeightHg: 50,
  joinCode: 'TEST-1234',
  sleepState: 'awake' as const,
  sleepStateSince: null,
  sleepStateMoment: null,
  weightReminder: false,
  createdAt: '2025-06-01T00:00:00Z',
}

const mockEvents = [
  { id: '1', profileId: 'p1', type: 'nap' as const, value: 60, startedAt: '2026-03-08T09:00:00Z', endedAt: '2026-03-08T10:00:00Z', moment: null, createdAt: '2026-03-08T09:00:00Z' },
  { id: '2', profileId: 'p1', type: 'nap' as const, value: 90, startedAt: '2026-03-08T13:00:00Z', endedAt: '2026-03-08T14:30:00Z', moment: null, createdAt: '2026-03-08T13:00:00Z' },
]

vi.mock('@/hooks/useHousehold', () => ({
  useHousehold: () => ({
    profile: mockProfile,
    events: mockEvents,
    addEvent: mockAddEvent,
  }),
}))

describe('ToastBatchSleep', () => {
  beforeEach(() => {
    mockAddEvent.mockClear()
  })

  it('affiche le slider durée, moment selector et boutons', () => {
    render(<ToastBatchSleep onClose={() => {}} />)
    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Suivant')).toBeInTheDocument()
    expect(screen.getByText('Terminer')).toBeInTheDocument()
    expect(screen.getByText('Matin')).toBeInTheDocument()
    expect(screen.getByText('Midi')).toBeInTheDocument()
    expect(screen.getByText('Après-midi')).toBeInTheDocument()
  })

  it('affiche la durée formatée dans le slider (Xh00 / Xmin)', () => {
    const { container } = render(<ToastBatchSleep onClose={() => {}} />)
    // Default value for these events: avg of 60 and 90 = 75 → rounded to 75 (step 5)
    // formatDuration(75 * 60000) = "1h15"
    const tooltip = container.querySelector('.font-extrabold')
    expect(tooltip?.textContent).toBe('1h15')
  })

  it('"Suivant" enregistre avec type=nap, moment, sans startedAt', async () => {
    render(<ToastBatchSleep onClose={() => {}} />)

    fireEvent.click(screen.getByText('Matin'))
    fireEvent.click(screen.getByText('Suivant'))

    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledWith({
        type: 'nap',
        value: expect.any(Number),
        moment: 'morning',
      })
    })

    const call = mockAddEvent.mock.calls[0][0]
    expect(call.startedAt).toBeUndefined()
  })

  it('"Suivant" reset le moment selector après enregistrement', async () => {
    render(<ToastBatchSleep onClose={() => {}} />)

    fireEvent.click(screen.getByText('Midi'))
    fireEvent.click(screen.getByText('Suivant'))

    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledOnce()
    })

    mockAddEvent.mockClear()
    fireEvent.click(screen.getByText('Suivant'))

    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledWith({
        type: 'nap',
        value: expect.any(Number),
        moment: undefined,
      })
    })
  })

  it('"Terminer" enregistre et ferme le toast', async () => {
    const onClose = vi.fn()
    render(<ToastBatchSleep onClose={onClose} />)

    fireEvent.click(screen.getByText('Terminer'))

    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledOnce()
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it('backdrop tap ferme sans enregistrer', () => {
    const onClose = vi.fn()
    const { container } = render(<ToastBatchSleep onClose={onClose} />)

    const backdrop = container.querySelector('.bg-black\\/30')
    expect(backdrop).toBeTruthy()
    fireEvent.click(backdrop!)

    expect(onClose).toHaveBeenCalledOnce()
    expect(mockAddEvent).not.toHaveBeenCalled()
  })
})
