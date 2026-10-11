import { useEffect, useState } from 'react'
import Scene from './components/Scene.jsx'
import Intro from './components/Intro.jsx'
import { Nav, Hero, About, Projects, Skills, Experience, Certifications, GitHub, Contact, Footer } from './components/Sections.jsx'
import { stage } from './stage'

const initialTheme = () => {
  try {
    const t = localStorage.getItem('theme')
    if (t) return t
  } catch (e) {}
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [ready, setReady] = useState(stage.instant) // true = page content visible, intro finished

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0e1f' : '#f6f7fc')
    try { localStorage.setItem('theme', theme) } catch (e) {}
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('ready', ready)
    root.classList.toggle('locked', !ready) // no scrolling while the intro plays
  }, [ready])

  // If WebGL isn't available, skip the intro and show the content straight away
  const onSceneFail = () => { stage.instant = true; setReady(true) }

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Scene theme={theme} onFail={onSceneFail} />
      {!ready && <Intro onDone={() => setReady(true)} />}
      <Nav toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Certifications />
        <GitHub />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
