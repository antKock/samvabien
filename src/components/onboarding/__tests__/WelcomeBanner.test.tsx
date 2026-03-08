import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import WelcomeBanner from '../WelcomeBanner'

describe('WelcomeBanner', () => {
  it('affiche le code d\'invitation', () => {
    render(<WelcomeBanner joinCode="OLVR-4821" onDismiss={() => {}} />)
    expect(screen.getByText('OLVR-4821')).toBeInTheDocument()
  })

  it('affiche le message de bienvenue', () => {
    render(<WelcomeBanner joinCode="OLVR-4821" onDismiss={() => {}} />)
    expect(screen.getByText('Bienvenue !')).toBeInTheDocument()
  })

  it('appelle onDismiss au clic sur ✕', () => {
    const onDismiss = vi.fn()
    render(<WelcomeBanner joinCode="OLVR-4821" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByLabelText('Fermer'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('affiche le bouton Copier le lien', () => {
    render(<WelcomeBanner joinCode="OLVR-4821" onDismiss={() => {}} />)
    expect(screen.getByText('Copier le lien')).toBeInTheDocument()
  })
})
