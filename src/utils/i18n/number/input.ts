export type NumberInput = number | string | null | undefined

export const toNumber = (value: NumberInput): number | undefined => {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return undefined
}

export const safeDivideByOneHundred = (value: NumberInput): number | undefined => {
  const parsed = toNumber(value)
  if (parsed === undefined || !Number.isFinite(parsed)) {
    return undefined
  }

  return parsed / 100
}
