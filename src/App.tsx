import { useState, useEffect } from 'react'
import Lottie from './Lottie'
import DayNightToggle from './DayNightToggle'
import loadingAnim from './animations/loading2.json'
import victoryAnim from './animations/victory2.json'
import errorAnim from './animations/error.json'
import confettiAnim from './animations/confetti.json'
import nightmodeAnim from './animations/nightmode.json'
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

const TRANSITION_DURATION = 4

/**
 * Masks the question text, progressively revealing more letters with each attempt.
 * - attempt 0: ~25% of letters visible
 * - attempt 1: ~50% visible
 * - attempt 2: ~75% visible
 * Spaces, punctuation and numbers are always visible.
 */
function maskQuestion(text: string, attempt: number): string {
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

// 'playing'         — en cours, le joueur peut cliquer
// 'correct'         — bonne réponse, affiche succès + bouton suivant
// 'out_of_attempts' — 3 mauvaises, affiche erreur + bouton suivant
// 'transitioning'   — animation de chargement entre questions
// 'finished'        — écran de score final
type Phase = 'playing' | 'correct' | 'out_of_attempts' | 'transitioning' | 'finished'

export default function App() {
  const [qIndex, setQIndex] = useState(0)
  const [wrongPicks, setWrongPicks] = useState<number[]>([])  // indices des mauvaises réponses choisies
  const [totalScore, setTotalScore] = useState(0)
  const [phase, setPhase] = useState<Phase>('playing')
  const [scores, setScores] = useState<number[]>([])
  const [isNight, setIsNight] = useState(false)
  const time = useTime()
  const desktopClassName = `desktop${isNight ? ' desktop--night' : ''}`
  const nightBackground = isNight && (
    <Lottie
      animationData={nightmodeAnim}
      loop
      className="desktop-bg-anim"
      rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
    />
  )

  const attempt = wrongPicks.length  // alias lisible

  function handlePick(i: number) {
    if (phase !== 'playing') return
    if (wrongPicks.includes(i)) return  // déjà essayé

    const q = QUESTIONS[qIndex]

    if (i === q.correctIndex) {
      const pts = POINTS[attempt] ?? 0
      setTotalScore(s => s + pts)
      setScores(s => [...s, pts])
      setPhase('correct')
    } else {
      const next = [...wrongPicks, i]
      setWrongPicks(next)
      if (next.length >= 3) {
        setScores(s => [...s, 0])
        setPhase('out_of_attempts')
      }
      // sinon : on reste en 'playing', le masque se met à jour automatiquement
    }
  }

  function handleNext() {
    setPhase('transitioning')
    setTimeout(() => {
      if (qIndex + 1 >= QUESTIONS.length) {
        setPhase('finished')
      } else {
        setQIndex(qi => qi + 1)
        setWrongPicks([])
        setPhase('playing')
      }
    }, TRANSITION_DURATION * 1000)
  }

  function restart() {
    setPhase('transitioning')
    setTimeout(() => {
      setQIndex(0)
      setWrongPicks([])
      setTotalScore(0)
      setScores([])
      setPhase('playing')
    }, TRANSITION_DURATION * 1000)
  }

  // ── TRANSITIONING ────────────────────────────────────────────────────────────
  if (phase === 'transitioning') {
    return (
      <div className={desktopClassName}>
        {nightBackground}
        <DayNightToggle onToggle={setIsNight} />
        <div className="window window--small">
          <TitleBar title="Chargement..." />
          <div className="window-body window-body--center">
            <Lottie animationData={loadingAnim} loop style={{ width: 240, height: 240 }} />
            <p className="loading-label">Veuillez patienter...</p>
          </div>
        </div>
        <Taskbar time={time} />
      </div>
    )
  }

  // ── FINISHED ─────────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    return (
      <div className={desktopClassName}>
        {nightBackground}
        <DayNightToggle onToggle={setIsNight} />
        <div className="window">
          <TitleBar title="QUIZZIE.EXE — Resultats" />
          <div className="window-body">
            <div className="confetti-wrapper">
              <Lottie animationData={confettiAnim} loop style={{ width: '100%', height: 140 }} />
            </div>
            <p className="result-title">Partie terminee !</p>
            <div className="inset-box score-summary">
              <div className="score-total">{totalScore} / 15 points</div>
              <table className="score-table">
                <thead>
                  <tr><th>Question</th><th>Points</th></tr>
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
              <button className="btn" onClick={restart}>Rejouer</button>
            </div>
          </div>
          <StatusBar left="Partie terminee" right={`Score : ${totalScore}/15`} />
        </div>
        <Taskbar time={time} />
      </div>
    )
  }

  // ── PLAYING / CORRECT / OUT_OF_ATTEMPTS ──────────────────────────────────────
  const q = QUESTIONS[qIndex]
  const masked = maskQuestion(q.text, attempt)
  const showFeedback = phase === 'correct' || phase === 'out_of_attempts'

  return (
    <div className={desktopClassName}>
      {nightBackground}
      <DayNightToggle onToggle={setIsNight} />
      <div className="window">
        <TitleBar title="QUIZZIE.EXE" />
        <MenuBar />
        <div className="window-body">
          <div className="quiz-header">
            <span>Question {qIndex + 1} / {QUESTIONS.length}</span>
            <span>Score : {totalScore} pts</span>
          </div>

          <div className="inset-box question-box">
            <div className="attempt-label">
              Tentative {attempt + 1} / 3
              {phase === 'playing' && attempt > 0 && (
                <span className="attempt-hint"> — Mauvaise reponse, nouvelles lettres revelees !</span>
              )}
            </div>
            <p className="question-text">{masked}</p>
          </div>

          {showFeedback && (
            <div className={`feedback-box ${phase === 'correct' ? 'success' : 'error'}`}>
              <Lottie
                animationData={phase === 'correct' ? victoryAnim : errorAnim}
                loop={true}
                style={{ width: 72, height: 72, flexShrink: 0 }}
              />
              <span className="feedback-text">
                {phase === 'correct'
                  ? `Bonne reponse ! +${POINTS[attempt] ?? 0} points`
                  : `Plus de tentatives ! Reponse : ${q.choices[q.correctIndex]}`}
              </span>
            </div>
          )}

          <div className="choices">
            {q.choices.map((choice, i) => {
              const isWrong = wrongPicks.includes(i)
              const isCorrectChoice = i === q.correctIndex
              let cls = 'btn choice-btn'
              if (isWrong) cls += ' btn-wrong'
              if (showFeedback && isCorrectChoice) cls += ' btn-correct'
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => handlePick(i)}
                  disabled={isWrong || showFeedback}
                >
                  {String.fromCharCode(65 + i)}. {choice}
                </button>
              )
            })}
          </div>

          {showFeedback && (
            <div className="continue-row">
              <button className="btn" onClick={handleNext}>
                Question suivante &gt;
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
