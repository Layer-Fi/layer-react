import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { SWRMutationResult } from '@internal-types/swr/SWRResponseTypes'
import type { MutationRequest } from '@utils/api/getAsMutation'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useLatestRef } from '@hooks/utils/react/useLatestRef'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type BusinessScopedParams = { businessId: string }

type MutationSWROptions<TData> = {
  revalidate?: boolean
  throwOnError?: boolean
  onSuccess?: (data: TData) => void
  onError?: (error: unknown) => void
}

export function createMutationHook<
  TEncoded,
  TBody extends Record<string, unknown> = Record<string, unknown>,
  TParams extends BusinessScopedParams = BusinessScopedParams,
  TDecoded = TEncoded,
  TArg = TBody,
  const TKeyParamNames extends ReadonlyArray<Exclude<keyof TParams, 'businessId'>> = readonly [],
  TData = TDecoded,
>(config: {
  /** Marks this mutation's key so global cache actions (invalidate, patch, force-reload) can find it. */
  tags: ReadonlyArray<string>
  /** The HTTP call to make when triggered. Receives the assembled params and body, plus the injected auth and `businessId`. */
  request: MutationRequest<TEncoded, TBody, TParams>
  /** Params that pin the mutation to one entity (e.g. an id). Callers pass these when creating the hook, not when triggering. */
  keyParams?: TKeyParamNames
  /** Pulls URL params out of the trigger argument, for when it mixes routing info (e.g. an id) with payload. */
  argToParams?: (arg: TArg, keyParamValues: BusinessScopedParams & Pick<TParams, TKeyParamNames[number]>) => Partial<Omit<TParams, 'businessId'>>
  /**
   * Builds the body from the trigger argument; without it, the whole argument is the body.
   * `argToBody: (_arg: undefined) => undefined` makes `trigger()` take no argument and send no body.
   */
  argToBody?: (arg: TArg, keyParamValues: BusinessScopedParams & Pick<TParams, TKeyParamNames[number]>) => TBody | undefined
  /** Decodes the raw response. Leave out for endpoints without a schema — the response is used as-is. */
  schema?: Schema.Schema<TDecoded, TEncoded>
  /** Reshapes the decoded response into what `trigger` resolves with (and what `onSuccess` receives). */
  select?: (decoded: TDecoded) => TData
  /** Default mutation behavior for every caller. A caller's own `swrOptions` win, key by key. */
  swrOptions?: MutationSWROptions<TData>
  /** Whether the locale is part of the mutation key, mirroring the query keys it relates to. True by default. */
  isLocalized?: boolean
  /**
   * Hook that returns a callback run after each successful trigger. Being a hook, it can read
   * cache-action hooks and context; it also receives the hook's key params (e.g. a pinned id).
   * Its returned promise (if any) is awaited before `trigger` resolves — use `void` inside for
   * fire-and-forget invalidation. The returned callback does not need to be memoized; `trigger`
   * stays stable and always invokes the latest one.
   */
  useOnTriggerSuccess?: (keyParamValues: BusinessScopedParams & Pick<TParams, TKeyParamNames[number]>) => (data: TData, arg: TArg) => void | Promise<void>
}) {
  const { tags, request, argToParams, argToBody, schema, select, swrOptions, isLocalized = true, useOnTriggerSuccess } = config

  const useOnTriggerSuccessHook = useOnTriggerSuccess
    ?? ((_keyParamValues: BusinessScopedParams & Pick<TParams, TKeyParamNames[number]>) => undefined)

  type KeyParamValues = BusinessScopedParams & Pick<TParams, TKeyParamNames[number]>

  const buildKey = createBuildKey<KeyParamValues>(tags)

  type UseMutationOptions = Pick<TParams, TKeyParamNames[number]> & {
    swrOptions?: MutationSWROptions<TData>
  }

  return function useMutation(options?: UseMutationOptions) {
    const { withLocale, businessId, auth } = useBuildKeyInputs()

    const { swrOptions: callSwrOptions, ...keyInputs } = options ?? ({} as UseMutationOptions)

    const rawMutationResponse = useSWRMutation(
      () => {
        const key = buildKey({ ...auth, businessId, ...keyInputs } as Parameters<typeof buildKey>[0])
        return isLocalized ? withLocale(key) : key
      },
      (
        key: { accessToken: string, apiUrl: string, tags: ReadonlyArray<string> } & KeyParamValues,
        { arg }: { arg: TArg },
      ): Promise<TData> => {
        const { accessToken, apiUrl, tags: _tags, ...rest } = key
        const keyParamValues = rest as unknown as KeyParamValues

        const response = request(apiUrl, accessToken, {
          params: {
            ...keyParamValues,
            ...(argToParams ? argToParams(arg, keyParamValues) : undefined),
          } as TParams,
          body: argToBody ? argToBody(arg, keyParamValues) : arg as unknown as TBody,
        })

        const decoded = schema
          ? response.then(Schema.decodeUnknownPromise(schema))
          : response as Promise<unknown> as Promise<TDecoded>

        return select ? decoded.then(select) : decoded as Promise<unknown> as Promise<TData>
      },
      {
        revalidate: false,
        ...swrOptions,
        ...callSwrOptions,
      },
    )

    const mutationResult = new SWRMutationResult(rawMutationResponse)

    const onTriggerSuccess = useOnTriggerSuccessHook({ businessId, ...keyInputs } as KeyParamValues)

    const onTriggerSuccessRef = useLatestRef(onTriggerSuccess)

    const originalTrigger = mutationResult.trigger

    const stableProxiedTrigger = useCallback(
      async (...triggerParameters: Parameters<typeof originalTrigger>) => {
        // The trigger's with/without-args union only resolves once TArg is concrete, so it is
        // not callable here without narrowing to a single signature.
        const trigger = originalTrigger as (...args: typeof triggerParameters) => Promise<TData>

        const triggerResult = await trigger(...triggerParameters)

        await onTriggerSuccessRef.current?.(triggerResult, triggerParameters[0] as TArg)

        return triggerResult
      },
      [originalTrigger, onTriggerSuccessRef],
    )

    return useOnTriggerSuccess
      ? withStableTrigger(
        mutationResult,
        stableProxiedTrigger as unknown as (...args: Parameters<typeof originalTrigger>) => ReturnType<typeof originalTrigger>,
      )
      : mutationResult
  }
}
