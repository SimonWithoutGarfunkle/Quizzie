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

export type Country = 'es' | 'fr' | 'gb' | 'de'

// Pays de la capitale choisie à la question 1 : drapeau en fond et teinte de l'animation de fin
export const CAPITAL_COUNTRIES: Record<string, Country> = {
  Madrid: 'es',
  Paris: 'fr',
  Londres: 'gb',
  Berlin: 'de',
}

export const FLAG_COLORS = {
  es: { red: '#AA151B', yellow: '#F1BF00' },
  fr: { blue: '#0055A4', white: '#FFFFFF', red: '#EF4135' },
  gb: { blue: '#012169', white: '#FFFFFF', red: '#C8102E' },
  de: { black: '#000000', red: '#DD0000', gold: '#FFCE00' },
} satisfies Record<Country, Record<string, string>>

// Dans confetti.json, tout seuil entre 0.108 (ardoise foncée, gardée) et 0.128 (cyan pâle, recoloré)
// donne le même partage
const NEUTRAL_SPREAD = 0.12

export function isNeutral(rgb: number[]): boolean {
  const [r, g, b] = rgb
  return Math.max(r, g, b) - Math.min(r, g, b) <= NEUTRAL_SPREAD
}

function hexToRgb(hex: string): number[] {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
}

// Copie de l'animation Lottie où chaque couleur vive statique (`c.k` = [r, g, b, a]) des remplissages
// et contours devient une couleur du drapeau, attribuée en boucle dans l'ordre de première apparition
export function tintAnimation(animation: unknown, country: Country): unknown {
  const palette = Object.values(FLAG_COLORS[country]).map(hexToRgb)
  const targets = new Map<string, number[]>()

  function tint([r, g, b, a]: number[]): number[] {
    if (isNeutral([r, g, b])) return [r, g, b, a]
    const key = `${r},${g},${b}`
    let target = targets.get(key)
    if (!target) {
      target = palette[targets.size % palette.length]
      targets.set(key, target)
    }
    return [...target, a]
  }

  function walk(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(walk)
    if (node === null || typeof node !== 'object') return node
    const copy: Record<string, unknown> = Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, walk(value)]),
    )
    const color = copy.c as { a?: number; k?: unknown } | undefined
    if ((copy.ty === 'fl' || copy.ty === 'st') && color?.a === 0 && Array.isArray(color.k)) {
      copy.c = { ...color, k: tint(color.k) }
    }
    return copy
  }

  return walk(animation)
}

export const POINTS = [5, 3, 1]

// Points d'une bonne réponse trouvée après `wrongPicks` erreurs, 0 une fois les essais épuisés
export function pointsFor(wrongPicks: number): number {
  return wrongPicks < POINTS.length ? POINTS[wrongPicks] : 0
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
