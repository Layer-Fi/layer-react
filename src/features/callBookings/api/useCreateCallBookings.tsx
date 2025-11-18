import { useCallback } from 'react'
import { Schema } from 'effect'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { CallBookingItemResponseSchema, type CreateCallBookingBodyEncoded } from '@schemas/callBookings'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { CALL_BOOKINGS_TAG_KEY } from '@features/callBookings/api/useCallBookings'

function buildCreateKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [`${CALL_BOOKINGS_TAG_KEY}:create`],
    } as const
  }
}

const createCallBooking = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/call-bookings`)

export function useCreateCallBooking() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildCreateKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: CreateCallBookingBodyEncoded },
    ) => createCallBooking(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    )
      .then(Schema.decodeUnknownPromise(CallBookingItemResponseSchema))
      .then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        tags => tags.includes(CALL_BOOKINGS_TAG_KEY),
      ))

      return triggerResult
    },
    [
      originalTrigger,
      mutate,
    ],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
