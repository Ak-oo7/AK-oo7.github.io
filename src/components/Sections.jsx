import { useEffect, useState } from 'react'
import { profile, filters, projects, skills, experience, certs } from '../data'
import { stage } from '../stage'

const NAV = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['experience', 'Experience'],
  ['certifications', 'Certifications'],
  ['github', 'GitHub'],
  ['contact', 'Contact'],
]

/* ---------------- Nav ---------------- */
export function Nav({ toggleTheme }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    NAV.forEach(([id]) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
      io.disconnect()
    }
  }, [])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a className="brand" href="#home" aria-label="Abhinav I, home">
        <span className="brand-mark" aria-hidden="true">AI</span>
        <span>{profile.name}</span>
      </a>
      <nav aria-label="Primary" id="menu" className={open ? 'open' : ''}>
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <button className="icon-btn" onClick={toggleTheme} aria-label="Switch colour theme" title="Switch theme">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>
        <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Open menu" aria-expanded={open} aria-controls="menu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </header>
  )
}

/* ---------------- Hero ---------------- */
const HEADLINE = 'I build AI systems that read, see, and predict.'.split(' ')

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="wrap hero-inner">
        <p className="status"><span className="dot" aria-hidden="true" />Open to opportunities</p>
        <h1 className="h1">
          {HEADLINE.map((word, i) => (
            <span key={i}>
              <span className="w"><span style={{ '--i': i }}>{word}</span></span>{' '}
            </span>
          ))}
        </h1>
        <p className="lede">
          AI/ML engineer and final-year B.Tech student. I build retrieval-augmented assistants,
          computer vision models and predictive ML pipelines, and I lead design and mentoring in
          student tech communities.
        </p>
        <div className="cta">
          <a className="btn primary" href={profile.resume} target="_blank" rel="noopener">Download resume</a>
          <a className="btn" href="#projects">See projects</a>
          <a className="btn ghost" href={profile.githubUrl} target="_blank" rel="noopener">GitHub</a>
          <a className="btn ghost" href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</a>
        </div>
        <dl className="facts">
          <div><dt>Studying</dt><dd>B.Tech, AI &amp; Data Science</dd></div>
          <div><dt>College</dt><dd>Vimal Jyothi Engineering College</dd></div>
          <div><dt>CGPA</dt><dd>8.82</dd></div>
        </dl>
        <p className="hint">Move your cursor to tilt the network. Click anywhere to send a shockwave through it.</p>
      </div>
    </section>
  )
}

