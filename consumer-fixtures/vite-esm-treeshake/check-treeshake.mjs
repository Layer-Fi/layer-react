import fs from 'node:fs'

import { FORBIDDEN_DEPS } from './forbidden-deps.mjs'

const BUILT = 'dist/main.mjs'

if (!fs.existsSync(BUILT)) {
  console.error(`::error::${BUILT} was not produced; the fixture build did not run`)
  process.exit(1)
}

const code = fs.readFileSync(BUILT, 'utf8')
const imported = new Set(
  [...code.matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm)]
    .map(([, specifier]) => specifier),
)

const leaked = FORBIDDEN_DEPS.filter(dep =>
  [...imported].some(specifier => specifier === dep || specifier.startsWith(`${dep}/`)),
)

if (leaked.length > 0) {
  console.error(
    '::error::Importing { GlobalMonthPicker } pulled in dependencies it does not use:\n'
    + leaked.map(dep => `  ${dep}`).join('\n')
    + '\n\nThis means tree-shaking regressed. Check that package.json still declares `sideEffects`'
    + ' and that the ESM build still emits one file per module (`preserveModules`).',
  )
  process.exit(1)
}

console.info(`Tree-shaking OK — none of the ${FORBIDDEN_DEPS.length} unused dependencies were pulled in.`)
