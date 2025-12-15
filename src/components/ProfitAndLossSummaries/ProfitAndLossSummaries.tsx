import { type ReactNode, useContext, useMemo } from 'react'
import { format, sub } from 'date-fns'

import { MONTH_FORMAT_SHORT } from '@config/general'
import { calculatePercentageChange } from '@utils/percentageChange'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useProfitAndLossSummaries } from '@hooks/useProfitAndLoss/useProfitAndLossSummaries'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import {
  ProfitAndLossSummariesList,
  ProfitAndLossSummariesListItem,
} from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesList'
import {
  ProfitAndLossSummariesMiniChart,
  toMiniChartData,
} from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesMiniChart'
import { ProfitAndLossSummariesSummary } from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesSummary'
import { TransactionsToReview } from '@views/AccountingOverview/internal/TransactionsToReview'

export interface ProfitAndLossSummariesStringOverrides {
  revenueLabel?: string
  expensesLabel?: string
  netProfitLabel?: string
}

const SECTION_CLASS_NAME = 'Layer__ProfitAndLossSummaries'
const SECTION_CLASS_NAMES = `${SECTION_CLASS_NAME} Layer__component`

type CommonProfitAndLossSummariesProps = {
  actionable?: boolean
  stringOverrides?: ProfitAndLossSummariesStringOverrides
  chartColorsList?: string[]
  variants?: Variants
  /**
   * @deprecated Use `stringOverrides.revenueLabel` instead
   */
  revenueLabel?: string
  /**
   * @deprecated Orientation is determined by the container size
   */
  vertical?: boolean
}

type Internal_ProfitAndLossSummariesProps = CommonProfitAndLossSummariesProps & {
  slots?: {
    unstable_AdditionalListItems?: [ReactNode]
  }
}

function Internal_ProfitAndLossSummaries({
  actionable = false,
  revenueLabel,
  stringOverrides,
  chartColorsList,
  slots,
  variants,
}: Internal_ProfitAndLossSummariesProps) {
  const {
    data,
    isLoading,
    setSidebarScope,
    sidebarScope,
  } = useContext(ProfitAndLossContext)

  const { startDate, endDate: _endDate } = useGlobalDateRange({ dateSelectionMode: 'month' })

  const previousMonthStart = sub(startDate, { months: 1 })
  const { data: previousData } = useProfitAndLossSummaries({
    startYear: previousMonthStart.getFullYear(),
    startMonth: previousMonthStart.getMonth() + 1,
    endYear: previousMonthStart.getFullYear(),
    endMonth: previousMonthStart.getMonth() + 1,
  })

  const { revenueChartData, expensesChartData } = useMemo(
    () => ({
      revenueChartData: toMiniChartData({ scope: 'revenue', data }),
      expensesChartData: toMiniChartData({ scope: 'expenses', data }),
    }),
    [data],
  )

  const effectiveData = useMemo(
    () => data ?? { income: { value: 0 }, netProfit: 0 },
    [data],
  )

  const comparisonData = useMemo(() => {
    const previousMonthData = previousData?.months?.[0]

    if (!previousMonthData) {
      return null
    }

    const currentRevenue = effectiveData.income.value ?? 0
    const previousRevenue = previousMonthData.income ?? 0
    const currentExpenses = (effectiveData.income.value ?? 0) - effectiveData.netProfit
    const previousExpenses = previousMonthData.totalExpenses ?? 0

    const currentNetProfit = effectiveData.netProfit ?? 0
    const previousNetProfit = previousMonthData.netProfit ?? 0

    return {
      revenuePercentChange: calculatePercentageChange(currentRevenue, previousRevenue),
      expensesPercentChange: calculatePercentageChange(currentExpenses, previousExpenses),
      netProfitPercentChange: calculatePercentageChange(currentNetProfit, previousNetProfit),
      comparisonMonth: format(previousMonthStart, MONTH_FORMAT_SHORT),
    }
  }, [previousData, effectiveData, previousMonthStart])

  const {
    revenuePercentChange = null,
    expensesPercentChange = null,
    netProfitPercentChange = null,
    comparisonMonth = null,
  } = comparisonData ?? {}

  const { unstable_AdditionalListItems = [] } = slots ?? {}
  const listItemCount = unstable_AdditionalListItems.length + 3

  return (
    <section className={SECTION_CLASS_NAMES}>
      <ProfitAndLossSummariesList itemCount={listItemCount}>
        <ProfitAndLossSummariesListItem
          isActive={sidebarScope === 'revenue'}
          onClick={actionable ? () => setSidebarScope('revenue') : undefined}
        >
          <ProfitAndLossSummariesSummary
            label={stringOverrides?.revenueLabel || revenueLabel || 'Revenue'}
            amount={effectiveData.income.value ?? 0}
            isLoading={isLoading}
            percentChange={revenuePercentChange}
            comparisonMonth={comparisonMonth ?? undefined}
            slots={{
              Chart: (
                <ProfitAndLossSummariesMiniChart
                  data={revenueChartData}
                  chartColorsList={chartColorsList}
                  variants={variants}
                />
              ),
            }}
            variants={variants}
          />
        </ProfitAndLossSummariesListItem>
        <ProfitAndLossSummariesListItem
          isActive={sidebarScope === 'expenses'}
          onClick={actionable ? () => setSidebarScope('expenses') : undefined}
        >
          <ProfitAndLossSummariesSummary
            label={stringOverrides?.expensesLabel || 'Expenses'}
            amount={(effectiveData?.income?.value ?? 0) - effectiveData.netProfit}
            isLoading={isLoading}
            percentChange={expensesPercentChange}
            comparisonMonth={comparisonMonth ?? undefined}
            isExpense
            slots={{
              Chart: (
                <ProfitAndLossSummariesMiniChart
                  data={expensesChartData}
                  chartColorsList={chartColorsList}
                  variants={variants}
                />
              ),
            }}
            variants={variants}
          />
        </ProfitAndLossSummariesListItem>
        <ProfitAndLossSummariesListItem>
          <ProfitAndLossSummariesSummary
            label={stringOverrides?.netProfitLabel || 'Net Profit'}
            amount={data?.netProfit ?? 0}
            variants={variants}
            isLoading={isLoading}
            percentChange={netProfitPercentChange}
            comparisonMonth={comparisonMonth ?? undefined}
          />
        </ProfitAndLossSummariesListItem>
        {unstable_AdditionalListItems.map((item, index) => (
          <ProfitAndLossSummariesListItem key={index}>
            {item}
          </ProfitAndLossSummariesListItem>
        ))}
      </ProfitAndLossSummariesList>
    </section>
  )
}

type ProfitAndLossSummariesProps = CommonProfitAndLossSummariesProps & {
  onTransactionsToReviewClick?: () => void
}

export function ProfitAndLossSummaries({
  onTransactionsToReviewClick,
  ...restProps
}: ProfitAndLossSummariesProps) {
  return (
    <Internal_ProfitAndLossSummaries
      {...restProps}
      slots={{
        unstable_AdditionalListItems: onTransactionsToReviewClick
          ? [
            <TransactionsToReview
              key='transactions-to-review'
              usePnlDateRange
              variants={restProps.variants}
              onClick={onTransactionsToReviewClick}
            />,
          ]
          : undefined,
      }}
    />
  )
}
