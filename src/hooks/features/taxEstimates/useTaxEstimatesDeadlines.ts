import { useMemo } from 'react'
import { type TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type TaxEstimatesBannerQuarter } from '@schemas/features/taxEstimates/banner'
import { TaxOverviewDeadlineStatus } from '@schemas/features/taxEstimates/overview'
import { useGetTaxEstimatesBanner } from '@api/businesses/[business-id]/tax-estimates/banner/get'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/features/taxEstimates/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'

export type TaxEstimatesDeadlineRow = {
  type: 'quarter' | 'annual'
  title: string
} & Omit<TaxEstimatesBannerQuarter, 'quarter' | 'isPastDue' | 'amountPaid' | 'balance'>

function mapQuarterToSection(t: TFunction, quarter: TaxEstimatesBannerQuarter): TaxEstimatesDeadlineRow {
  let quarterLabel
  switch (quarter.quarter) {
    case 1:
      quarterLabel = t('taxEstimates:useTaxEstimatesDeadlines.label.q1', 'Q1')
      break
    case 2:
      quarterLabel = t('taxEstimates:useTaxEstimatesDeadlines.label.q2', 'Q2')
      break
    case 3:
      quarterLabel = t('taxEstimates:useTaxEstimatesDeadlines.label.q3', 'Q3')
      break
    case 4:
      quarterLabel = t('taxEstimates:useTaxEstimatesDeadlines.label.q4', 'Q4')
      break
  }

  return {
    ...quarter,
    type: 'quarter',
    title: t('taxEstimates:useTaxEstimatesDeadlines.label.quarter_taxes', '{{quarterLabel}} taxes', { quarterLabel }),
  }
}

type TaxEstimatesDeadlines = {
  data: TaxEstimatesDeadlineRow[] | undefined
  isLoading: boolean
  isError: boolean
}

export const useTaxEstimatesDeadlines = (): TaxEstimatesDeadlines => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetTaxEstimatesBanner({
    year,
    fullYearProjection,
  })

  const deadlines = useMemo(() => {
    if (!data) return undefined

    const quarters = data.quarters.map(quarter => mapQuarterToSection(t, quarter))

    const annual: TaxEstimatesDeadlineRow = {
      type: 'annual',
      title: t('taxEstimates:useTaxEstimatesDeadlines.label.annual_taxes', 'Annual taxes'),
      dueDate: data.taxesDueAt,
      amountOwed: data.totalTaxesOwed,
      state: TaxOverviewDeadlineStatus.Neutral,
      uncategorizedCount: data.totalUncategorizedCount,
      uncategorizedMoneyIn: data.totalUncategorizedMoneyIn,
      uncategorizedMoneyOut: data.totalUncategorizedMoneyOut,
      earliestUncategorizedAt: data.earliestUncategorizedAt,
      latestUncategorizedAt: data.latestUncategorizedAt,
    }

    return [...quarters, annual]
  }, [data, t])

  return {
    data: deadlines,
    isLoading,
    isError,
  }
}
