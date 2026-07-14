import { BigDecimal } from 'effect'

import { fromNonRecursiveBigDecimal, type NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'

export const required = (message: string) => (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ? message : undefined

export const positiveAmount = (message: string) => (value: NonRecursiveBigDecimal | null) =>
  value !== null && BigDecimal.isPositive(fromNonRecursiveBigDecimal(value)) ? undefined : message
