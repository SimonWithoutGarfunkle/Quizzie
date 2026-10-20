import { describe, expect, it } from 'vitest'
import { QUESTIONS, maskQuestion, maxScore, nextBestScore, pointsFor } from './quiz'

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
