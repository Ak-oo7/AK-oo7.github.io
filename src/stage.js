// Tiny shared store so React (intro overlay) and Three.js (render loop) stay in sync
// without re-rendering React every frame.
const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
let seen = false
try { seen = sessionStorage.getItem('introSeen') === '1' } catch (e) {}

export const stage = {
  phase: 'boot',        // 'boot' -> 'warp'
  warpT0: -1,           // scene clock time when the warp started
  reduce,               // user prefers reduced motion
  instant: reduce || seen, // skip the cinematic intro (reduced motion, or already seen this session)
}
