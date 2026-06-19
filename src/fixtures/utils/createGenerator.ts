import { Arbitrary, FastCheck, type Schema } from 'effect'

type GeneratorConfig = { numRuns: number, seed: number }

const DEFAULT_CONFIG: GeneratorConfig = { numRuns: 10, seed: 1 }

/*
 * A deterministic generator from any schema's Arbitrary — a fixed seed means the
 * same rows every run, so generated fixtures stay stable. Defaults to 10 rows;
 * override numRuns/seed per call.
 */
export function createGenerator<A, I, R>(schema: Schema.Schema<A, I, R>) {
  const arbitrary = Arbitrary.make(schema)

  return (overrides?: Partial<GeneratorConfig>): A[] =>
    FastCheck.sample(arbitrary, { ...DEFAULT_CONFIG, ...overrides })
}
