/* eslint-disable no-console */
import { Plugin } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { OUT_DIR } from '../utils'

export function bundleCss(): Plugin {
  return {
    name: 'bundle-css',
    apply: 'build',
    writeBundle() {
      const distDir = path.resolve(__dirname, `../../${OUT_DIR}`)
      const esmDir = path.join(distDir, 'esm')
      const stylesCssPath = path.join(esmDir, 'styles.css')
      const indexCssPath = path.join(esmDir, 'index.css')
      const mergedPath = path.join(distDir, 'index.css')

      // Concat styles.css (global styles) before index.css (component styles)
      // so that component-level styles win on equal specificity.
      const parts: string[] = []
      if (fs.existsSync(stylesCssPath)) {
        parts.push(fs.readFileSync(stylesCssPath, 'utf8'))
        fs.unlinkSync(stylesCssPath)
      }
      if (fs.existsSync(indexCssPath)) {
        parts.push(fs.readFileSync(indexCssPath, 'utf8'))
        fs.unlinkSync(indexCssPath)
      }

      if (parts.length > 0) {
        // Each part carries its own `@charset`, and concatenating them leaves one partway down
        // the file — invalid, and every consumer's postcss build warns about it. Hoist a single
        // declaration to the top instead.
        const merged = parts
          .map(part => part.replace(/^[ \t]*@charset[^;]*;[ \t]*\r?\n?/gim, ''))
          .join('\n')
        fs.writeFileSync(mergedPath, `@charset "UTF-8";\n${merged}`)
        console.log('✓ Merged CSS →', mergedPath)
      }
    },
  }
}
