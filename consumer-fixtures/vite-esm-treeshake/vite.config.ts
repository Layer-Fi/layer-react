import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Shared with check-treeshake.mjs, which runs under plain node and so cannot import a .ts file.
import { FORBIDDEN_DEPS } from './forbidden-deps.mjs'

// Library mode rather than an app build: externalising is what makes the assertion possible, and
// bare imports in an app bundle would be meaningless. This fixture is never loaded in a browser.
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false,
    lib: {
      entry: 'src/main.tsx',
      formats: ['es'],
      fileName: () => 'main.mjs',
    },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        ...FORBIDDEN_DEPS.map(dep => new RegExp(`^${dep.replace('/', '\\/')}($|\\/)`)),
      ],
    },
  },
})
