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

// `string & {}` accepts any string without collapsing the union, preserving autocomplete
// for the known enum members.
type AnyString = string & {}
type OpenEnum<T extends string> = T | AnyString

// Accepts values the backend may add before this client knows about them, preserving
// the raw value for display.
export const createOpenEnumSchema = <T extends Record<string, string>>(_enumObject: T) =>
  Schema.String as Schema.Schema<OpenEnum<T[keyof T]>>

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
