import { Schema } from 'effect'
import useSWR from 'swr'

import { type ReportConfigResponse, ReportConfigResponseSchema } from '@schemas/reports/reportConfig'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const REPORT_CONFIG_TAG_KEY = '#report-config'

type GetReportConfigParams = {
  businessId: string
}

const getReportConfig = get<ReportConfigResponse, GetReportConfigParams>(
  ({ businessId }) => `/v1/businesses/${businessId}/reports/config`,
)

const buildKey = createBuildKey<{ businessId: string }>([REPORT_CONFIG_TAG_KEY])

export function useReportConfig() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
    async ({ accessToken, apiUrl, businessId }) => {
      return getReportConfig(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
          },
        },
      )()
        .then(Schema.decodeUnknownPromise(ReportConfigResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new SWRQueryResult(swrResponse)
}
