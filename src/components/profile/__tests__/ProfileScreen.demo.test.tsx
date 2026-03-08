import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileScreen from '../ProfileScreen'

const mockPush = vi.fn()

const mockProfile = {
  id: 'demo-profile',
  babyName: 'Léo',
  babyDob: '2025-11-08',
  babyWeightHg: 62,
  joinCode: 'DEMO-0000',
  sleepState: 'awake' as const,
  sleepStateSince: null,
  sleepStateMoment: null,
  weightReminder: true,
  createdAt: '2025-11-08T00:00:00Z',
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/contexts/HouseholdContext', () => ({
  useHousehold: () => ({
    profile: mockProfile,
    devices: [],
    events: [],
    isDemo: true,
    isLoading: false,
    error: null,
    updateProfile: vi.fn(),
    transitionSleepState: vi.fn(),
    addEvent: vi.fn(),
    updateEvent: vi.fn(),
    removeEventLocally: vi.fn(),
    restoreEvent: vi.fn(),
    deleteEvent: vi.fn(),
    clearError: vi.fn(),
  }),
}))

describe('ProfileScreen en mode démo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.scrollTo = vi.fn()
  })

  it('masque la section Foyer en mode démo', () => {
    render(<ProfileScreen />)
    expect(screen.queryByText('Foyer')).not.toBeInTheDocument()
    expect(screen.queryByText('Copier le lien')).not.toBeInTheDocument()
    expect(screen.queryByText('Appareils connectés')).not.toBeInTheDocument()
  })

  it('masque le bouton Quitter le profil en mode démo', () => {
    render(<ProfileScreen />)
    expect(screen.queryByText('Quitter le profil')).not.toBeInTheDocument()
  })

  it('affiche toujours les informations bébé', () => {
    render(<ProfileScreen />)
    expect(screen.getByText('Informations bébé')).toBeInTheDocument()
    expect(screen.getByText('Léo')).toBeInTheDocument()
  })
})
