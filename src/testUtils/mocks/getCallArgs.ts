/**
 * The nth call's arguments as a tuple, so destructuring them stays typed. Throws when the mock never
 * took that call, which reads better than the `undefined` an index access would hand back.
 *
 * Takes the call log structurally rather than a `Mock<T>`, so the argument tuple is inferred
 * straight off `calls` instead of through vitest's conditional parameter type.
 */
export function getCallArgs<TArgs extends unknown[]>(
  mock: { mock: { calls: TArgs[] } },
  index = 0,
): TArgs {
  const args = mock.mock.calls[index]

  if (!args) {
    throw new Error(
      `getCallArgs: no call at index ${index} — the mock was called ${mock.mock.calls.length} time(s)`,
    )
  }

  return args
}
