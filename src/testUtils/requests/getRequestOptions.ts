import type { Mock } from 'vitest'

/** Shorthand for `request.mock.calls[index][2]` — the options (`{ params, body }`) of the nth call. */
export function getRequestOptions<T extends (...args: never[]) => unknown>(
  request: Mock<T>,
  index = 0,
): Parameters<T>[2] {
  return request.mock.calls[index][2]
}
