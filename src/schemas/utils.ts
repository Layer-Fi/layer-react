import { Schema } from 'effect/index'

export const UnwrappedDataResponseSchema = <A, I, R>(
  dataSchema: Schema.Schema<A, I, R>,
) =>
  Schema.transform(
    Schema.Struct({ data: dataSchema }),
    Schema.typeSchema(dataSchema),
    {
      strict: true,
      decode: ({ data }) => data,
      encode: data => ({ data }),
    },
  )

// Helper function to create enum schemas that accept values the backend may add
// before this client knows about them, preserving the raw value for display.
export const createOpenEnumSchema = <T extends Record<string, string>>(enumObject: T) =>
  Schema.Union(
    Schema.Enums(enumObject),
    Schema.String as Schema.Schema<string & NonNullable<unknown>, string>,
  )

// Helper function to create transformed enum schemas with safe defaults.
export const createTransformedEnumSchema = <T extends Record<string, string>>(
  enumSchema: Schema.Schema<T[keyof T], T[keyof T]>,
  enumObject: T,
  defaultValue: T[keyof T],
) => {
  return Schema.transform(
    Schema.NonEmptyTrimmedString,
    Schema.typeSchema(enumSchema),
    {
      strict: false,
      decode: (input) => {
        if (Object.values(enumObject).includes(input)) {
          return input
        }
        return defaultValue
      },
      encode: input => input,
    },
  )
}
