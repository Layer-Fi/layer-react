import type { ReportingBasis } from '@internal-types/general'
import { type TaxPaymentRow, TaxPaymentsResponseSchema } from '@schemas/taxEstimates/payments'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_PAYMENTS_TAG_KEY = '#tax-payments'

type GetTaxPaymentsParams = {
  businessId: string
  year: number
  reportingBasis?: ReportingBasis
  fullYearProjection?: boolean
}

const getTaxPayments = getWithQuery<
  typeof TaxPaymentsResponseSchema.Encoded,
  GetTaxPaymentsParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/payments`,
  ({ year, reportingBasis, fullYearProjection }) => ({
    year,
    reporting_basis: reportingBasis,
    full_year_projection: fullYearProjection,
  }),
)

export const useTaxPayments = createQueryHook({
  tags: [TAX_PAYMENTS_TAG_KEY],
  request: getTaxPayments,
  schema: TaxPaymentsResponseSchema,
  select: ({ data }) => data,
})

export const useTaxPaymentsGlobalCacheActions = createResourceGlobalCacheActions<
  TaxPaymentRow[]
>(TAX_PAYMENTS_TAG_KEY)
