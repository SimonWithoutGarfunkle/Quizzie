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
]

export const POINTS = [5, 3, 1]

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
