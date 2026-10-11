import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The repo is named AK-oo7.github.io, so the site is served from the domain root: base '/'.
// (If you ever deploy to a project repo like username.github.io/my-repo, set base: '/my-repo/')
export default defineConfig({
  plugins: [react()],
  base: '/',
})
