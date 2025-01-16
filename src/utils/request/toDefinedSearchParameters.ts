function toSnakeCase(input: string) {
  const segments = input
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? []

  return segments
    .map(segment => segment.toLowerCase())
    .join('_')
}

type ParameterValues = Date | string | number | boolean

export function toDefinedSearchParameters(
  input: Record<string, ParameterValues | null | undefined>,
) {
  const definedParameters = Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => {
        if (value === null || value === undefined) {
          return null
        }

        if (value instanceof Date) {
          return [key, value.toISOString()] as const
        }

        if (typeof value !== 'string') {
          return [key, String(value)] as const
        }

        return [key, value] as const
      })
      .filter((entry): entry is Exclude<typeof entry, null> => entry !== null)
      .map(([key, value]) => [toSnakeCase(key), value]),
  )

  return new URLSearchParams(definedParameters)
}
