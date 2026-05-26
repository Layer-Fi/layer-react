import { BigDecimal as BD, Schema } from 'effect'

import { convertBigDecimalToCents, convertCentsToBigDecimal } from '@utils/bigDecimalUtils'

export type NonRecursiveBigDecimal = { value: bigint, scale: number }

export const NonRecursiveBigDecimalSchema = Schema.Struct({
  value: Schema.BigIntFromSelf,
  scale: Schema.Int,
})

export const NRBD_ZERO: NonRecursiveBigDecimal = { value: BigInt(0), scale: 0 }
export const NRBD_ONE: NonRecursiveBigDecimal = { value: BigInt(1), scale: 0 }

export const toNonRecursiveBigDecimal = (bd: BD.BigDecimal): NonRecursiveBigDecimal => {
  const normalized = BD.normalize(bd)
  return { value: normalized.value, scale: normalized.scale }
}

export const fromNonRecursiveBigDecimal = (nrbd: NonRecursiveBigDecimal): BD.BigDecimal => {
  return BD.make(nrbd.value, nrbd.scale)
}

export const nrbdEquals = (a: NonRecursiveBigDecimal, b: NonRecursiveBigDecimal): boolean => {
  return BD.equals(fromNonRecursiveBigDecimal(a), fromNonRecursiveBigDecimal(b))
}

export const convertCentsToNonRecursiveBigDecimal = (cents: number): NonRecursiveBigDecimal => {
  return toNonRecursiveBigDecimal(convertCentsToBigDecimal(cents))
}

export const convertNonRecursiveBigDecimalToCents = (nrbd: NonRecursiveBigDecimal): number => {
  return convertBigDecimalToCents(fromNonRecursiveBigDecimal(nrbd))
}
