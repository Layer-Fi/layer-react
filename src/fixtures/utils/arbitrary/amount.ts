import { type FastCheck } from 'effect'

const CENTS_PER_DOLLAR = 100

type CentsAmountOptions = {
  minDollars: number
  maxDollars: number
  stepDollars?: number
}

export const centsAmountArbitrary = (
  { minDollars, maxDollars, stepDollars = 1 }: CentsAmountOptions,
) =>
  (fc: typeof FastCheck) =>
    fc.integer({ min: minDollars / stepDollars, max: maxDollars / stepDollars })
      .map(steps => steps * stepDollars * CENTS_PER_DOLLAR)
