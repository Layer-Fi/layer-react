export function safeAssertUnreachable(value: never, message?: string): never {
  console.error(
    message ?? 'Unexpected value encountered in exhaustive check:',
    value,
  )

  return undefined as never
}
