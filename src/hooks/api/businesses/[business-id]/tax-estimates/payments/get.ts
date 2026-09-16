import { type TaxPaymentRow, TaxPaymentsResponseSchema } from '@schemas/features/taxEstimates/payments'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@api/businesses/[business-id]/tax-estimates/taxEstimatesParams'

const TAX_PAYMENTS_TAG_KEY = '#tax-payments'

const getTaxPayments = getWithQuery<
  typeof TaxPaymentsResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/payments`,
  toTaxEstimatesQuery,
)

export const useGetTaxPayments = createQueryHook({
  tags: [TAX_PAYMENTS_TAG_KEY],
  request: getTaxPayments,
  schema: TaxPaymentsResponseSchema,
  select: ({ data }) => data,
})

export const useTaxPaymentsGlobalCacheActions = createResourceGlobalCacheActions<
  TaxPaymentRow[]
>(TAX_PAYMENTS_TAG_KEY)
