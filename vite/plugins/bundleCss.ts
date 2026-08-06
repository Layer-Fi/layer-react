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
        // Concatenating leaves a part's own `@charset` partway down the file, which is invalid and
        // warns in every consumer's postcss build. Strip them and hoist one to the top.
        const merged = parts
          .map(part => part.replace(/^[ \t]*@charset[^;]*;[ \t]*\r?\n?/gim, ''))
          .join('\n')
        fs.writeFileSync(mergedPath, `@charset "UTF-8";\n${merged}`)
        console.log('✓ Merged CSS →', mergedPath)
      }
    },
  }
}
