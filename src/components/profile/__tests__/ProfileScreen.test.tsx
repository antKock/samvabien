import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileScreen from '../ProfileScreen'

const mockUpdateProfile = vi.fn()
const mockPush = vi.fn()

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

const mockDevices = [
  {
    id: 'device-1',
    profileId: 'profile-1',
    deviceName: 'iPhone 15',
    lastSeen: '2026-03-08T10:00:00Z',
    createdAt: '2025-12-01T00:00:00Z',
  },
]

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/contexts/HouseholdContext', () => ({
  useHousehold: () => ({
    profile: mockProfile,
    devices: mockDevices,
    events: [],
    isDemo: false,
    isLoading: false,
    error: null,
    updateProfile: mockUpdateProfile,
    transitionSleepState: vi.fn(),
    addEvent: vi.fn(),
    updateEvent: vi.fn(),
    removeEventLocally: vi.fn(),
    restoreEvent: vi.fn(),
    deleteEvent: vi.fn(),
    clearError: vi.fn(),
  }),
}))

// Mock scrollTo for jsdom (ScrollWheels uses it)
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn()
})

describe('ProfileScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.scrollTo = vi.fn()
  })

  it('affiche les informations bébé', () => {
    render(<ProfileScreen />)
    expect(screen.getByText('Léo')).toBeInTheDocument()
    expect(screen.getByText('4,2 kg')).toBeInTheDocument()
    expect(screen.getByText('Informations bébé')).toBeInTheDocument()
  })

  it('affiche le bouton retour', () => {
    render(<ProfileScreen />)
    expect(screen.getByLabelText('Retour')).toBeInTheDocument()
  })

  it('tap prénom → input éditable → blur → appel updateProfile', async () => {
    render(<ProfileScreen />)

    // Click on the name to edit
    fireEvent.click(screen.getByText('Léo'))

    // Input should appear
    const input = screen.getByDisplayValue('Léo')
    expect(input).toBeInTheDocument()

    // Change value and blur
    fireEvent.change(input, { target: { value: 'Mia' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ babyName: 'Mia' })
    })
  })

  it('ne sauvegarde pas si le prénom est identique', async () => {
    render(<ProfileScreen />)

    fireEvent.click(screen.getByText('Léo'))
    const input = screen.getByDisplayValue('Léo')
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockUpdateProfile).not.toHaveBeenCalled()
    })
  })

  it('tap poids → scroll wheels visibles', () => {
    render(<ProfileScreen />)

    fireEvent.click(screen.getByText('4,2 kg'))

    // Weight wheels should have OK and Annuler buttons
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('tap date → scroll wheels visibles', () => {
    render(<ProfileScreen />)

    // Find the date text button
    fireEvent.click(screen.getByText(/15 décembre 2025/i))

    // Date wheels should have OK and Annuler buttons
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('affiche le toggle rappel de pesée', () => {
    render(<ProfileScreen />)
    expect(screen.getByText('Rappel de pesée')).toBeInTheDocument()
    const toggle = screen.getByRole('switch')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('tap toggle → appel updateProfile weightReminder', () => {
    render(<ProfileScreen />)
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    expect(mockUpdateProfile).toHaveBeenCalledWith({ weightReminder: false })
  })
})
