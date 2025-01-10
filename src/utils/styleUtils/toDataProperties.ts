type AllowedDataValue = string | number | true

type DataPrefix<T extends Lowercase<string>> = `data-${T}`

type DataProperties<T> = {
  [K in keyof T as DataPrefix<
    Extract<K, Lowercase<string>>
  >]: T[K] extends AllowedDataValue ? T[K] : never
}

export function toDataProperties<
  TKeys extends Lowercase<string>,
  TValues,
>(input: Record<TKeys, TValues>) {
  const unsafeProperties = Object.fromEntries(
    Object.entries(input)
      .map(([key, value]) => {
        if (
          typeof value !== 'string'
          && typeof value !== 'number'
          && value !== true
        ) {
          return null
        }

        return [`data-${key as Lowercase<string>}`, value] as const
      })
      .filter((entry): entry is Exclude<typeof entry, null> => entry !== null),
  )

  /*
   * The `fromEntries` signature does not preserve the type of the keys, so we
   * need an explicit cast.
   */
  return unsafeProperties as DataProperties<Record<TKeys, Extract<TValues, AllowedDataValue>>>
}
