import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defaultClientConditions, defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Workspace packages resolve to their sources (the `source` export condition), so library
    // changes reload in the Lab without a build.
    conditions: ['source', ...defaultClientConditions],
    dedupe: ['react', 'react-dom'],
  },
})
