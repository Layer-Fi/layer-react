import { isStringArray } from '../array/isStringArray'

function toSnakeCase(input: string) {
  const segments = input
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? []

  return segments
    .map(segment => segment.toLowerCase())
    .join('_')
}

type ParameterValues = Date | string | ReadonlyArray<string> | number | boolean

export function toDefinedSearchParameters(
  input: Record<string, ParameterValues | null | undefined>,
) {
  const definedParameterPairs = Object.entries(input)
    .flatMap(([key, value]) => {
      if (value === null || value === undefined) {
        return []
      }

      if (value instanceof Date) {
        return [[key, value.toISOString()]]
      }

      if (isStringArray(value)) {
        return value.map(item => [key, item])
      }

      if (typeof value !== 'string') {
        return [[key, String(value)]]
      }

      return [[key, value]]
    })
    .filter((entry): entry is Exclude<typeof entry, null> => entry !== null)
    .map(([key, value]) => [toSnakeCase(key), value])

  return new URLSearchParams(definedParameterPairs)
}
