/*
 * Orders two generated dates oldest-first, as a tuple so both halves stay defined —
 * `[a, b].sort()` widens back to `Date[]`.
 */
export const sortedDatePair = (a: Date, b: Date): [Date, Date] =>
  a.getTime() <= b.getTime() ? [a, b] : [b, a]
