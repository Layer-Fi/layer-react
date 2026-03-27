import { Schema } from 'effect'
import useSWR from 'swr'

import { TaxEstimatesBannerResponseSchema } from '@schemas/taxEstimates/banner'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { getQuarterDueDateString, TAX_BANNER_REVIEW_AMOUNT, TAX_BANNER_REVIEW_COUNT } from '@hooks/api/businesses/[business-id]/tax-estimates/mockUtils'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_ESTIMATES_BANNER_TAG_KEY = '#tax-estimates-banner'

type UseTaxEstimatesBannerOptions = {
  year: number
}

const buildTaxEstimatesBannerMockResponse = ({ year }: UseTaxEstimatesBannerOptions) => ({
  data: {
    year,
    total_uncategorized_count: TAX_BANNER_REVIEW_COUNT,
    total_uncategorized_sum: TAX_BANNER_REVIEW_AMOUNT,
    quarters: [
      {
        quarter: 1,
        due_date: getQuarterDueDateString(year, 1),
        is_past_due: true,
        amount_owed: 684949,
        amount_paid: 0,
        balance: 684949,
        uncategorized_count: 0,
        uncategorized_sum: 0,
      },
      {
        quarter: 2,
        due_date: getQuarterDueDateString(year, 2),
        is_past_due: false,
        amount_owed: 120000,
        amount_paid: 0,
        balance: 120000,
        uncategorized_count: 0,
        uncategorized_sum: 0,
      },
      {
        quarter: 3,
        due_date: getQuarterDueDateString(year, 3),
        is_past_due: false,
        amount_owed: 484949,
        amount_paid: 0,
        balance: 484949,
        uncategorized_count: TAX_BANNER_REVIEW_COUNT,
        uncategorized_sum: TAX_BANNER_REVIEW_AMOUNT,
      },
      {
        quarter: 4,
        due_date: getQuarterDueDateString(year, 4),
        is_past_due: false,
        amount_owed: 0,
        amount_paid: 0,
        balance: 0,
        uncategorized_count: 0,
        uncategorized_sum: 0,
      },
    ],
  },
})

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  year,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  year: number
}) {
  return {
    accessToken,
    apiUrl,
    businessId,
    year,
    tags: [TAX_ESTIMATES_BANNER_TAG_KEY],
  } as const
}

export function useTaxEstimatesBanner({ year }: UseTaxEstimatesBannerOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const fallbackData = Schema.decodeUnknownSync(TaxEstimatesBannerResponseSchema)(
    buildTaxEstimatesBannerMockResponse({ year }),
  ).data

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      businessId,
      year,
    }),
    async ({ year }) => {
      return Promise.resolve(buildTaxEstimatesBannerMockResponse({ year }))
        .then(Schema.decodeUnknownPromise(TaxEstimatesBannerResponseSchema))
        .then(({ data }) => data)
    },
    { fallbackData },
  )

  return new SWRQueryResult(swrResponse)
}
