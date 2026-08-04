export function isStringArray(input: unknown): input is ReadonlyArray<string> {
  return (
    Array.isArray(input)
    && (input.length === 0 || input.every(item => typeof item === 'string'))
  )
}
