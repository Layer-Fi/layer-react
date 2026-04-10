import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxEstimatesBannerResponse, TaxEstimatesBannerResponseSchema } from '@schemas/taxEstimates/banner'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_ESTIMATES_BANNER_TAG_KEY = '#tax-estimates-banner'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type UseTaxEstimatesBannerOptions = {
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
  enabled?: boolean
}

type GetTaxEstimatesBannerParams = Omit<UseTaxEstimatesBannerOptions, 'enabled'> & {
  businessId: string
}

const getTaxEstimatesBanner = get<TaxEstimatesBannerResponse, GetTaxEstimatesBannerParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({
      year,
      reporting_basis: reportingBasis,
      full_year_projection: fullYearProjection,
    })
    return `/v1/businesses/${businessId}/tax-estimates/banner?${parameters}`
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
      tags: [TAX_ESTIMATES_BANNER_TAG_KEY],
    } as const
  }
}

export function useTaxEstimatesBanner({ year, reportingBasis, fullYearProjection, enabled = true }: UseTaxEstimatesBannerOptions) {
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
      return getTaxEstimatesBanner(
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
        .then(Schema.decodeUnknownPromise(TaxEstimatesBannerResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new SWRQueryResult(swrResponse)
}

export function useTaxEstimatesBannerGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadTaxEstimatesBanner = useCallback(
    () => forceReload(({ tags }) => tags.includes(TAX_ESTIMATES_BANNER_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadTaxEstimatesBanner }
}
