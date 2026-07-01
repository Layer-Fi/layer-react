import { Schema } from 'effect'
import useSWR from 'swr'

import { type MileageSummary, MileageSummarySchema } from '@schemas/mileage'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const MILEAGE_SUMMARY_TAG_KEY = '#mileage-summary'

const buildKey = createBuildKey<{ businessId: string }>([MILEAGE_SUMMARY_TAG_KEY])

const getMileageSummary = get<
  { data: MileageSummary },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/mileage/summary`)

export function useMileageSummary() {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
    ({ accessToken, apiUrl, businessId }) => getMileageSummary(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(MileageSummarySchema)(data)),
  )

  return new SWRQueryResult(response)
}

export const useMileageSummaryGlobalCacheActions = createResourceGlobalCacheActions<MileageSummary>(MILEAGE_SUMMARY_TAG_KEY)
