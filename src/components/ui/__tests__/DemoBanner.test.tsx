import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DemoBanner from '../DemoBanner'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('DemoBanner', () => {
  it('affiche le texte et le bouton Quitter', () => {
    render(<DemoBanner />)
    expect(screen.getByText('Mode démo — données non conservées')).toBeInTheDocument()
    expect(screen.getByText('Quitter')).toBeInTheDocument()
  })

  it('tap Quitter → router.push("/")', () => {
    render(<DemoBanner />)
    fireEvent.click(screen.getByText('Quitter'))
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
