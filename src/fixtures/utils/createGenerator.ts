import { Arbitrary, FastCheck, type Schema } from 'effect'

type GeneratorConfig = { numRuns: number, seed: number }

const DEFAULT_CONFIG: GeneratorConfig = { numRuns: 10, seed: 1 }

const OVERSAMPLE_FACTOR = 50

type GeneratorOptions<A> = {
  uniqueBy?: readonly ((value: A) => unknown)[]
  seed?: number
}

/*
 * A deterministic generator from any schema's Arbitrary — a fixed seed means the
 * same rows every run, so generated fixtures stay stable. Defaults to 10 rows;
 * override numRuns/seed per call.
 */
export function createGenerator<A, I, R>(
  schema: Schema.Schema<A, I, R>,
  options: GeneratorOptions<A> = {},
) {
  const arbitrary = Arbitrary.make(schema)
  const { uniqueBy, seed } = options
  const defaultConfig = seed === undefined ? DEFAULT_CONFIG : { ...DEFAULT_CONFIG, seed }

  return (overrides?: Partial<GeneratorConfig>): A[] => {
    const config = { ...defaultConfig, ...overrides }

    if (uniqueBy == null) {
      return FastCheck.sample(arbitrary, config)
    }

    const candidateBudget = config.numRuns * OVERSAMPLE_FACTOR
    const candidates = FastCheck.sample(arbitrary, { numRuns: candidateBudget, seed: config.seed })
    const seenByKey = uniqueBy.map(() => new Set<unknown>())
    const rows: A[] = []

    for (const candidate of candidates) {
      const keys = uniqueBy.map(getKey => getKey(candidate))
      const collides = keys.some((key, index) => key != null && seenByKey[index].has(key))

      if (collides) continue

      keys.forEach((key, index) => {
        if (key != null) seenByKey[index].add(key)
      })
      rows.push(candidate)

      if (rows.length === config.numRuns) break
    }

    if (rows.length < config.numRuns) {
      throw new Error(
        `createGenerator: only found ${rows.length}/${config.numRuns} rows unique by the given key(s) after sampling ${candidateBudget} candidates — widen the underlying value pool(s) or lower numRuns.`,
      )
    }

    return rows
  }
}
