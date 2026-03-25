import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type TaxOverviewData, type TaxOverviewDeadlineStatus, TaxOverviewResponseSchema } from '@schemas/taxEstimates/overview'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_OVERVIEW_TAG_KEY = '#tax-overview'
const TAX_BANNER_REVIEW_COUNT = 16
const TAX_BANNER_REVIEW_AMOUNT = 210000

type UseTaxOverviewOptions = {
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

const formatDateString = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const buildTaxOverviewMockResponse = ({ year }: UseTaxOverviewOptions) => {
  const bannerReview: TaxOverviewData['bannerReview'] = {
    type: 'UNCATEGORIZED_TRANSACTIONS',
    count: TAX_BANNER_REVIEW_COUNT,
    amount: TAX_BANNER_REVIEW_AMOUNT,
  }

  const nextTaxStatus = { kind: 'due' } satisfies TaxOverviewDeadlineStatus

  const estimatedTaxCategories: TaxOverviewData['estimatedTaxCategories'] = [
    { key: 'federal', label: 'Federal', amount: 85510 },
    { key: 'state', label: 'State', amount: 40234 },
    { key: 'selfEmployment', label: 'Self-employment', amount: 247380 },
  ]

  const estimatedTaxesTotal = estimatedTaxCategories.reduce((sum, category) => sum + category.amount, 0)

  return {
    data: {
      annualDeadline: {
        id: 'annual-income-taxes',
        title: 'Annual income taxes',
        dueAt: formatDateString(new Date(year + 1, 3, 15)),
        amount: 0,
        description: 'Estimated tax',
      },
      bannerReview,
      deductionsTotal: 1741677,
      estimatedTaxCategories,
      estimatedTaxesTotal,
      incomeTotal: 2884949,
      nextTax: {
        quarter: 2,
        amount: 120000,
        dueAt: formatDateString(getQuarterDueDate(year, 2)),
        status: nextTaxStatus,
      },
      paymentDeadlines: [
        {
          id: 'quarter-1',
          title: 'Q1 taxes',
          dueAt: formatDateString(getQuarterDueDate(year, 1)),
          amount: 684949,
          description: 'Estimated tax',
          status: { kind: 'pastDue' },
        },
        {
          id: 'quarter-2',
          title: 'Q2 taxes',
          dueAt: formatDateString(getQuarterDueDate(year, 2)),
          amount: 484949,
          description: 'Estimated tax',
          status: nextTaxStatus,
        },
        {
          id: 'quarter-3',
          title: 'Q3 taxes',
          dueAt: formatDateString(getQuarterDueDate(year, 3)),
          amount: 484949,
          description: 'Estimated tax',
          status: { kind: 'categorizationIncomplete' },
          reviewAction: { payload: bannerReview },
        },
        {
          id: 'quarter-4',
          title: 'Q4 taxes',
          dueAt: formatDateString(getQuarterDueDate(year, 4)),
          amount: 0,
          description: 'Estimated tax',
        },
      ],
    },
  }
}

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
    tags: [TAX_OVERVIEW_TAG_KEY],
  } as const
}

export function useTaxOverview({ year }: UseTaxOverviewOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const fallbackData = Schema.decodeUnknownSync(TaxOverviewResponseSchema)(
    buildTaxOverviewMockResponse({ year }),
  ).data

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      businessId,
      year,
    }),
    async ({ year }) => {
      return Promise.resolve(buildTaxOverviewMockResponse({ year }))
        .then(Schema.decodeUnknownPromise(TaxOverviewResponseSchema))
        .then(({ data }) => data)
    },
    { fallbackData },
  )

  return new SWRQueryResult(swrResponse)
}

export function useTaxOverviewGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadTaxOverview = useCallback(
    () => forceReload(({ tags }) => tags.includes(TAX_OVERVIEW_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadTaxOverview }
}
