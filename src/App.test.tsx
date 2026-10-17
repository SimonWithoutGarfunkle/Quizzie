import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from './App'

// jsdom ne sait pas rendre les animations Lottie
vi.mock('./Lottie', () => ({ default: () => null }))
vi.mock('@lottiefiles/dotlottie-react', () => ({ DotLottieReact: () => null }))

afterEach(cleanup)

function pick(choice: string) {
  fireEvent.click(screen.getByRole('button', { name: choice }))
}

describe('App', () => {
  it('donne 5 points pour une bonne réponse du premier coup', () => {
    render(<App />)
    pick('B. Paris')
    expect(screen.getByText('Bonne reponse ! +5 points')).toBeDefined()
    expect(screen.getByText('Score : 5 pts')).toBeDefined()
  })

  it('donne 3 points pour une bonne réponse à la deuxième tentative', () => {
    render(<App />)
    pick('A. Madrid')
    expect(screen.getByText('Tentative 2 / 3')).toBeDefined()
    pick('B. Paris')
    expect(screen.getByText('Bonne reponse ! +3 points')).toBeDefined()
  })

  it('affiche la bonne réponse sans points après trois erreurs', () => {
    render(<App />)
    pick('A. Madrid')
    pick('C. Londres')
    pick('D. Berlin')
    expect(screen.getByText('Plus de tentatives ! Reponse : Paris')).toBeDefined()
    expect(screen.getByText('Score : 0 pts')).toBeDefined()
  })
})
