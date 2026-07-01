/**
 * Wraps an SWR mutation response in a proxy that swaps in a stable `trigger` (typically a
 * useCallback-wrapped trigger with side effects) while delegating every other property to
 * the live response, so `isMutating`/`data`/`error` stay current across renders.
 */
export function withStableTrigger<Response extends { trigger: (...args: never[]) => unknown }>(
  swrMutationResponse: Response,
  trigger: (...args: Parameters<Response['trigger']>) => ReturnType<Response['trigger']>,
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
