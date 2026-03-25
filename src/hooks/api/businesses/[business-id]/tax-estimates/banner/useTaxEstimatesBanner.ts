import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { TaxEstimatesBannerResponseSchema } from '@schemas/taxEstimates/banner'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_ESTIMATES_BANNER_TAG_KEY = '#tax-estimates-banner'
const TAX_BANNER_REVIEW_COUNT = 16
const TAX_BANNER_REVIEW_AMOUNT = 210000

type UseTaxEstimatesBannerOptions = {
  year: number
}

const getQuarterDueDate = (year: number, quarter: number) => {
  switch (quarter) {
    case 1:
      return new Date(year, 3, 15)
    case 2:
      return new Date(year, 6, 15)
    case 3:
      return new Date(year, 9, 15)
    case 4:
      return new Date(year + 1, 0, 15)
    default:
      return new Date(year, 0, 15)
  }
}

const getQuarterDueDateString = (year: number, quarter: number) => {
  const dueDate = getQuarterDueDate(year, quarter)
  const month = `${dueDate.getMonth() + 1}`.padStart(2, '0')
  const day = `${dueDate.getDate()}`.padStart(2, '0')

  return `${dueDate.getFullYear()}-${month}-${day}`
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

export function useTaxEstimatesBannerGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadTaxEstimatesBanner = useCallback(
    () => forceReload(({ tags }) => tags.includes(TAX_ESTIMATES_BANNER_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadTaxEstimatesBanner }
}
