import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ToastBatchMilk from '../ToastBatchMilk'

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
  { id: '1', profileId: 'p1', type: 'bottle' as const, value: 150, startedAt: '2026-03-08T08:00:00Z', endedAt: null, moment: null, createdAt: '2026-03-08T08:00:00Z' },
  { id: '2', profileId: 'p1', type: 'bottle' as const, value: 180, startedAt: '2026-03-08T10:00:00Z', endedAt: null, moment: null, createdAt: '2026-03-08T10:00:00Z' },
]

vi.mock('@/hooks/useHousehold', () => ({
  useHousehold: () => ({
    profile: mockProfile,
    events: mockEvents,
    addEvent: mockAddEvent,
  }),
}))

describe('ToastBatchMilk', () => {
  beforeEach(() => {
    mockAddEvent.mockClear()
  })

  it('affiche le slider, le moment selector et les boutons', () => {
    render(<ToastBatchMilk onClose={() => {}} />)
    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Suivant')).toBeInTheDocument()
    expect(screen.getByText('Terminer')).toBeInTheDocument()
    expect(screen.getByText('Matin')).toBeInTheDocument()
    expect(screen.getByText('Midi')).toBeInTheDocument()
    expect(screen.getByText('Après-midi')).toBeInTheDocument()
  })

  it('la valeur par défaut est la moyenne des 10 derniers biberons', () => {
    // mockEvents: 150 + 180 = 330 / 2 = 165 → arrondi à 170 (step 10)
    const { container } = render(<ToastBatchMilk onClose={() => {}} />)
    const tooltip = container.querySelector('.font-extrabold')
    expect(tooltip?.textContent).toBe('170 mL')
  })

  it('n\'utilise PAS de CooldownButton', () => {
    const { container } = render(<ToastBatchMilk onClose={() => {}} />)
    // CooldownButton renders a circular SVG with countdown — should not be present
    expect(container.querySelector('[data-cooldown]')).toBeNull()
    // No auto-confirm timer text
    expect(screen.queryByText(/sec/i)).toBeNull()
  })

  it('"Suivant" enregistre un événement avec moment et sans startedAt', async () => {
    render(<ToastBatchMilk onClose={() => {}} />)

    // Select moment "Midi"
    fireEvent.click(screen.getByText('Midi'))

    // Click "Suivant"
    fireEvent.click(screen.getByText('Suivant'))

    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledWith({
        type: 'bottle',
        value: expect.any(Number),
        moment: 'noon',
      })
    })

    // Should NOT have startedAt
    const call = mockAddEvent.mock.calls[0][0]
    expect(call.startedAt).toBeUndefined()
  })

  it('"Suivant" reset le moment selector après enregistrement', async () => {
    render(<ToastBatchMilk onClose={() => {}} />)

    // Select moment "Matin"
    fireEvent.click(screen.getByText('Matin'))

    // Click "Suivant"
    fireEvent.click(screen.getByText('Suivant'))

    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledOnce()
    })

    // After "Suivant", the next call should have moment=undefined (reset)
    mockAddEvent.mockClear()
    fireEvent.click(screen.getByText('Suivant'))

    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledWith({
        type: 'bottle',
        value: expect.any(Number),
        moment: undefined,
      })
    })
  })

  it('"Terminer" enregistre et ferme le toast', async () => {
    const onClose = vi.fn()
    render(<ToastBatchMilk onClose={onClose} />)

    fireEvent.click(screen.getByText('Terminer'))

    await waitFor(() => {
      expect(mockAddEvent).toHaveBeenCalledOnce()
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it('backdrop tap ferme sans enregistrer', () => {
    const onClose = vi.fn()
    const { container } = render(<ToastBatchMilk onClose={onClose} />)

    // Click backdrop (the overlay div)
    const backdrop = container.querySelector('.bg-black\\/30')
    expect(backdrop).toBeTruthy()
    fireEvent.click(backdrop!)

    expect(onClose).toHaveBeenCalledOnce()
    expect(mockAddEvent).not.toHaveBeenCalled()
  })

  it('✕ ferme sans enregistrer', () => {
    const onClose = vi.fn()
    render(<ToastBatchMilk onClose={onClose} />)

    fireEvent.click(screen.getByLabelText('Fermer'))

    expect(onClose).toHaveBeenCalledOnce()
    expect(mockAddEvent).not.toHaveBeenCalled()
  })
})
