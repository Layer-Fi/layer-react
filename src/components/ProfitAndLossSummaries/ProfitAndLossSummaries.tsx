import { useContext, useMemo, type ReactNode } from 'react'
import type { Variants } from '../../utils/styleUtils/sizeVariants'
import {
  ProfitAndLossSummariesList,
  ProfitAndLossSummariesListItem,
} from './internal/ProfitAndLossSummariesList'
import {
  ProfitAndLossSummariesMiniChart,
  toMiniChartData,
} from './internal/ProfitAndLossSummariesMiniChart'
import { ProfitAndLossSummariesSummary } from './internal/ProfitAndLossSummariesSummary'
import { TransactionsToReview } from '../../views/AccountingOverview/internal/TransactionsToReview'
import { ProfitAndLossContext } from '../../contexts/ProfitAndLossContext/ProfitAndLossContext'

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

  const { revenueChartData, expensesChartData } = useMemo(
    () => ({
      revenueChartData: toMiniChartData({ scope: 'revenue', data }),
      expensesChartData: toMiniChartData({ scope: 'expenses', data }),
    }),
    [data],
  )

  const effectiveData = data ?? { income: { value: 0 }, netProfit: 0 }

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
