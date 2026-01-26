export function safeAssertUnreachable<T>({
  value,
  message,
  fallbackValue,
}: {
  value: never
  message?: string
  fallbackValue?: T
}) {
  console.error(
    message ?? 'Unexpected value encountered in exhaustive check:',
    value,
  )

  return fallbackValue
}

export function safeAssertUnreachableWithFallback<T>({
  value,
  message,
  fallbackValue,
}: {
  value: never
  message?: string
  fallbackValue: T
}): T {
  console.error(
    message ?? 'Unexpected value encountered in exhaustive check:',
    value,
  )

  return fallbackValue
}

export function unsafeAssertUnreachable({
  message,
}: {
  value: never
  message?: string
}): never {
  throw new Error(
    message ?? 'Unexpected value encountered in exhaustive check',
  )
}
