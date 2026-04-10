import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxSummaryResponse, TaxSummaryResponseSchema } from '@schemas/taxEstimates/summary'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_SUMMARY_TAG_KEY = '#tax-summary'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type UseTaxSummaryOptions = {
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
  enabled?: boolean
}

type GetTaxSummaryParams = Omit<UseTaxSummaryOptions, 'enabled'> & {
  businessId: string
}

const getTaxSummary = get<TaxSummaryResponse, GetTaxSummaryParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/summary?${parameters}`
  },
)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  year,
  reportingBasis,
  fullYearProjection,
  enabled = true,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
  enabled?: boolean
}) {
  if (!enabled) {
    return
  }

  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      year,
      reportingBasis,
      fullYearProjection,
      tags: [TAX_SUMMARY_TAG_KEY],
    } as const
  }
}

export function useTaxSummary({ year, reportingBasis, fullYearProjection, enabled = true }: UseTaxSummaryOptions) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      year,
      reportingBasis,
      fullYearProjection,
      enabled,
    })),
    async ({ accessToken, apiUrl, businessId, year, reportingBasis, fullYearProjection }) => {
      return getTaxSummary(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            year,
            reportingBasis,
            fullYearProjection,
          },
        },
      )()
        .then(Schema.decodeUnknownPromise(TaxSummaryResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new SWRQueryResult(swrResponse)
}

export function useTaxSummaryGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadTaxSummary = useCallback(
    () => forceReload(({ tags }) => tags.includes(TAX_SUMMARY_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadTaxSummary }
}
