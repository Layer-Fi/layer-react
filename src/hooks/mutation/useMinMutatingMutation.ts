import { useCallback, useState } from 'react'
import type { Key } from 'swr'
import type { SWRMutationResponse } from 'swr/mutation'

import { sleep } from '@utils/helpers'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'

const DEFAULT_MIN_LOADING_MS = 500

type UseMinLoadingMutationOptions<TData, TError, TMutationKey extends Key, TExtraArg> = {
  swrMutationResponse: SWRMutationResponse<TData, TError, TMutationKey, TExtraArg>
  minMutatingMs?: number
}

/**
 * Motivation:
 * - Some mutations are so fast that relying on the `isMutating` state can cause flickering.
 *
 * Any SWR mutation response wrapped in this hook will appear to be mutating for a minimum
 * duration.
 */
export function useMinMutatingMutation<TData, TError, TMutationKey extends Key, TExtraArg>({
  swrMutationResponse,
  minMutatingMs,
}: UseMinLoadingMutationOptions<TData, TError, TMutationKey, TExtraArg>) {
  const [internalIsMutatingCount, setInternalIsMutatingCount] = useState(0)

  const { trigger: originalTrigger } = swrMutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      setInternalIsMutatingCount(internalIsMutatingCount => internalIsMutatingCount + 1)

      const [originalTriggerResult] = await Promise.allSettled([
        // @ts-expect-error | It is challenging to properly infer the type of the trigger, as it is derived from TExtraArg
        originalTrigger(...triggerParameters) as Promise<TData>,

        sleep(minMutatingMs ?? DEFAULT_MIN_LOADING_MS),
      ])

      setInternalIsMutatingCount(internalIsMutatingCount => internalIsMutatingCount - 1)

      switch (originalTriggerResult.status) {
        case 'fulfilled': {
          return originalTriggerResult.value
        }
        case 'rejected': {
          throw originalTriggerResult.reason
        }
        default: {
          return unsafeAssertUnreachable({
            value: originalTriggerResult,
            message: 'Unexpected promise result in `useMinLoadingMutation`',
          })
        }
      }
    },
    [
      minMutatingMs,
      originalTrigger,
    ],
  )

  return new Proxy(swrMutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      if (prop === 'isMutating') {
        return target.isMutating || internalIsMutatingCount > 0
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
