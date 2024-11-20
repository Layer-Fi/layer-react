const { build, context } = require('esbuild')
const { dependencies, peerDependencies } = require('../package.json')
const { Generator } = require('npm-dts')
const { sassPlugin } = require('esbuild-sass-plugin')
const { rename, rm } = require('node:fs/promises')

const OUT_DIR = 'dist'

const args = process.argv.slice(2)
const watchModeEnabled = args.includes('--watch')

new Generator({
  entry: 'index.tsx',
  output: `${OUT_DIR}/index.d.ts`,
  tsc: '-p ./tsconfig.json',
},
  null,
  !watchModeEnabled
)
.generate()
.catch(() => {
  throw new Error(
    [
      "Failed to generate types:",
      "  - Try running `npx npm-dts generate -L debug` for more information",
    ].join('\n'),
  )
})

/** @type {import('esbuild').BuildOptions} */
const sharedConfig = {
  entryPoints: [ 'src/index.tsx' ],
  bundle: true,
  minify: false,
  tsconfig: './tsconfig.json',
  target: 'es2016',
  external: [
    ...Object.keys(peerDependencies || {}),
    ...Object.keys(dependencies || {}),
  ],
  plugins: [ sassPlugin() ],
}

/** @type {import('esbuild').BuildOptions} */
const cjsConfig = {
  ...sharedConfig,
  platform: 'node',
  outdir: `${OUT_DIR}/cjs`,
  outExtension: { '.js': '.cjs' },
}

const STYLE_ENTRY_POINT = 'src/styles/index.scss'

async function moveStyles(baseDir, { withMap = false } = {}) {
  await Promise.all(
    [
      rename(`${baseDir}/styles/index.css`, `${OUT_DIR}/index.css`),
      withMap
        ? rename(`${baseDir}/styles/index.css.map`, `${OUT_DIR}/index.css.map`)
        : null
    ].filter(Boolean)
  );
  await rm(`${baseDir}/styles`, { recursive: true })
}

/** @type {import('esbuild').BuildOptions} */
const esmConfig = {
  ...sharedConfig,
  entryPoints: [ ...sharedConfig.entryPoints, STYLE_ENTRY_POINT ],
  platform: 'neutral',
  outdir: `${OUT_DIR}/esm`,
  outExtension: { '.js': '.mjs' },
}

function buildAll() {
  void build(cjsConfig)
  void build(esmConfig).then(() => moveStyles(esmConfig.outdir))
}

async function watch() {
  const ctx = await context({
    ...esmConfig,
    target: 'esnext',
    minify: false,
    sourcemap: true,
    plugins: [
      ...esmConfig.plugins,
      {
        name: 'rebuild-notify',
        setup(build) {
          build.onEnd(() => {
            void moveStyles(
              esmConfig.outdir,
              { withMap: true }
            ).then(() => console.log('Rebuilt!'))
          })
        },
      },
    ]
  })
  await ctx.watch()
}

if (watchModeEnabled) {
  watch()
} else {
  buildAll()
}
