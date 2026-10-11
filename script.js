/* ============================================================
   Portfolio interactions
   1. Hero neural network (canvas)
   2. Nav: scroll state, active link, mobile menu
   3. Theme toggle
   4. Project filter
   5. Live GitHub data
   ============================================================ */

/* ---------- 1. Hero neural network ---------- */
(() => {
  const hero = document.getElementById('home');
  const canvas = document.getElementById('net');
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, nodes = [], pulses = [];
  let running = false, inView = true, lastAmbient = 0;
  const mouse = { x: -9999, y: -9999 };
  let colAccent = '#8aa4ff', colSignal = '#ffb454';

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    colAccent = s.getPropertyValue('--accent').trim() || colAccent;
    colSignal = s.getPropertyValue('--signal').trim() || colSignal;
    if (!running) draw();
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(120, Math.max(34, (w * h) / 14000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 1.3 + Math.random() * 1.7,
      e: 0 // energy: 0 idle, 1 just activated
    }));
    pulses = [];
    if (!running) draw();
  }

  const reach = () => Math.min(150, Math.max(90, w / 7));

  function neighbours(i) {
    const d2 = reach() ** 2, out = [];
    const a = nodes[i];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const dx = a.x - nodes[j].x, dy = a.y - nodes[j].y;
      if (dx * dx + dy * dy < d2) out.push(j);
    }
    return out;
  }

  function fire(i, hops = 5) {
    const n = neighbours(i);
    if (!n.length) return;
    nodes[i].e = 1;
    pulses.push({ from: i, to: n[(Math.random() * n.length) | 0], t: 0, hops });
  }

  function nearest(x, y) {
    let best = 0, bd = Infinity;
    nodes.forEach((n, i) => {
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  function step(now) {
    const R = reach();
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < R * 1.2) {
        n.e = Math.max(n.e, 1 - d / (R * 1.2));
        n.x += (dx / (d || 1)) * 0.35; // gentle repel so the net parts around the cursor
        n.y += (dy / (d || 1)) * 0.35;
      }
      n.e *= 0.965;
    }
    // ambient signal so the page feels alive without input
    if (now - lastAmbient > 1400) {
      lastAmbient = now;
      fire((Math.random() * nodes.length) | 0, 4);
    }
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.t += 0.035;
      if (p.t >= 1) {
        const arrived = p.to;
        nodes[arrived].e = 1;
        pulses.splice(k, 1);
        if (p.hops > 0 && Math.random() < 0.75) {
          const n = neighbours(arrived).filter(j => j !== p.from);
          if (n.length) pulses.push({ from: arrived, to: n[(Math.random() * n.length) | 0], t: 0, hops: p.hops - 1 });
        }
      }
    }
    if (pulses.length > 80) pulses.splice(0, pulses.length - 80);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const R = reach(), R2 = R * R;
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        const closeness = 1 - Math.sqrt(d2) / R;
        const energy = Math.max(a.e, b.e);
        ctx.strokeStyle = energy > 0.25 ? colSignal : colAccent;
        ctx.globalAlpha = closeness * (0.16 + energy * 0.7);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    for (const n of nodes) {
      ctx.globalAlpha = 0.55 + n.e * 0.45;
      ctx.fillStyle = n.e > 0.25 ? colSignal : colAccent;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.e * 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = colSignal;
    for (const p of pulses) {
      const a = nodes[p.from], b = nodes[p.to];
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    if (!running) return;
    step(now); draw();
    requestAnimationFrame(loop);
  }
  function start() { if (!running && !reduceMotion && inView && !document.hidden) { running = true; requestAnimationFrame(loop); } }
  function stop() { running = false; }

  hero.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  hero.addEventListener('pointerdown', e => {
    if (e.target.closest('a, button')) return;
    const r = canvas.getBoundingClientRect();
    fire(nearest(e.clientX - r.left, e.clientY - r.top), 8);
  });

  new IntersectionObserver(([en]) => { inView = en.isIntersecting; inView ? start() : stop(); }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  window.addEventListener('resize', resize);
  document.addEventListener('themechange', readColors);

  resize(); readColors(); draw(); start();
})();

/* ---------- 2. Nav ---------- */
(() => {
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const btn = document.getElementById('menuBtn');
  const links = [...menu.querySelectorAll('a')];

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.remove('active'));
      map.get(en.target.id)?.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

  const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  links.forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ---------- 3. Theme ---------- */
(() => {
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const apply = t => {
    root.setAttribute('data-theme', t);
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0a0e1f' : '#f6f7fc');
    document.dispatchEvent(new Event('themechange'));
  };
  if (!localStorage.getItem('theme') && matchMedia('(prefers-color-scheme: light)').matches) apply('light');
  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch (e) {}
    apply(next);
  });
})();

