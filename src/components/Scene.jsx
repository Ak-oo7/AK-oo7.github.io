import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { stage } from '../stage'

/* ------------------------------------------------------------------
   One fixed WebGL canvas behind the whole page.
   - 7,000 GPU particles fly in from chaos and assemble into a neural sphere
   - a wireframe of "neurons" fades in once the sphere has formed
   - the camera warps forward when the intro ends (FOV punch + roll + dolly)
   - mouse tilts the sphere, click sends a shockwave through it
   - scrolling fades it out and lifts it away
   Tweak the constants below to change the feel.
------------------------------------------------------------------- */
const COUNT = 7000        // particle count (lower on slow devices)
const NODES = 150         // neurons in the wire network
const LINK_DIST = 1.4     // max distance between linked neurons
const RADIUS = 3          // sphere radius
const POINT_SIZE = 2.2    // base particle size

const PALETTE = {
  dark: { a: '#8aa4ff', b: '#ffb454' },
  light: { a: '#3550d8', b: '#c26a00' },
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uSize;
  uniform float uPulse;
  attribute vec3 aStart;
  attribute float aSeed;
  varying float vSeed;
  varying float vGlow;

  void main() {
    // staggered flight from the chaos position to the sphere position
    float m = clamp((uMorph - aSeed * 0.35) / 0.65, 0.0, 1.0);
    m = 1.0 - pow(1.0 - m, 3.0);
    vec3 p = mix(aStart, position, m);

    // swirl while travelling
    float a = (1.0 - m) * 2.4 * aSeed;
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;

    // slow breathing
    p += normalize(position) * sin(uTime * 0.8 + aSeed * 20.0) * 0.04 * m;

    // click shockwave: a ring that travels outward through the shell
    float t = uTime - uPulse;
    float r = length(position);
    float front = t * 5.0;
    float wave = exp(-pow(r - front, 2.0) * 1.5) * step(0.0, t) * exp(-t * 0.7);
    p += normalize(position) * wave * 0.8;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aSeed) * (28.0 / -mv.z) * (1.0 + wave * 2.0);

    vSeed = aSeed;
    vGlow = wave;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColA;
  uniform vec3 uColB;
  uniform float uOpacity;
  varying float vSeed;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    float mixAmt = clamp(step(0.86, vSeed) + vGlow, 0.0, 1.0);
    gl_FragColor = vec4(mix(uColA, uColB, mixAmt), soft * uOpacity);
  }
