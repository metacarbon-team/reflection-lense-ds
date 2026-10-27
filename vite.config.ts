import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

// Everything the consumer installs (deps + peers) stays out of the bundle,
// including deep imports such as `react/jsx-runtime`.
const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]
const isExternal = (id: string) => external.some((dep) => id === dep || id.startsWith(`${dep}/`))

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
    },
    rolldownOptions: {
      external: isExternal,
    },
    sourcemap: true,
  },
})
