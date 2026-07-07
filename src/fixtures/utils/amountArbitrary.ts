import { type FastCheck } from 'effect'

const CENTS_PER_DOLLAR = 100

type CentsAmountOptions = {
  minDollars: number
  maxDollars: number
  /** Round to whole multiples of this many dollars for readable values. */
  stepDollars?: number
}

/*
 * A monetary amount in cents (Layer's wire unit for money), drawn from a
 * whole-dollar range so generated rates and totals read cleanly.
 */
export const centsAmountArbitrary = (
  { minDollars, maxDollars, stepDollars = 1 }: CentsAmountOptions,
) =>
  (fc: typeof FastCheck) =>
    fc.integer({ min: minDollars / stepDollars, max: maxDollars / stepDollars })
      .map(steps => steps * stepDollars * CENTS_PER_DOLLAR)