`

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export default function Scene({ theme, onFail }) {
  const mountRef = useRef(null)
  const api = useRef({})

  useEffect(() => {
    const mount = mountRef.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch (err) {
      onFail?.()
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 0, 14.4)

    /* ----- particle data ----- */
    const target = new Float32Array(COUNT * 3)
    const start = new Float32Array(COUNT * 3)
    const seed = new Float32Array(COUNT)
    const shellIdx = []
    for (let i = 0; i < COUNT; i++) {
      const onShell = Math.random() < 0.8
      const u = Math.random() * 2 - 1
      const th = Math.random() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const r = onShell ? RADIUS * (0.96 + Math.random() * 0.08) : RADIUS * Math.cbrt(Math.random()) * 0.9
      target[i * 3] = r * s * Math.cos(th)
      target[i * 3 + 1] = r * u
      target[i * 3 + 2] = r * s * Math.sin(th)

      const su = Math.random() * 2 - 1
      const sth = Math.random() * Math.PI * 2
      const ss = Math.sqrt(1 - su * su)
      const sr = 14 + Math.random() * 26
      start[i * 3] = sr * ss * Math.cos(sth)
      start[i * 3 + 1] = sr * su
      start[i * 3 + 2] = sr * ss * Math.sin(sth)

      seed[i] = Math.random()
      if (onShell && shellIdx.length < NODES) shellIdx.push(i)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(target, 3))
    geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uSize: { value: POINT_SIZE * dpr },
      uPulse: { value: -100 },
      uOpacity: { value: 0 },
      uColA: { value: new THREE.Color(PALETTE.dark.a) },
      uColB: { value: new THREE.Color(PALETTE.dark.b) },
    }
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false // particles start far outside their final bounding sphere

    /* ----- neuron wire network (built from the final positions) ----- */
    const segs = []
    for (let i = 0; i < shellIdx.length; i++) {
      for (let j = i + 1; j < shellIdx.length; j++) {
        const a = shellIdx[i] * 3
        const b = shellIdx[j] * 3
        const dx = target[a] - target[b]
        const dy = target[a + 1] - target[b + 1]
        const dz = target[a + 2] - target[b + 2]
        if (dx * dx + dy * dy + dz * dz < LINK_DIST * LINK_DIST) {
          segs.push(target[a], target[a + 1], target[a + 2], target[b], target[b + 1], target[b + 2])
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs), 3))
    const lineMat = new THREE.LineBasicMaterial({
      color: PALETTE.dark.a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const lines = new THREE.LineSegments(lineGeo, lineMat)

    const group = new THREE.Group()
    group.add(points, lines)
    scene.add(group)

    /* ----- theme handling (additive glow on dark, normal blending on light) ----- */
    api.current.setTheme = (t) => {
      const p = PALETTE[t] || PALETTE.dark
      uniforms.uColA.value.set(p.a)
      uniforms.uColB.value.set(p.b)
      lineMat.color.set(p.a)
      const blend = t === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending
      mat.blending = blend
      lineMat.blending = blend
      mat.needsUpdate = true
      lineMat.needsUpdate = true
    }

    /* ----- input ----- */
    const mouse = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }
    const clock = new THREE.Clock()
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onDown = (e) => {
      if (e.target.closest && e.target.closest('a, button')) return
      uniforms.uPulse.value = clock.elapsedTime
    }
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('resize', onResize)

    /* ----- render loop ----- */
    let raf = 0
    let last = 0
    let baseY = 0
    let lastFov = camera.fov
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const t = clock.getElapsedTime()
      const dt = Math.min(t - last, 0.05)
      last = t
      const still = stage.instant // reduced motion, or intro already seen: jump straight to the final state

      const morph = still ? 1 : clamp((t - 0.3) / 3.6, 0, 1)

      // warp (camera dive) once the intro hands over
      let w = still ? 1 : 0
      if (!still && stage.phase === 'warp') {
        if (stage.warpT0 < 0) stage.warpT0 = t
        w = clamp((t - stage.warpT0) / 2.2, 0, 1)
      }
      const e = easeOutExpo(w)

      const portrait = camera.aspect < 1.05
      const sf = clamp(window.scrollY / (window.innerHeight * 0.8), 0, 1) // 0 at top, 1 once the hero is gone

      camera.position.z = lerp(14.4, 9.2, e)
      camera.rotation.z = still ? 0 : Math.sin(w * Math.PI) * 0.07
      const fov = 55 + (still ? 0 : Math.sin(w * Math.PI) * 16)
      if (Math.abs(fov - lastFov) > 0.01) {
        camera.fov = fov
        camera.updateProjectionMatrix()
        lastFov = fov
      }

      // hero layout: sphere on the right (desktop) or lifted up behind the text (mobile)
      const scale = portrait ? 0.78 : 1
      group.scale.setScalar(scale)
      group.position.x = portrait ? 0 : 3.1 * e
      group.position.y = (portrait ? 2.3 * e : 0) + sf * 2.2

      // motion
      if (!stage.reduce) {
        smooth.x += (mouse.x - smooth.x) * 0.05
        smooth.y += (mouse.y - smooth.y) * 0.05
        baseY += dt * 0.12 + (still ? 0 : Math.sin(w * Math.PI) * dt * 1.6)
      }
      group.rotation.y = baseY + smooth.x * 0.5 + window.scrollY * 0.0008
      group.rotation.x = 0.15 + smooth.y * 0.3

      uniforms.uTime.value = t
      uniforms.uMorph.value = morph
      uniforms.uSize.value = POINT_SIZE * dpr * (1 + (still ? 0 : Math.sin(w * Math.PI) * 0.8))
      const fadeIn = still ? 1 : Math.min(1, t / 0.8)
      const overall = fadeIn * (portrait ? 0.6 : 1) * (1 - sf * 0.85)
      uniforms.uOpacity.value = overall
      lineMat.opacity = clamp((morph - 0.75) / 0.25, 0, 1) * 0.35 * overall

      renderer.render(scene, camera)
    }
    frame()
    api.current.setTheme(document.documentElement.getAttribute('data-theme') || 'dark')

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', onResize)
      geo.dispose(); mat.dispose(); lineGeo.dispose(); lineMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    api.current.setTheme?.(theme)
  }, [theme])

  return <div className="scene" ref={mountRef} aria-hidden="true" />
}
