import { type FastCheck } from 'effect'

export const nullableConstantFrom = (
  values: readonly string[],
  weights?: { nullWeight?: number, valueWeight?: number },
) =>
  (fc: typeof FastCheck) =>
    weights == null
      ? fc.oneof(fc.constant(null), fc.constantFrom(...values))
      : fc.oneof(
        { arbitrary: fc.constant(null), weight: weights.nullWeight ?? 1 },
        { arbitrary: fc.constantFrom(...values), weight: weights.valueWeight ?? 1 },
      )
