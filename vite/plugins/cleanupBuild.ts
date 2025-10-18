import { Plugin } from "vite"
import path from "node:path"
import fs from "node:fs"
import { OUT_DIR } from '../constants'

export function cleanupBuild(): Plugin {
  return {
    name: "cleanup-build",
    apply: "build",
    closeBundle() {
      const distDir = path.resolve(__dirname, `../../${OUT_DIR}`)
      const cjsDir = path.join(distDir, "cjs")

      // Remove styles.d.ts (unwanted type file from styles entry)
      const stylesDts = path.join(distDir, "styles.d.ts")
      if (fs.existsSync(stylesDts)) {
        fs.unlinkSync(stylesDts)
        console.log("✓ Cleaned temp file →", stylesDts)
      }

      // Remove any CSS files from CJS build (CSS is only in dist/index.css)
      if (!fs.existsSync(cjsDir)) return

      const cssFiles = fs
        .readdirSync(cjsDir)
        .filter((file) => file.endsWith(".css"))
      
      cssFiles.forEach((file) => {
        const filePath = path.join(cjsDir, file)
        fs.unlinkSync(filePath)
        console.log("✓ Cleaned CSS file →", filePath)
      })
    },
  }
}