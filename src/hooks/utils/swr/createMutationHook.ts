import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type BusinessScopedParams = { businessId: string }

type MutationRequest<TReturn, TBody, TParams> = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: TParams, body?: TBody },
) => Promise<TReturn>

/*
 * Business-scoped `useSWRMutation` hook factory. The trigger argument is the request body
 * by default; `argToBody`/`argToParams` split it when parts belong in the URL instead.
 */
export function createMutationHook<
  TEncoded,
  TBody extends Record<string, unknown> = Record<string, unknown>,
  TParams extends BusinessScopedParams = BusinessScopedParams,
  TDecoded = TEncoded,
  TArg = TBody,
>(config: {
  tags: ReadonlyArray<string>
  request: MutationRequest<TEncoded, TBody, TParams>
  argToParams?: (arg: TArg) => Omit<TParams, 'businessId'>
  argToBody?: (arg: TArg) => TBody | undefined
  schema?: Schema.Schema<TDecoded, TEncoded>
  swrOptions?: { revalidate?: boolean, throwOnError?: boolean }
  isLocalized?: boolean
}) {
  const { tags, request, argToParams, argToBody, schema, swrOptions, isLocalized = true } = config

  const buildKey = createBuildKey<BusinessScopedParams>(tags)

  return function useMutation() {
    const { withLocale, businessId, auth } = useBuildKeyInputs()

    const rawMutationResponse = useSWRMutation(
      () => {
        const key = buildKey({ ...auth, businessId })
        return isLocalized ? withLocale(key) : key
      },
      (
        { accessToken, apiUrl, businessId }: { accessToken: string, apiUrl: string, businessId: string },
        { arg }: { arg: TArg },
      ): Promise<TDecoded> => {
        const response = request(apiUrl, accessToken, {
          params: {
            businessId,
            ...(argToParams ? argToParams(arg) : undefined),
          } as TParams,
          body: argToBody ? argToBody(arg) : arg as unknown as TBody,
        })

        if (schema) {
          return response.then(Schema.decodeUnknownPromise(schema))
        }

        return response as Promise<unknown> as Promise<TDecoded>
      },
      {
        revalidate: false,
        ...swrOptions,
      },
    )

    return new SWRMutationResult(rawMutationResponse)
  }
}