/* ---------- 4. Project filter ---------- */
(() => {
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('#projectGrid .card');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => { c.classList.toggle('active', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
    let first = true;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.cat.split(' ').includes(f);
      card.classList.toggle('hide', !show);
      // the first visible card becomes the wide "feature" card only when showing everything
      card.classList.toggle('feature', show && first && f === 'all');
      if (show) first = false;
    });
  }));
})();

/* ---------- 5. Live GitHub data ---------- */
(async () => {
  const USER = 'Ak-oo7';
  const SELF = `${USER}.github.io`.toLowerCase();
  const list = document.getElementById('repoList');
  try {
    const [u, r] = await Promise.all([
      fetch(`https://api.github.com/users/${USER}`),
      fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`)
    ]);
    if (!u.ok || !r.ok) throw new Error('GitHub API unavailable');
    const profile = await u.json();
    const repos = (await r.json()).filter(x => !x.fork && x.name.toLowerCase() !== SELF);

    document.getElementById('ghRepos').textContent = profile.public_repos;
    document.getElementById('ghFollowers').textContent = profile.followers;
    document.getElementById('ghStars').textContent = repos.reduce((s, x) => s + x.stargazers_count, 0);

    // languages by repo count
    const counts = {};
    repos.forEach(x => { if (x.language) counts[x.language] = (counts[x.language] || 0) + 1; });
    const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = langs.reduce((s, [, n]) => s + n, 0) || 1;
    const bar = document.getElementById('langBar');
    const legend = document.getElementById('langLegend');
    langs.forEach(([name, n], i) => {
      const seg = document.createElement('i');
      seg.style.width = `${(n / total) * 100}%`;
      seg.style.background = `var(--l${i + 1})`;
      bar.appendChild(seg);
      const li = document.createElement('li');
      li.style.setProperty('--c', `var(--l${i + 1})`);
      li.textContent = `${name} (${Math.round((n / total) * 100)}%)`;
      legend.appendChild(li);
    });

    // featured repos: most starred, then most recently pushed
    const top = [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 6);
    list.textContent = '';
    top.forEach(repo => {
      const a = document.createElement('a');
      a.className = 'repo';
      a.href = repo.html_url; a.target = '_blank'; a.rel = 'noopener';
      const name = document.createElement('strong'); name.textContent = repo.name;
      const desc = document.createElement('p'); desc.textContent = repo.description || 'No description yet.';
      const meta = document.createElement('small');
      meta.textContent = [repo.language, repo.stargazers_count ? `${repo.stargazers_count} stars` : null].filter(Boolean).join(', ');
      a.append(name, desc, meta);
      list.appendChild(a);
    });
  } catch (err) {
    list.innerHTML = '<p class="muted">Live GitHub data could not be loaded right now. You can browse everything at <a class="link" href="https://github.com/Ak-oo7" target="_blank" rel="noopener">github.com/Ak-oo7</a>.</p>';
  }
})();

document.getElementById('year').textContent = new Date().getFullYear();
