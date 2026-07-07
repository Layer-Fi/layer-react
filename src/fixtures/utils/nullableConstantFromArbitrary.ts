import { type FastCheck } from 'effect'

/*
 * Picks from a fixed pool of values, sometimes yielding null. Shared by the
 * many nullable string fields (addresses, descriptions, memos) across fixture
 * schemas. `nullWeight` biases how often null wins relative to a value.
 */
export const nullableConstantFrom = (
  values: readonly string[],
  { nullWeight = 1, valueWeight = 1 }: { nullWeight?: number, valueWeight?: number } = {},
) =>
  (fc: typeof FastCheck) =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: nullWeight },
      { arbitrary: fc.constantFrom(...values), weight: valueWeight },
    )
