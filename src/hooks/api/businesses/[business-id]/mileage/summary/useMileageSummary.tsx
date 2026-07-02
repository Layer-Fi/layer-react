import { Schema } from 'effect'
import useSWR from 'swr'

import { type MileageSummary, MileageSummarySchema } from '@schemas/mileage'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const MILEAGE_SUMMARY_TAG_KEY = '#mileage-summary'

const buildKey = createBuildKey<{ businessId: string }>([MILEAGE_SUMMARY_TAG_KEY])

const getMileageSummary = get<
  { data: MileageSummary },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/mileage/summary`)

export function useMileageSummary() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
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
