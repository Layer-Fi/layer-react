import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxDetails, type TaxDetailsResponse, TaxDetailsResponseSchema } from '@schemas/taxEstimates/details'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_DETAILS_TAG_KEY = '#tax-details'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type UseTaxDetailsOptions = {
  year: number
  reportingBasis?: ReportingBasis
  fullYearProjection?: boolean
}

type GetTaxDetailsParams = UseTaxDetailsOptions & {
  businessId: string
}

const getTaxDetails = get<TaxDetailsResponse, GetTaxDetailsParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/details?${parameters}`
  },
)

const buildKey = createBuildKey<{
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}>([TAX_DETAILS_TAG_KEY])

export function useTaxDetails({ year, reportingBasis, fullYearProjection }: UseTaxDetailsOptions) {
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
    })),
    async ({ accessToken, apiUrl, businessId, year, reportingBasis, fullYearProjection }) => {
      return getTaxDetails(
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
        .then(Schema.decodeUnknownPromise(TaxDetailsResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new SWRQueryResult(swrResponse)
}

export const useTaxDetailsGlobalCacheActions = createResourceGlobalCacheActions<TaxDetails>(TAX_DETAILS_TAG_KEY)
