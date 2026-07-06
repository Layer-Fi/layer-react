import { Arbitrary, FastCheck, type Schema } from 'effect'

type GeneratorConfig = { numRuns: number, seed: number }

const DEFAULT_CONFIG: GeneratorConfig = { numRuns: 10, seed: 1 }

type GeneratorOptions<A> = {
  /**
   * When provided, rows are drawn as one batch and retried until no two share
   * the same projected value — e.g. dedupe fixtures by display name.
   */
  uniqueBy?: (value: A) => unknown
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
  const { uniqueBy } = options

  return (overrides?: Partial<GeneratorConfig>): A[] => {
    const config = { ...DEFAULT_CONFIG, ...overrides }

    if (uniqueBy == null) {
      return FastCheck.sample(arbitrary, config)
    }

    const [rows] = FastCheck.sample(
      FastCheck.uniqueArray(arbitrary, {
        selector: uniqueBy,
        minLength: config.numRuns,
        maxLength: config.numRuns,
      }),
      { numRuns: 1, seed: config.seed },
    )

    return rows
  }
}
