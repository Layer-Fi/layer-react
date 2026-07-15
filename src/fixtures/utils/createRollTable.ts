import { type FastCheck } from 'effect'

type RollCases<TCase extends string> = ReadonlyArray<readonly [TCase, number]>

/*
 * A weighted case table over a single die roll. Cases are declared in order
 * with their weights; a roll lands in the first case whose cumulative weight
 * exceeds it, and `handle` dispatches to that case's handler.
 */
export const createRollTable = <TCase extends string>(cases: RollCases<TCase>) => {
  const outOf = cases.reduce((total, [, weight]) => total + weight, 0)

  const resolve = (roll: number): TCase => {
    let ceiling = 0

    for (const [name, weight] of cases) {
      ceiling += weight
      if (roll < ceiling) return name
    }

    return cases[cases.length - 1][0]
  }

  const handle = <TResult>(roll: number, handlers: Record<TCase, () => TResult>): TResult =>
    handlers[resolve(roll)]()

  // noBias keeps the roll uniform; fast-check otherwise skews samples toward
  // the minimum, collapsing the case distribution.
  const rollArbitrary = (fc: typeof FastCheck) => fc.noBias(fc.nat(outOf - 1))

  return { outOf, resolve, handle, rollArbitrary }
}
