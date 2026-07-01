/**
 * Wraps an SWR mutation response in a proxy that swaps in a stable `trigger` (typically a
 * useCallback-wrapped trigger with side effects) while delegating every other property to
 * the live response, so `isMutating`/`data`/`error` stay current across renders.
 */
export function withStableTrigger<Response extends { trigger: unknown }>(
  swrMutationResponse: Response,
  trigger: (...args: never[]) => unknown,
): Response {
  return new Proxy(swrMutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return trigger
      }

      return Reflect.get(target, prop)
    },
  })
}
