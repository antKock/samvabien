import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LandingScreen from '../LandingScreen'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('LandingScreen', () => {
  it('affiche le nom "pousse"', () => {
    render(<LandingScreen />)
    expect(screen.getByText('pousse')).toBeInTheDocument()
  })

  it('affiche la tagline', () => {
    render(<LandingScreen />)
    expect(screen.getByText('Suivi bébé simple et serein')).toBeInTheDocument()
  })

  it('affiche les 3 boutons', () => {
    render(<LandingScreen />)
    expect(screen.getByText('Essayer la démo')).toBeInTheDocument()
    expect(screen.getByText('Créer un profil')).toBeInTheDocument()
    expect(screen.getByText('Rejoindre un foyer')).toBeInTheDocument()
  })

  it('les liens pointent vers les bonnes routes', () => {
    render(<LandingScreen />)
    expect(screen.getByText('Créer un profil').closest('a')).toHaveAttribute('href', '/onboarding')
    expect(screen.getByText('Rejoindre un foyer').closest('a')).toHaveAttribute('href', '/join')
  })
})
