import { describe, expect, it } from 'vitest'
import { QUESTIONS, maskQuestion } from './quiz'

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
