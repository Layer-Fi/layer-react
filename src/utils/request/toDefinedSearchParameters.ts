import { formatISO } from 'date-fns'
import { Schema } from 'effect'

import { isStringArray } from '@utils/array/isStringArray'

function toSnakeCase(input: string) {
  const segments = input
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? []

  return segments
    .map(segment => segment.toLowerCase())
    .join('_')
}

// eslint-disable-next-line unused-imports/no-unused-vars
const ParameterValuesSchema = Schema.Union(
  Schema.Date,
  Schema.String,
  Schema.Array(Schema.String),
  Schema.Number,
  Schema.Boolean,
)
export type ParameterValues = typeof ParameterValuesSchema.Type

export function toDefinedSearchParameters(
  input: Record<string, ParameterValues | null | undefined>,
) {
  const definedParameterPairs = Object.entries(input)
    .flatMap(([key, value]): [string, string][] => {
      if (value === null || value === undefined) {
        return []
      }

      if (value instanceof Date) {
        return [[key, formatISO(value, { representation: 'date' })]]
      }

      if (isStringArray(value)) {
        return value.map((item): [string, string] => [key, item])
      }

      if (typeof value !== 'string') {
        return [[key, String(value)]]
      }

      return [[key, value]]
    })
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => [toSnakeCase(key), value])

  return new URLSearchParams(definedParameterPairs)
}
