import { Schema } from 'effect'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/dist/mutation'
import { CALL_BOOKINGS_TAG_KEY } from './useCallBookings'

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
      { arg: body }: { arg: CreateCallBookingBody },
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
