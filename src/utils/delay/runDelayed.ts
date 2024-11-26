const DEFAULT_DELAY_MS = 50

export function runDelayedSync<T>(
  block: () => T,
  delayMs = DEFAULT_DELAY_MS
): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(block()), delayMs)
  )
}
