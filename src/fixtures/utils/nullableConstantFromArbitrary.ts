import { type FastCheck } from 'effect'

export const nullableConstantFrom = (
  values: readonly string[],
  { nullWeight = 1, valueWeight = 1 }: { nullWeight?: number, valueWeight?: number } = {},
) =>
  (fc: typeof FastCheck) =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: nullWeight },
      { arbitrary: fc.constantFrom(...values), weight: valueWeight },
    )
