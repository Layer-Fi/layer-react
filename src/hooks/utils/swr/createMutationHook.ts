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

/*
 * Business-scoped `useSWRMutation` hook factory. The trigger argument is the request body
 * by default; `argToBody`/`argToParams` split it when parts belong in the URL instead.
 * `keyParams` names the request params that scope the SWR key (and mutation state) to an
 * entity; the returned hook takes them alongside `isEnabled` and per-call `swrOptions`.
 */
export function createMutationHook<
  TEncoded,
  TBody extends Record<string, unknown> = Record<string, unknown>,
  TParams extends BusinessScopedParams = BusinessScopedParams,
  TDecoded = TEncoded,
  TArg = TBody,
  const TKeyKeys extends ReadonlyArray<Exclude<keyof TParams, 'businessId'>> = readonly [],
  TData = TDecoded,
>(config: {
  tags: ReadonlyArray<string>
  request: MutationRequest<TEncoded, TBody, TParams>
  keyParams?: TKeyKeys
  argToParams?: (arg: TArg, keyParams: BusinessScopedParams & Pick<TParams, TKeyKeys[number]>) => Partial<Omit<TParams, 'businessId'>>
  argToBody?: (arg: TArg, keyParams: BusinessScopedParams & Pick<TParams, TKeyKeys[number]>) => TBody | undefined
  schema?: Schema.Schema<TDecoded, TEncoded>
  select?: (decoded: TDecoded) => TData
  swrOptions?: MutationSWROptions<TData>
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
