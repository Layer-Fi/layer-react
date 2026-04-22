import { useMemo } from 'react'
import { type CalendarDate as CalendarDateType } from '@internationalized/date'
import { type TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type TaxEstimatesBannerQuarter } from '@schemas/taxEstimates/banner'
import { TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'

export type TaxEstimateDeadlineRow = {
  type: 'quarter' | 'annual'
  title: string
  dueDate: CalendarDateType
  amount: number
  status: TaxOverviewDeadlineStatus
  uncategorizedCount: number
  uncategorizedSum: number
}

function mapQuarterToSection(t: TFunction, quarter: TaxEstimatesBannerQuarter): TaxEstimateDeadlineRow {
  return {
    type: 'quarter',
    title: t('taxEstimates:label.quarter_taxes', 'Q{{quarter}} taxes', { quarter: quarter.quarter }),
    dueDate: quarter.dueDate,
    amount: quarter.amountOwed,
    status: quarter.state,
    uncategorizedCount: quarter.uncategorizedCount,
    uncategorizedSum: quarter.uncategorizedSum,
  }
}

type TaxEstimatesDeadlines = {
  data: TaxEstimateDeadlineRow[]
  isLoading: boolean
  isError: boolean
}

export const useTaxEstimatesDeadlines = (): TaxEstimatesDeadlines => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useTaxEstimatesBanner({
    year,
    fullYearProjection,
  })

  const deadlines = useMemo(() => {
    if (!data) return []

    const quarters = data.quarters.map(quarter => mapQuarterToSection(t, quarter))
    const annual: TaxEstimateDeadlineRow = {
      type: 'annual',
      title: t('taxEstimates:label.annual_taxes', 'Annual taxes'),
      dueDate: data.taxesDueAt,
      amount: data.totalTaxesOwed,
      status: TaxOverviewDeadlineStatus.Neutral,
      uncategorizedCount: data.totalUncategorizedCount,
      uncategorizedSum: data.totalUncategorizedSum,
    }

    return [...quarters, annual]
  }, [data, t])

  return {
    data: deadlines,
    isLoading,
    isError,
  }
}
