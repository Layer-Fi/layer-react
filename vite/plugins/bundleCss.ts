/* eslint-disable no-console */
import { Plugin } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { OUT_DIR } from '../constants'

export function bundleCss(): Plugin {
  return {
    name: 'bundle-css',
    apply: 'build',
    writeBundle() {
      const distDir = path.resolve(__dirname, `../../${OUT_DIR}`)
      const esmDir = path.join(distDir, 'esm')
      const componentsCssPath = path.join(esmDir, 'components.css')

      // Move dist/esm/components.css to dist/index.css
      if (fs.existsSync(componentsCssPath)) {
        const mergedPath = path.join(distDir, 'index.css')
        fs.renameSync(componentsCssPath, mergedPath)
        console.log('✓ Moved CSS →', mergedPath)
      }
    },
  }
}
