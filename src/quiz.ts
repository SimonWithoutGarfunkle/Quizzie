export interface Question {
  text: string
  choices: string[]
  correctIndex: number
}

export const QUESTIONS: Question[] = [
  {
    text: "Quelle est la capitale de la France ?",
    choices: ["Madrid", "Paris", "Londres", "Berlin"],
    correctIndex: 1,
  },
  {
    text: "De quelle couleur est le ciel en journee ?",
    choices: ["Rouge", "Vert", "Bleu", "Jaune"],
    correctIndex: 2,
  },
  {
    text: "Quel est le plus grand ocean du monde ?",
    choices: ["Atlantique", "Indien", "Arctique", "Pacifique"],
    correctIndex: 3,
  },
  {
    text: "Quel animal fait miaou ?",
    choices: ["Chat", "Chien", "Vache", "Canard"],
    correctIndex: 0,
  },
  {
    text: "Combien de pattes a une araignee ?",
    choices: ["4", "6", "8", "10"],
    correctIndex: 2,
  },
  {
    text: "Combien de jours compte une semaine ?",
    choices: ["5", "7", "10", "12"],
    correctIndex: 1,
  },
]

export const POINTS = [5, 3, 1]

// Points d'une bonne réponse trouvée après `wrongPicks` erreurs, 0 une fois les essais épuisés
export function pointsFor(wrongPicks: number): number {
  return wrongPicks < POINTS.length - 1 ? POINTS[wrongPicks] : 0
}

export function maxScore(questionCount: number): number {
  return questionCount * POINTS[0]
}

function parseBestScore(stored: string | null, max: number): number | null {
  if (stored === null || !/^\d+$/.test(stored)) return null
  const value = Number(stored)
  return value <= max ? value : null
}

export function nextBestScore(stored: string | null, score: number, max: number): number {
  const previous = parseBestScore(stored, max)
  return previous === null ? score : Math.max(previous, score)
}

/**
 * Masks the question text, progressively revealing more letters with each attempt.
 * - attempt 0: ~25% of letters visible
 * - attempt 1: ~50% visible
 * - attempt 2: ~75% visible
 * Spaces, punctuation and numbers are always visible.
 */
export function maskQuestion(text: string, attempt: number): string {
  const letterIndices: number[] = []
  for (let i = 0; i < text.length; i++) {
    if (/[a-zA-ZÀ-ÿ]/.test(text[i])) letterIndices.push(i)
  }
  const revealed = new Set<number>()
  letterIndices.forEach((charIdx, n) => {
    const mod = n % 4
    if (mod === 0) revealed.add(charIdx)
    if (attempt >= 1 && mod === 2) revealed.add(charIdx)
    if (attempt >= 2 && mod === 1) revealed.add(charIdx)
  })
  return text
    .split('')
    .map((char, i) => (/[a-zA-ZÀ-ÿ]/.test(char) ? (revealed.has(i) ? char : '_') : char))
    .join('')
}