/* ---------------- About ---------------- */
export function About() {
  return (
    <section className="section" id="about">
      <div className="wrap two">
        <h2>Engineering AI systems with clarity, performance and intent.</h2>
        <div className="prose">
          <p>
            I'm a Computer Science undergraduate specialising in Artificial Intelligence and Data Science.
            My work centres on machine learning, deep learning, computer vision, generative AI, LLMs,
            retrieval-augmented generation (RAG) and AI automation.
          </p>
          <p>
            Outside coursework I serve as a Design Lead for two IEEE chapters and have led an AI/ML internship,
            mentoring students through hands-on machine learning tasks.
          </p>
          <ul className="focus" aria-label="Focus areas">
            {['Machine learning', 'Deep learning', 'Computer vision', 'LLMs and RAG', 'Agentic AI and automation', 'Data analysis'].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Projects ---------------- */
export function Projects() {
  const [filter, setFilter] = useState('all')
  const shown = projects.filter((p) => filter === 'all' || p.cat.includes(filter))

  return (
    <section className="section alt" id="projects">
      <div className="wrap">
        <div className="head">
          <h2>Selected projects</h2>
          <div className="filters" role="group" aria-label="Filter projects">
            {filters.map((f) => (
              <button key={f.id} className={`chip ${filter === f.id ? 'active' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid">
          {shown.map((p, i) => (
            <article key={p.title} className={`card ${filter === 'all' && i === 0 ? 'feature' : ''}`}>
              <div className="shot">
                <img src={p.img} alt={p.alt} loading="lazy" width="1200" height="750" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
              <div className="body">
                <p className="cat">{p.label}</p>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                <a className="link" href={p.url} target="_blank" rel="noopener">View source on GitHub</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Skills ---------------- */
export function Skills() {
  return (
    <section className="section" id="skills">
      <div className="wrap">
        <h2>Skills</h2>
        <div className="skills">
          {skills.map((s) => (
            <div key={s.group}>
              <h3>{s.group}</h3>
              <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Experience ---------------- */
export function Experience() {
  return (
    <section className="section alt" id="experience">
      <div className="wrap two">
        <h2>Leadership, mentoring and hands-on learning</h2>
        <ol className="timeline">
          {experience.map((x, i) => (
            <li key={x.role + x.org} className={i === 0 ? 'current' : ''}>
              <h3>{x.role}</h3>
              <p className="meta">{x.org}</p>
              <p>{x.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- Certifications ---------------- */
export function Certifications() {
  return (
    <section className="section" id="certifications">
      <div className="wrap two">
        <h2>Certifications</h2>
        <ul className="certs">
          {certs.map(([name, issuer]) => (
            <li key={name}><span>{name}</span><em>{issuer}</em></li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- GitHub (live) ---------------- */
export function GitHub() {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let dead = false
    ;(async () => {
      const user = profile.github
      try {
        const [u, r] = await Promise.all([
          fetch(`https://api.github.com/users/${user}`),
          fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`),
        ])
        if (!u.ok || !r.ok) throw new Error('GitHub API unavailable')
        const prof = await u.json()
        const repos = (await r.json()).filter((x) => !x.fork && x.name.toLowerCase() !== `${user}.github.io`.toLowerCase())

        const counts = {}
        repos.forEach((x) => x.language && (counts[x.language] = (counts[x.language] || 0) + 1))
        const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
        const total = langs.reduce((s, [, n]) => s + n, 0) || 1
        const top = [...repos]
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
          .slice(0, 6)

        if (!dead) {
          setState({
            status: 'ok',
            repos: prof.public_repos,
            followers: prof.followers,
            stars: repos.reduce((s, x) => s + x.stargazers_count, 0),
            langs: langs.map(([name, n]) => ({ name, pct: Math.round((n / total) * 100), w: (n / total) * 100 })),
            top,
          })
        }
      } catch (err) {
        if (!dead) setState({ status: 'error' })
      }
    })()
    return () => { dead = true }
  }, [])

  const ok = state.status === 'ok'
  return (
    <section className="section alt" id="github">
      <div className="wrap">
        <div className="head">
          <h2>Live from GitHub</h2>
          <a className="link" href={profile.githubUrl} target="_blank" rel="noopener">github.com/{profile.github}</a>
        </div>
        <div className="gh-stats" aria-live="polite">
          <div><b>{ok ? state.repos : '–'}</b><span>Public repositories</span></div>
          <div><b>{ok ? state.stars : '–'}</b><span>Stars earned</span></div>
          <div><b>{ok ? state.followers : '–'}</b><span>Followers</span></div>
        </div>
        {ok && (
          <>
            <div className="langbar" aria-hidden="true">
              {state.langs.map((l, i) => <i key={l.name} style={{ width: `${l.w}%`, background: `var(--l${i + 1})` }} />)}
            </div>
            <ul className="legend">
              {state.langs.map((l, i) => <li key={l.name} style={{ '--c': `var(--l${i + 1})` }}>{l.name} ({l.pct}%)</li>)}
            </ul>
          </>
        )}
        <div className="repos">
          {state.status === 'loading' && <p className="muted">Loading repositories…</p>}
          {state.status === 'error' && (
            <p className="muted">
              Live GitHub data could not be loaded right now. You can browse everything at{' '}
              <a className="link" href={profile.githubUrl} target="_blank" rel="noopener">github.com/{profile.github}</a>.
            </p>
          )}
          {ok && state.top.map((repo) => (
            <a key={repo.id} className="repo" href={repo.html_url} target="_blank" rel="noopener">
              <strong>{repo.name}</strong>
              <p>{repo.description || 'No description yet.'}</p>
              <small>{[repo.language, repo.stargazers_count ? `${repo.stargazers_count} stars` : null].filter(Boolean).join(', ')}</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Contact + footer ---------------- */
export function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <h2>Let's build something intelligent and useful.</h2>
        <a className="mail" href={`mailto:${profile.email}`}>{profile.email}</a>
        <div className="cta">
          <a className="btn primary" href={`mailto:${profile.email}`}>Send an email</a>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          <a className="btn" href={profile.githubUrl} target="_blank" rel="noopener">GitHub</a>
          <a className="btn ghost" href={profile.resume} target="_blank" rel="noopener">Resume (PDF)</a>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const replay = () => {
    try { sessionStorage.removeItem('introSeen') } catch (e) {}
    window.scrollTo(0, 0)
    window.location.reload()
  }
  return (
    <footer className="foot">
      <div className="wrap">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="foot-links">
          {!stage.reduce && <button className="linkbtn" onClick={replay}>Replay intro</button>}
          <a href="#home">Back to top</a>
        </span>
      </div>
    </footer>
  )
}
