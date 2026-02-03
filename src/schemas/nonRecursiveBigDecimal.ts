import { BigDecimal as BD, Schema } from 'effect'

export type NonRecursiveBigDecimal = { value: bigint, scale: number }

export const NonRecursiveBigDecimalSchema = Schema.Struct({
  value: Schema.BigIntFromSelf,
  scale: Schema.Number,
})

export const NRBD_ZERO: NonRecursiveBigDecimal = { value: 0n, scale: 0 }
export const NRBD_ONE: NonRecursiveBigDecimal = { value: 1n, scale: 0 }

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
