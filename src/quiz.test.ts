import { describe, expect, it } from 'vitest'
import confettiAnim from './animations/confetti.json'
import {
  CAPITAL_COUNTRIES,
  FLAG_COLORS,
  QUESTIONS,
  isNeutral,
  maskQuestion,
  maxScore,
  nextBestScore,
  pointsFor,
  tintAnimation,
  type Country,
} from './quiz'

type Rgba = number[]

// relève, forme par forme, la couleur d'origine et la couleur teintée des remplissages et contours
function colorPairs(original: unknown, tinted: unknown, pairs: [Rgba, Rgba][] = []): [Rgba, Rgba][] {
  if (Array.isArray(original)) {
    original.forEach((item, i) => colorPairs(item, (tinted as unknown[])[i], pairs))
  } else if (original !== null && typeof original === 'object') {
    const o = original as Record<string, unknown>
    const t = tinted as Record<string, unknown>
    if (o.ty === 'fl' || o.ty === 'st') pairs.push([(o.c as { k: Rgba }).k, (t.c as { k: Rgba }).k])
    Object.keys(o).forEach(key => colorPairs(o[key], t[key], pairs))
  }
  return pairs
}

function rgbKey(color: Rgba) {
  return color.slice(0, 3).join(',')
}

function flagRgbKeys(country: Country) {
  return Object.values(FLAG_COLORS[country]).map(hex =>
    [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).join(','),
  )
}

const COUNTRIES: Country[] = ['es', 'fr', 'gb', 'de']

describe('maskQuestion', () => {
  it('révèle une lettre sur quatre à la première tentative', () => {
    expect(maskQuestion('Paris ?', 0)).toBe('P___s ?')
  })

  it('révèle de nouvelles lettres à chaque tentative sans en masquer', () => {
    expect(maskQuestion('Paris ?', 1)).toBe('P_r_s ?')
    expect(maskQuestion('Paris ?', 2)).toBe('Par_s ?')
  })

  it('laisse toujours visibles espaces, ponctuation et chiffres', () => {
    expect(maskQuestion('2 + 2 = ?', 0)).toBe('2 + 2 = ?')
  })

  it('masque aussi les lettres accentuées', () => {
    expect(maskQuestion('Été', 0)).toBe('É__')
  })
})

describe('QUESTIONS', () => {
  it.each(QUESTIONS)('« $text » a 4 choix et une bonne réponse valide', q => {
    expect(q.choices).toHaveLength(4)
    expect(q.correctIndex).toBeGreaterThanOrEqual(0)
    expect(q.correctIndex).toBeLessThan(q.choices.length)
  })
})

describe('CAPITAL_COUNTRIES', () => {
  it.each([
    ['Madrid', 'es'],
    ['Paris', 'fr'],
    ['Londres', 'gb'],
    ['Berlin', 'de'],
  ])('associe %s au pays « %s »', (capital, country) => {
    expect(CAPITAL_COUNTRIES[capital]).toBe(country)
  })

  it('a un pays pour chaque choix de la première question', () => {
    QUESTIONS[0].choices.forEach(choice => expect(CAPITAL_COUNTRIES[choice]).toBeDefined())
  })
})

describe('maxScore', () => {
  it.each([
    [1, 5],
    [6, 30],
    [10, 50],
  ])('vaut, pour un quiz de %i question(s), %i points', (questionCount, expected) => {
    expect(maxScore(questionCount)).toBe(expected)
  })
})

describe('pointsFor', () => {
  it.each([
    [0, 5],
    [1, 3],
    [2, 1],
  ])('vaut, pour une bonne réponse après %i erreur(s), %i points', (wrongPicks, expected) => {
    expect(pointsFor(wrongPicks)).toBe(expected)
  })

  it('vaut 0 une fois les trois essais épuisés', () => {
    expect(pointsFor(3)).toBe(0)
  })
})

