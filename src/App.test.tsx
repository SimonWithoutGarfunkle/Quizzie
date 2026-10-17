import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { QUESTIONS, maxScore, type Question } from './quiz'

// jsdom ne sait pas rendre les animations Lottie
vi.mock('./Lottie', () => ({ default: () => null }))
vi.mock('@lottiefiles/dotlottie-react', () => ({ DotLottieReact: () => null }))

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const QUESTION_COUNT = QUESTIONS.length
const MAX_SCORE = maxScore(QUESTION_COUNT)
const [FIRST] = QUESTIONS

function choiceLabel(q: Question, i: number) {
  return `${String.fromCharCode(65 + i)}. ${q.choices[i]}`
}

function wrongLabels(q: Question) {
  return q.choices.flatMap((_, i) => (i === q.correctIndex ? [] : [choiceLabel(q, i)]))
}

function pick(label: string) {
  fireEvent.click(screen.getByRole('button', { name: label }))
}

function pickCorrect(q: Question) {
  pick(choiceLabel(q, q.correctIndex))
}

function goToNextQuestion() {
  fireEvent.click(screen.getByRole('button', { name: 'Question suivante >' }))
  act(() => {
    vi.runOnlyPendingTimers()
  })
}

function scoreRows() {
  // la première ligne est l'en-tête du tableau
  return screen.getAllByRole('row').slice(1)
}

describe('App', () => {
  it('donne 5 points pour une bonne réponse du premier coup', () => {
    render(<App />)
    pickCorrect(FIRST)
    expect(screen.getByText('Bonne reponse ! +5 points')).toBeDefined()
    expect(screen.getByText('Score : 5 pts')).toBeDefined()
  })

  it('donne 3 points pour une bonne réponse à la deuxième tentative', () => {
    render(<App />)
    pick(wrongLabels(FIRST)[0])
    expect(screen.getByText('Tentative 2 / 3')).toBeDefined()
    pickCorrect(FIRST)
    expect(screen.getByText('Bonne reponse ! +3 points')).toBeDefined()
  })

  it('affiche la bonne réponse sans points après trois erreurs', () => {
    render(<App />)
    wrongLabels(FIRST).forEach(pick)
    expect(
      screen.getByText(`Plus de tentatives ! Reponse : ${FIRST.choices[FIRST.correctIndex]}`),
    ).toBeDefined()
    expect(screen.getByText('Score : 0 pts')).toBeDefined()
  })

  it('indique « Question k / N » et « Qk/N » à chaque question', () => {
    render(<App />)
    QUESTIONS.forEach((q, k) => {
      expect(screen.getByText(`Question ${k + 1} / ${QUESTION_COUNT}`)).toBeDefined()
      expect(screen.getByText(`Q${k + 1}/${QUESTION_COUNT}`)).toBeDefined()
      pickCorrect(q)
      goToNextQuestion()
    })
  })

  it('donne le score maximal à qui répond juste du premier coup à toutes les questions', () => {
    render(<App />)
    QUESTIONS.forEach(q => {
      pickCorrect(q)
      goToNextQuestion()
    })
    expect(screen.getByText(`${MAX_SCORE} / ${MAX_SCORE} points`)).toBeDefined()
    expect(screen.getByText(`Score : ${MAX_SCORE}/${MAX_SCORE}`)).toBeDefined()
    const rows = scoreRows()
    expect(rows).toHaveLength(QUESTION_COUNT)
    rows.forEach(row => expect(within(row).getByText('5 pts')).toBeDefined())
  })

  it("compte 0 point pour une question ratée et continue jusqu'à la dernière question", () => {
    render(<App />)
    wrongLabels(FIRST).forEach(pick)
    goToNextQuestion()
    QUESTIONS.slice(1).forEach(q => {
      pickCorrect(q)
      goToNextQuestion()
    })
    const total = MAX_SCORE - 5
    expect(screen.getByText(`${total} / ${MAX_SCORE} points`)).toBeDefined()
    expect(screen.getByText(`Score : ${total}/${MAX_SCORE}`)).toBeDefined()
    const rows = scoreRows()
    expect(rows).toHaveLength(QUESTION_COUNT)
    expect(within(rows[0]).getByText('0 pts')).toBeDefined()
  })
})
