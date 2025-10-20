import { Schema } from 'effect/index'

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
        if (Object.values(enumObject).includes(input as T[keyof T])) {
          return input as T[keyof T]
        }
        return defaultValue
      },
      encode: input => input,
    },
  )
}