describe('nextBestScore', () => {
  it("prend le score de la partie quand aucun meilleur score n'est enregistré", () => {
    expect(nextBestScore(null, 15, 30)).toBe(15)
  })

  it('garde le plus haut entre le meilleur score enregistré et celui de la partie', () => {
    expect(nextBestScore('20', 25, 30)).toBe(25)
    expect(nextBestScore('20', 10, 30)).toBe(20)
    expect(nextBestScore('20', 20, 30)).toBe(20)
  })

  it('accepte les bornes 0 et score maximal', () => {
    expect(nextBestScore('0', 0, 30)).toBe(0)
    expect(nextBestScore('30', 0, 30)).toBe(30)
  })

  it.each(['abc', '-1', '2.5', '31', ''])(
    'ignore la valeur enregistrée invalide « %s » et prend le score de la partie',
    stored => {
      expect(nextBestScore(stored, 0, 30)).toBe(0)
    },
  )
})

describe('isNeutral', () => {
  it.each([
    [[1, 1, 1]],
    [[0, 0, 0]],
    [[0.882, 0.882, 0.882]],
    [[0.101, 0.182, 0.209]],
  ])('considère %j comme neutre', rgb => {
    expect(isNeutral(rgb)).toBe(true)
  })

  it.each([
    [[0.827, 0.569, 0.451]],
    [[0.81, 0.937, 0.938]],
  ])('considère %j comme vive', rgb => {
    expect(isNeutral(rgb)).toBe(false)
  })
})

describe('tintAnimation', () => {
  it.each(COUNTRIES)('remplace chaque couleur vive par une couleur du drapeau « %s »', country => {
    const flag = flagRgbKeys(country)
    const vivid = colorPairs(confettiAnim, tintAnimation(confettiAnim, country)).filter(
      ([original]) => !isNeutral(original),
    )
    expect(vivid.length).toBeGreaterThan(0)
    vivid.forEach(([, tinted]) => expect(flag).toContain(rgbKey(tinted)))
  })

  it.each(COUNTRIES)('utilise chaque couleur du drapeau « %s »', country => {
    const used = new Set(
      colorPairs(confettiAnim, tintAnimation(confettiAnim, country))
        .filter(([original]) => !isNeutral(original))
        .map(([, tinted]) => rgbKey(tinted)),
    )
    flagRgbKeys(country).forEach(color => expect(used).toContain(color))
  })

  it.each(COUNTRIES)('donne, pour « %s », la même couleur aux formes de même couleur d\'origine', country => {
    const targets = new Map<string, string>()
    colorPairs(confettiAnim, tintAnimation(confettiAnim, country)).forEach(([original, tinted]) => {
      const key = rgbKey(original)
      if (!targets.has(key)) targets.set(key, rgbKey(tinted))
      expect(rgbKey(tinted)).toBe(targets.get(key))
    })
  })

  it.each(COUNTRIES)('laisse inchangés les neutres et l\'opacité pour « %s »', country => {
    const pairs = colorPairs(confettiAnim, tintAnimation(confettiAnim, country))
    const keys = pairs.map(([original]) => rgbKey(original))
    expect(keys).toContain('1,1,1')
    expect(keys).toContain('0,0,0')
    const grays = pairs.filter(([[r, g, b]]) => r === g && g === b)
    expect(grays.length).toBeGreaterThan(2)
    pairs
      .filter(([original]) => isNeutral(original))
      .forEach(([original, tinted]) => expect(tinted).toEqual(original))
    pairs.forEach(([original, tinted]) => expect(tinted[3]).toBe(original[3]))
  })

  it("garde l'opacité d'une couleur vive semi-transparente", () => {
    const animation = { layers: [{ shapes: [{ ty: 'fl', c: { a: 0, k: [1, 0, 0, 0.5] } }] }] }
    const [[, tinted]] = colorPairs(animation, tintAnimation(animation, 'fr'))
    expect(tinted[3]).toBe(0.5)
  })

  it("ne modifie pas l'animation d'origine", () => {
    const copy = structuredClone(confettiAnim)
    tintAnimation(confettiAnim, 'es')
    expect(confettiAnim).toEqual(copy)
    expect(tintAnimation(confettiAnim, 'fr')).toEqual(tintAnimation(copy, 'fr'))
  })
})
