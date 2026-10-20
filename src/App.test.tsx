import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { QUESTIONS, maxScore, type Question } from './quiz'

// jsdom ne sait pas rendre les animations Lottie
vi.mock('./Lottie', () => ({ default: () => null }))
vi.mock('@lottiefiles/dotlottie-react', () => ({ DotLottieReact: () => null }))

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})

const QUESTION_COUNT = QUESTIONS.length
const MAX_SCORE = maxScore(QUESTION_COUNT)
const [FIRST] = QUESTIONS
const BEST_SCORE_KEY = 'quizzie.bestScore'

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

// rate entièrement les `missed` premières questions et répond juste du premier coup aux autres
function playGame(missed: number) {
  QUESTIONS.forEach((q, k) => {
    if (k < missed) wrongLabels(q).forEach(pick)
    else pickCorrect(q)
    goToNextQuestion()
  })
  return MAX_SCORE - 5 * missed
}

function bestScoreLine(score: number) {
  return `Meilleur score : ${score} / ${MAX_SCORE} points`
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

  it('donne 1 point pour une bonne réponse à la troisième tentative', () => {
    render(<App />)
    wrongLabels(FIRST).slice(0, 2).forEach(pick)
    expect(screen.getByText('Tentative 3 / 3')).toBeDefined()
    pickCorrect(FIRST)
    expect(screen.getByText('Bonne reponse ! +1 points')).toBeDefined()
    expect(screen.getByText('Score : 1 pts')).toBeDefined()
    goToNextQuestion()
    QUESTIONS.slice(1).forEach(q => {
      pickCorrect(q)
      goToNextQuestion()
    })
    expect(within(scoreRows()[0]).getByText('1 pts')).toBeDefined()
  })

  it.each([
    [0, 5],
    [1, 3],
    [2, 1],
  ])('après %i erreur(s), ajoute au score les %i points annoncés par le message', (errors, pts) => {
    render(<App />)
    wrongLabels(FIRST).slice(0, errors).forEach(pick)
    pickCorrect(FIRST)
    expect(screen.getByText(`Bonne reponse ! +${pts} points`)).toBeDefined()
    expect(screen.getByText(`Score : ${pts} pts`)).toBeDefined()
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

describe('Meilleur score', () => {
  it("enregistre et affiche le score de la partie quand aucun meilleur score n'existe", () => {
    render(<App />)
    const score = playGame(1)
    expect(screen.getByText(bestScoreLine(score))).toBeDefined()
    expect(localStorage.getItem(BEST_SCORE_KEY)).toBe(String(score))
  })

  it('remplace le meilleur score quand la partie le dépasse', () => {
    localStorage.setItem(BEST_SCORE_KEY, String(MAX_SCORE - 10))
    render(<App />)
    const score = playGame(1)
    expect(screen.getByText(bestScoreLine(score))).toBeDefined()
    expect(localStorage.getItem(BEST_SCORE_KEY)).toBe(String(score))
  })

  it('garde le meilleur score quand la partie fait moins', () => {
    const best = MAX_SCORE - 5
    localStorage.setItem(BEST_SCORE_KEY, String(best))
    render(<App />)
    playGame(2)
    expect(screen.getByText(bestScoreLine(best))).toBeDefined()
    expect(localStorage.getItem(BEST_SCORE_KEY)).toBe(String(best))
  })

  it('garde le meilleur score quand la partie fait exactement autant', () => {
    const best = MAX_SCORE - 5
    localStorage.setItem(BEST_SCORE_KEY, String(best))
    render(<App />)
    playGame(1)
    expect(screen.getByText(bestScoreLine(best))).toBeDefined()
    expect(localStorage.getItem(BEST_SCORE_KEY)).toBe(String(best))
  })

  it("conserve le meilleur score d'une partie précédente après rechargement de la page", () => {
    render(<App />)
    const best = playGame(1)
    cleanup()
    render(<App />)
    playGame(2)
    expect(screen.getByText(bestScoreLine(best))).toBeDefined()
  })

  it.each(['abc', '-1', '2.5', String(MAX_SCORE + 1)])(
    'ignore la valeur enregistrée invalide « %s » et la remplace par le score de la partie',
    stored => {
      localStorage.setItem(BEST_SCORE_KEY, stored)
      render(<App />)
      const score = playGame(QUESTION_COUNT)
      expect(screen.getByText(bestScoreLine(score))).toBeDefined()
      expect(localStorage.getItem(BEST_SCORE_KEY)).toBe(String(score))
    },
  )

  it("affiche les résultats normalement quand localStorage lève une erreur", () => {
    const denied = () => {
      throw new DOMException('Access denied', 'SecurityError')
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied)
    render(<App />)
    const score = playGame(1)
    expect(screen.getByText('Partie terminee !')).toBeDefined()
    expect(screen.getByText(`${score} / ${MAX_SCORE} points`)).toBeDefined()
    expect(screen.getByText(bestScoreLine(score))).toBeDefined()
  })

  it("n'enregistre rien tant que l'écran de résultats n'est pas atteint", () => {
    render(<App />)
    QUESTIONS.forEach((q, k) => {
      pickCorrect(q)
      expect(localStorage.getItem(BEST_SCORE_KEY)).toBeNull()
      if (k < QUESTION_COUNT - 1) goToNextQuestion()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Question suivante >' }))
    expect(localStorage.getItem(BEST_SCORE_KEY)).toBeNull()
    act(() => {
      vi.runOnlyPendingTimers()
    })
    expect(localStorage.getItem(BEST_SCORE_KEY)).toBe(String(MAX_SCORE))
  })
})
