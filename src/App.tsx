import { useState, useEffect } from 'react'
import './App.css'

interface Question {
  text: string
  choices: string[]
  correctIndex: number
}

const QUESTIONS: Question[] = [
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

const POINTS = [5, 3, 1]

/**
 * Masks the question text, progressively revealing more letters with each attempt.
 * - attempt 0: ~25% of letters visible (every 4th letter, starting at index 0)
 * - attempt 1: ~50% visible (also every 4th starting at index 2)
 * - attempt 2: ~75% visible (also every 4th starting at index 1)
 * Spaces, punctuation and numbers are always visible.
 */
function maskQuestion(text: string, attempt: number): string {
  const letterIndices: number[] = []
  for (let i = 0; i < text.length; i++) {
    if (/[a-zA-ZÀ-ÿ]/.test(text[i])) {
      letterIndices.push(i)
    }
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

function useTime() {
  const fmt = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 10_000)
    return () => clearInterval(id)
  }, [])
  return time
}

type Phase = 'playing' | 'feedback' | 'finished'

export default function App() {
  const [qIndex, setQIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [phase, setPhase] = useState<Phase>('playing')
  const [picked, setPicked] = useState<number | null>(null)
  const [scores, setScores] = useState<number[]>([])
  const time = useTime()

  function handlePick(i: number) {
    if (phase !== 'playing') return
    setPicked(i)
    const q = QUESTIONS[qIndex]
    const isCorrect = i === q.correctIndex
    if (isCorrect) {
      const pts = POINTS[attempt] ?? 0
      setTotalScore(s => s + pts)
      setScores(s => [...s, pts])
    } else if (attempt >= 2) {
      setScores(s => [...s, 0])
    }
    setPhase('feedback')
  }

  function handleContinue() {
    const q = QUESTIONS[qIndex]
    const isCorrect = picked === q.correctIndex
    const isLastAttempt = attempt >= 2

    if (isCorrect || isLastAttempt) {
      if (qIndex + 1 >= QUESTIONS.length) {
        setPhase('finished')
      } else {
        setQIndex(qi => qi + 1)
        setAttempt(0)
        setPicked(null)
        setPhase('playing')
      }
    } else {
      setAttempt(a => a + 1)
      setPicked(null)
      setPhase('playing')
    }
  }

  function restart() {
    setQIndex(0)
    setAttempt(0)
    setTotalScore(0)
    setPhase('playing')
    setPicked(null)
    setScores([])
  }

  if (phase === 'finished') {
    return (
      <div className="desktop">
        <div className="window">
          <TitleBar title="QUIZZIE.EXE — Resultats" />
          <div className="window-body">
            <p className="result-title">Partie terminee !</p>
            <div className="inset-box score-summary">
              <div className="score-total">{totalScore} / 15 points</div>
              <table className="score-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr key={i}>
                      <td>Question {i + 1}</td>
                      <td className={s > 0 ? 'pts-ok' : 'pts-zero'}>{s} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="continue-row">
              <button className="btn" onClick={restart}>
                Rejouer
              </button>
            </div>
          </div>
          <StatusBar left="Partie terminee" right={`Score : ${totalScore}/15`} />
        </div>
        <Taskbar time={time} />
      </div>
    )
  }

  const q = QUESTIONS[qIndex]
  const masked = maskQuestion(q.text, attempt)
  const isCorrect = picked !== null && picked === q.correctIndex
  const isLastAttempt = attempt >= 2

  return (
    <div className="desktop">
      <div className="window">
        <TitleBar title="QUIZZIE.EXE" />
        <MenuBar />
        <div className="window-body">
          <div className="quiz-header">
            <span>Question {qIndex + 1} / {QUESTIONS.length}</span>
            <span>Score : {totalScore} pts</span>
          </div>

          <div className="inset-box question-box">
            <div className="attempt-label">Tentative {attempt + 1} / 3</div>
            <p className="question-text">{masked}</p>
          </div>

          {phase === 'feedback' && (
            <div className={`feedback-box ${isCorrect ? 'success' : 'error'}`}>
              {isCorrect
                ? `Bonne reponse ! +${POINTS[attempt] ?? 0} points`
                : isLastAttempt
                  ? `Plus de tentatives ! La reponse etait : ${q.choices[q.correctIndex]}`
                  : 'Mauvaise reponse ! De nouvelles lettres sont revelees.'}
            </div>
          )}

          <div className="choices">
            {q.choices.map((choice, i) => {
              let cls = 'btn choice-btn'
              if (phase === 'feedback') {
                if (i === q.correctIndex && (isCorrect || isLastAttempt)) cls += ' btn-correct'
                else if (i === picked && !isCorrect) cls += ' btn-wrong'
              }
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => handlePick(i)}
                  disabled={phase !== 'playing'}
                >
                  {String.fromCharCode(65 + i)}. {choice}
                </button>
              )
            })}
          </div>

          {phase === 'feedback' && (
            <div className="continue-row">
              <button className="btn" onClick={handleContinue}>
                {isCorrect || isLastAttempt ? 'Question suivante >' : 'Continuer >'}
              </button>
            </div>
          )}
        </div>
        <StatusBar left="Pret" right={`Q${qIndex + 1}/3`} />
      </div>
      <Taskbar time={time} />
    </div>
  )
}

function TitleBar({ title }: { title: string }) {
  return (
    <div className="titlebar">
      <div className="titlebar-icon">■</div>
      <span className="titlebar-text">{title}</span>
      <div className="titlebar-btns">
        <button className="titlebar-btn">_</button>
        <button className="titlebar-btn">□</button>
        <button className="titlebar-btn">x</button>
      </div>
    </div>
  )
}

function MenuBar() {
  return (
    <div className="menubar">
      <span className="menu-item">Fichier</span>
      <span className="menu-item">Affichage</span>
      <span className="menu-item">Aide</span>
    </div>
  )
}

function StatusBar({ left, right }: { left: string; right: string }) {
  return (
    <div className="statusbar">
      <span className="status-pane">{left}</span>
      <span className="status-pane">{right}</span>
    </div>
  )
}

function Taskbar({ time }: { time: string }) {
  return (
    <div className="taskbar">
      <button className="start-btn">⊞ Demarrer</button>
      <div className="taskbar-divider" />
      <div className="taskbar-task">QUIZZIE.EXE</div>
      <div className="taskbar-clock">{time}</div>
    </div>
  )
}
