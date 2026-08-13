import fs from 'node:fs'

// Reports headroom between actual coverage and the committed floors in vitest.config.ts, and with
// --write raises any floor that has 2pt or more of slack. The floors are a backstop, so raising
// them is a deliberate act in its own PR — never something a normal test run does, which is what
// keeps concurrent PRs off these four lines.

const SUMMARY_PATH = 'coverage/coverage-summary.json'
const CONFIG_PATH = 'vitest.config.ts'

// One below the whole percent actual has reached, so slack always lands in [1pt, 2pt). Never
// returns less than the current floor — this ratchet only goes up.
const targetFloor = (actual: number, current: number) => Math.max(current, Math.floor(actual) - 1)

const METRICS = ['lines', 'statements', 'functions', 'branches'] as const

type Metric = typeof METRICS[number]
type Summary = Record<Metric, { pct: number }>

if (!fs.existsSync(SUMMARY_PATH)) {
  console.error(`No ${SUMMARY_PATH}. Run \`npm run test:coverage\` first.`)
  process.exit(1)
}

const total = (JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8')) as { total: Summary }).total
const config = fs.readFileSync(CONFIG_PATH, 'utf8')

const readFloor = (metric: Metric) => {
  const match = new RegExp(`^\\s*${metric}: (\\d+(?:\\.\\d+)?),`, 'm').exec(config)
  if (!match) throw new Error(`No ${metric} threshold found in ${CONFIG_PATH}`)
  return Number(match[1])
}

const rows = METRICS.map((metric) => {
  const floor = readFloor(metric)
  const actual = total[metric].pct
  return { metric, floor, actual, headroom: actual - floor, target: targetFloor(actual, floor) }
})

for (const { metric, floor, actual, headroom, target } of rows) {
  const flag = target > floor ? `  <- raise to ${target}` : headroom < 0 ? '  <- BELOW FLOOR' : ''
  console.info(`${metric.padEnd(11)} ${actual.toFixed(2).padStart(6)}%  floor ${String(floor).padStart(2)}  headroom ${headroom.toFixed(2).padStart(5)}${flag}`)
}

const raisable = rows.filter(row => row.target > row.floor)

if (raisable.length === 0) {
  console.info('\nEvery floor is within 2pt of actual. Nothing to raise.')
  process.exit(0)
}

if (!process.argv.includes('--write')) {
  console.info(`\n${raisable.length} floor(s) can be raised. Re-run with --write to update ${CONFIG_PATH}.`)
  process.exit(0)
}

const updated = raisable.reduce(
  (source, { metric, floor, target }) =>
    source.replace(new RegExp(`^(\\s*${metric}: )${floor},`, 'm'), `$1${target},`),
  config,
)

fs.writeFileSync(CONFIG_PATH, updated)
console.info(`\nRaised ${raisable.map(row => `${row.metric} to ${row.target}`).join(', ')} in ${CONFIG_PATH}. Commit it on its own.`)
