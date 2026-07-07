import { type TaxPaymentRow, TaxPaymentsResponseSchema } from '@schemas/taxEstimates/payments'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@hooks/api/businesses/[business-id]/tax-estimates/taxEstimatesParams'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

const TAX_PAYMENTS_TAG_KEY = '#tax-payments'

const getTaxPayments = getWithQuery<
  typeof TaxPaymentsResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/payments`,
  toTaxEstimatesQuery,
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
