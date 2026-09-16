import { type FastCheck } from 'effect'

export const nullable = <T>(
  arbitrary: (fc: typeof FastCheck) => FastCheck.Arbitrary<T>,
  weights?: { nullWeight?: number, valueWeight?: number },
) =>
  (fc: typeof FastCheck) =>
    weights == null
      ? fc.oneof(fc.constant(null), arbitrary(fc))
      : fc.oneof(
        { arbitrary: fc.constant(null), weight: weights.nullWeight ?? 1 },
        { arbitrary: arbitrary(fc), weight: weights.valueWeight ?? 1 },
      )
