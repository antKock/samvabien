import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WeightReminderBanner from '../WeightReminderBanner'

const mockUpdateProfile = vi.fn()

const mockProfile = {
  id: 'profile-1',
  babyName: 'Léo',
  babyDob: '2025-12-15',
  babyWeightHg: 42,
  joinCode: 'ABCD-1234',
  sleepState: 'awake' as const,
  sleepStateSince: null,
  sleepStateMoment: null,
  weightReminder: true,
  createdAt: '2025-12-01T00:00:00Z',
}

vi.mock('@/hooks/useHousehold', () => ({
  useHousehold: () => ({
    profile: mockProfile,
    updateProfile: mockUpdateProfile,
    devices: [],
    events: [],
    isDemo: false,
    isLoading: false,
    error: null,
    transitionSleepState: vi.fn(),
    addEvent: vi.fn(),
    updateEvent: vi.fn(),
    removeEventLocally: vi.fn(),
    restoreEvent: vi.fn(),
    deleteEvent: vi.fn(),
    clearError: vi.fn(),
  }),
}))

vi.mock('@/lib/weight-reminder', () => ({
  shouldShowWeightReminder: vi.fn(() => true),
}))

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.scrollTo = vi.fn()
  sessionStorage.clear()
})

describe('WeightReminderBanner', () => {
  it('affiche le bandeau quand le rappel est dû', () => {
    render(<WeightReminderBanner />)
    expect(screen.getByText(/Il est temps de peser Léo/)).toBeInTheDocument()
  })

  it('ouvre le picker poids au tap sur le bandeau', () => {
    render(<WeightReminderBanner />)
    fireEvent.click(screen.getByText(/Il est temps de peser Léo/))
    expect(screen.getByText('Poids actuel de Léo')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByText('Plus tard')).toBeInTheDocument()
  })

  it('"Plus tard" dismiss le bandeau', () => {
    render(<WeightReminderBanner />)
    fireEvent.click(screen.getByText(/Il est temps de peser Léo/))
    fireEvent.click(screen.getByText('Plus tard'))
    expect(screen.queryByText(/Il est temps de peser/)).not.toBeInTheDocument()
  })

  it('ne s\'affiche pas si déjà dismissed ce mois (sessionStorage)', () => {
    const now = new Date()
    sessionStorage.setItem(`pousse_weight_reminder_${now.getFullYear()}-${now.getMonth()}`, '1')
    render(<WeightReminderBanner />)
    expect(screen.queryByText(/Il est temps de peser/)).not.toBeInTheDocument()
  })

  it('ne s\'affiche pas quand shouldShowWeightReminder retourne false', async () => {
    const { shouldShowWeightReminder } = await import('@/lib/weight-reminder')
    vi.mocked(shouldShowWeightReminder).mockReturnValue(false)
    render(<WeightReminderBanner />)
    expect(screen.queryByText(/Il est temps de peser/)).not.toBeInTheDocument()
  })
})
