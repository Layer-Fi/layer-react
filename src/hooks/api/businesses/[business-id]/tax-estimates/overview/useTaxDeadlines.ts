import { useMemo } from 'react'
import { CalendarDate, type CalendarDate as CalendarDateType } from '@internationalized/date'
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

function mapQuarterStatusToState(quarter: TaxEstimatesBannerQuarter): TaxOverviewDeadlineStatus {
  if (quarter.isPastDue) {
    return TaxOverviewDeadlineStatus.PastDue
  }
  if (quarter.uncategorizedCount > 0) {
    return TaxOverviewDeadlineStatus.CategorizationIncomplete
  }
  if (quarter.amountPaid > 0) {
    return TaxOverviewDeadlineStatus.Paid
  }

  return TaxOverviewDeadlineStatus.Due
}

function mapQuarterToSection(t: TFunction, quarter: TaxEstimatesBannerQuarter): TaxEstimateDeadlineRow {
  return {
    type: 'quarter',
    title: t('taxEstimates:label.quarter_taxes', 'Q{{quarter}} taxes', { quarter: quarter.quarter }),
    dueDate: quarter.dueDate,
    amount: quarter.amountOwed,
    status: mapQuarterStatusToState(quarter),
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

  const paymentDeadlines = useMemo(() => data?.quarters.map(quarter => mapQuarterToSection(t, quarter)) ?? [], [data, t])
  const annualDeadline: TaxEstimateDeadlineRow = useMemo(() => ({
    type: 'annual',
    title: t('taxEstimates:label.annual_taxes', 'Annual taxes'),
    dueDate: new CalendarDate(year + 1, 4, 15),
    amount: data?.totalUncategorizedSum ?? 0,
    status: TaxOverviewDeadlineStatus.Due,
    uncategorizedCount: paymentDeadlines.reduce((count, deadline) => count + deadline.uncategorizedCount, 0),
    uncategorizedSum: paymentDeadlines.reduce((sum, deadline) => sum + deadline.uncategorizedSum, 0),
  }), [data, t, paymentDeadlines, year])

  return {
    data: useMemo(() => [...paymentDeadlines, annualDeadline], [paymentDeadlines, annualDeadline]),
    isLoading,
    isError,
  }
}
