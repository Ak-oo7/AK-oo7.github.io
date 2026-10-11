import { useEffect, useRef, useState } from 'react'
import { stage } from '../stage'

const LINES = [
  ['Initialising neural field', 18],
  ['Loading retrieval index', 42],
  ['Calibrating vision pipeline', 68],
  ['Compiling portfolio', 92],
]
const BOOT_MS = 3600   // matches the particle assembly time in Scene.jsx
const HOLD_MS = 1300   // how long the name stays on screen
const LEAVE_MS = 1300  // time from "enter" until the page content is revealed

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export default function Intro({ onDone }) {
  const [pct, setPct] = useState(0)
  const [phase, setPhase] = useState('boot') // boot -> name -> leaving
  const leaving = useRef(false)
  const timers = useRef([])
  const skipRef = useRef(null)

  const enter = () => {
    if (leaving.current) return
    leaving.current = true
    setPhase('leaving')
    stage.phase = 'warp' // tells the Three.js scene to start the camera dive
    try { sessionStorage.setItem('introSeen', '1') } catch (e) {}
    timers.current.push(setTimeout(onDone, LEAVE_MS))
  }

  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (now) => {
      if (leaving.current) return
      const p = clamp((now - t0) / BOOT_MS, 0, 1)
      setPct(Math.round(p * p * (3 - 2 * p) * 100))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setPhase('name')
        timers.current.push(setTimeout(enter, HOLD_MS))
      }
    }
    raf = requestAnimationFrame(tick)

    const onKey = (e) => {
      if (['Enter', 'Escape', ' '].includes(e.key)) { e.preventDefault(); enter() }
    }
    window.addEventListener('keydown', onKey)
    skipRef.current?.focus()
    return () => {
      cancelAnimationFrame(raf)
      timers.current.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bootDone = phase !== 'boot'

  return (
    <div className={`intro ${phase}`} role="dialog" aria-label="Portfolio introduction">
      <div className="intro-inner">
        <div className={`boot ${bootDone ? 'gone' : ''}`}>
          <p className="count" aria-hidden="true">{pct}<span>%</span></p>
          <ul>
            {LINES.map(([label, at]) => (
              <li key={label} className={pct >= at ? 'on' : ''}>
                <span>{label}</span>
                <em>{pct >= at ? 'done' : '…'}</em>
              </li>
            ))}
          </ul>
        </div>

        <div className={`reveal ${bootDone ? 'show' : ''}`}>
          <p className="name" aria-label="Abhinav I">
            {'Abhinav I'.split('').map((c, i) => (
              <span key={i} style={{ '--i': i }} aria-hidden="true">{c === ' ' ? '\u00a0' : c}</span>
            ))}
          </p>
          <p className="role">AI Engineer, ML Engineer, Data Scientist</p>
        </div>
      </div>
      <button ref={skipRef} className="skip-intro" onClick={enter}>Skip intro</button>
    </div>
  )
}
