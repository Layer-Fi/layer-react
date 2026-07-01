import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import type {
  CallBooking,
  CreateCallBookingBody,
  ListCallBookingsResponse,
} from '@schemas/callBooking'
import {
  CallBookingPurpose,
  CallBookingState,
  CallBookingType,
  ListCallBookingsResponseSchema,
} from '@schemas/callBooking'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type { CallBooking, CreateCallBookingBody }
export { CallBookingPurpose, CallBookingState, CallBookingType }

type ListCallBookingsParams = {
  businessId: string
  cursor?: string
  limit?: number
}

const listCallBookings = get<
  Record<string, unknown>,
  ListCallBookingsParams
>(({ businessId, cursor, limit }) => {
  const parameters = toDefinedSearchParameters({
    cursor,
    limit,
    status: 'SCHEDULED',
  })

  return `/v1/businesses/${businessId}/call-bookings?${parameters}`
})

export const CALL_BOOKINGS_TAG_KEY = '#call-bookings'

const keyLoader = createInfiniteKeyLoader<
  { businessId: string, limit?: number },
  ListCallBookingsResponse
>([CALL_BOOKINGS_TAG_KEY])

export function useCallBookings({ limit }: { limit?: number } = {}) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCallBookingsResponse | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...auth,
        businessId,
        limit,
      },
    )),
    ({ accessToken, apiUrl, businessId, cursor, limit }) => listCallBookings(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          cursor,
          limit,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListCallBookingsResponseSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
}

export const useCallBookingsGlobalCacheActions = createInfiniteQueryGlobalCacheActions<CallBooking>(CALL_BOOKINGS_TAG_KEY)
