/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import { Plugin } from 'vite'

import { OUT_DIR } from '../utils'

/**
 * Records `src`-relative module path -> emitted file name for a `preserveModules` build.
 *
 * The `dist/exports` shims need to point at real files, and output names are not derivable from
 * source paths: under `preserveModules` a stylesheet also produces a JS placeholder, so
 * `button.scss` and `Button.tsx` claim the same output path on a case-insensitive filesystem and
 * rolldown renames one to `Button2.mjs`. Reading the bundle is exact and stays correct whatever
 * rolldown decides to call things.
 */
export function writeModuleManifest(name: string): Plugin {
  return {
    name: 'write-module-manifest',
    apply: 'build',
    writeBundle(options, bundle) {
      const srcRoot = path.resolve(__dirname, '../../src')
      const manifest: Record<string, string> = {}

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue
        const moduleId = chunk.facadeModuleId
        if (!moduleId?.startsWith(srcRoot)) continue

        const key = path
          .relative(srcRoot, moduleId)
          .replace(/\.(tsx?|jsx?)$/, '')
          .split(path.sep)
          .join('/')

        manifest[key] = fileName
      }

      const target = path.resolve(__dirname, `../../${OUT_DIR}/.manifest-${name}.json`)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`)
      console.log(`✓ Module manifest → ${target} (${Object.keys(manifest).length} modules)`)
    },
  }
}
