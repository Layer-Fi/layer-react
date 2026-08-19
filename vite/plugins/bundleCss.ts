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
      const mergedPath = path.join(distDir, 'index.css')

      // `cssCodeSplit: false` emits a single stylesheet, but its name is derived from the lib
      // entry rather than fixed. Collect whatever landed and sort for a stable result; ordering
      // within the file already follows module execution order, global styles first.
      const cssFiles = fs
        .readdirSync(esmDir)
        .filter(file => file.endsWith('.css'))
        .sort()

      const parts = cssFiles.map((file) => {
        const filePath = path.join(esmDir, file)
        const contents = fs.readFileSync(filePath, 'utf8')
        fs.unlinkSync(filePath)
        return contents
      })

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
