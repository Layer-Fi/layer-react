import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import type { MutationRequest } from '@utils/api/getAsMutation'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
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
  const TKeyKeys extends ReadonlyArray<Exclude<keyof TParams, 'businessId'>> = readonly [],
  TData = TDecoded,
>(config: {
  /** Marks this mutation's key so global cache actions (invalidate, patch, force-reload) can find it. */
  tags: ReadonlyArray<string>
  /** The HTTP call to make when triggered. Receives the assembled params and body, plus the injected auth and `businessId`. */
  request: MutationRequest<TEncoded, TBody, TParams>
  /** Params that pin the mutation to one entity (e.g. an id). Callers pass these when creating the hook, not when triggering. */
  keyParams?: TKeyKeys
  /** Pulls URL params out of the trigger argument, for when it mixes routing info (e.g. an id) with payload. */
  argToParams?: (arg: TArg, keyParams: BusinessScopedParams & Pick<TParams, TKeyKeys[number]>) => Partial<Omit<TParams, 'businessId'>>
  /**
   * Builds the body from the trigger argument; without it, the whole argument is the body.
   * `argToBody: (_arg: undefined) => undefined` makes `trigger()` take no argument and send no body.
   */
  argToBody?: (arg: TArg, keyParams: BusinessScopedParams & Pick<TParams, TKeyKeys[number]>) => TBody | undefined
  /** Decodes the raw response. Leave out for endpoints without a schema — the response is used as-is. */
  schema?: Schema.Schema<TDecoded, TEncoded>
  /** Reshapes the decoded response into what `trigger` resolves with (and what `onSuccess` receives). */
  select?: (decoded: TDecoded) => TData
  /** Default mutation behavior for every caller. A caller's own `swrOptions` win, key by key. */
  swrOptions?: MutationSWROptions<TData>
  /** Whether the locale is part of the mutation key, mirroring the query keys it relates to. True by default. */
  isLocalized?: boolean
}) {
  const { tags, request, argToParams, argToBody, schema, select, swrOptions, isLocalized = true } = config

  type KeyParams = BusinessScopedParams & Pick<TParams, TKeyKeys[number]>

  const buildKey = createBuildKey<KeyParams>(tags)

  type UseMutationOptions = Pick<TParams, TKeyKeys[number]> & {
    isEnabled?: boolean
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
        key: { accessToken: string, apiUrl: string } & KeyParams,
        { arg }: { arg: TArg },
      ): Promise<TData> => {
        const { accessToken, apiUrl, ...rest } = key
        const keyParams = rest as unknown as KeyParams

        const response = request(apiUrl, accessToken, {
          params: {
            ...keyParams,
            ...(argToParams ? argToParams(arg, keyParams) : undefined),
          } as TParams,
          body: argToBody ? argToBody(arg, keyParams) : arg as unknown as TBody,
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

    return new SWRMutationResult(rawMutationResponse)
  }
}
