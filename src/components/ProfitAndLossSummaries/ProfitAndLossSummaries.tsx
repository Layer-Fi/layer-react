import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import {
  getCashflowBreakdownFooter,
  getCashflowNetCashflowFooter,
} from '@components/CashflowSummaries/CashflowSummariesFooters'
import {
  type SummaryTileConfig,
  SummariesContent,
  type SummariesTiles,
} from '@components/ProfitAndLossSummaries/internal/SummariesContent'
import { TransactionsToReview } from '@views/AccountingOverview/internal/TransactionsToReview'

export interface ProfitAndLossSummariesStringOverrides {
  revenueLabel?: string
  expensesLabel?: string
  netProfitLabel?: string
  moneyInLabel?: string
  moneyOutLabel?: string
  netCashFlowLabel?: string
}

export type ProfitAndLossSummariesReportingVariant =
  | { type?: 'profitAndLoss' }
  | { type: 'cashflow'; showProfitAndLossBreakout?: boolean }

export type ProfitAndLossSummariesSlotProps = {
  reportingVariant?: ProfitAndLossSummariesReportingVariant
  variants?: Variants
}

type ProfitAndLossSummariesProps = {
  actionable?: boolean
  stringOverrides?: ProfitAndLossSummariesStringOverrides
  chartColorsList?: string[]
  reportingVariant?: ProfitAndLossSummariesReportingVariant
  variants?: Variants
  onTransactionsToReviewClick?: () => void
  /**
   * @deprecated Use `stringOverrides.revenueLabel` instead
   */
  revenueLabel?: string
  /**
   * @deprecated Orientation is determined by the container size
   */
  vertical?: boolean
}

export function ProfitAndLossSummaries({
  actionable = false,
  revenueLabel,
  stringOverrides,
  chartColorsList,
  reportingVariant,
  variants,
  onTransactionsToReviewClick,
}: ProfitAndLossSummariesProps) {
  const { t } = useTranslation()
  const mode = reportingVariant?.type === 'cashflow' ? 'cashflow' : 'profitAndLoss'
  const isCashflow = mode === 'cashflow'
  const showProfitAndLossBreakout =
    reportingVariant?.type === 'cashflow'
      ? reportingVariant.showProfitAndLossBreakout ?? true
      : false

  const uncategorizedLabel = t('common:label.uncategorized', 'Uncategorized')

  const tiles: SummariesTiles = useMemo(() => {
    const revenue: SummaryTileConfig = {
      label: isCashflow
        ? stringOverrides?.moneyInLabel || t('common:label.money_in', 'Money in')
        : stringOverrides?.revenueLabel || revenueLabel || t('common:label.revenue', 'Revenue'),
      renderFooter: isCashflow
        ? getCashflowBreakdownFooter({
          showProfitAndLossBreakout,
          chartColorsList,
          categorizedLabel: t('overview:label.categorized_revenue', 'Categorized revenue'),
          uncategorizedLabel,
        })
        : undefined,
    }

    const expenses: SummaryTileConfig = {
      label: isCashflow
        ? stringOverrides?.moneyOutLabel || t('common:label.money_out', 'Money out')
        : stringOverrides?.expensesLabel || t('common:label.expenses', 'Expenses'),
      renderFooter: isCashflow
        ? getCashflowBreakdownFooter({
          showProfitAndLossBreakout,
          chartColorsList,
          categorizedLabel: t('overview:label.categorized_expenses', 'Categorized expenses'),
          uncategorizedLabel,
        })
        : undefined,
    }

    const net: SummaryTileConfig = {
      label: isCashflow
        ? stringOverrides?.netCashFlowLabel || t('overview:label.net_cash_flow', 'Net cash flow')
        : stringOverrides?.netProfitLabel || t('common:label.net_profit', 'Net Profit'),
      renderFooter: isCashflow
        ? getCashflowNetCashflowFooter({
          showProfitAndLossBreakout,
          categorizedLabel: t('overview:label.categorized_net_profit', 'Categorized net profit'),
          onTransactionsToReviewClick,
        })
        : undefined,
    }

    return { revenue, expenses, net }
  }, [
    isCashflow,
    stringOverrides?.moneyInLabel,
    stringOverrides?.revenueLabel,
    stringOverrides?.moneyOutLabel,
    stringOverrides?.expensesLabel,
    stringOverrides?.netCashFlowLabel,
    stringOverrides?.netProfitLabel,
    revenueLabel,
    t,
    showProfitAndLossBreakout,
    chartColorsList,
    uncategorizedLabel,
    onTransactionsToReviewClick,
  ])

  return (
    <SummariesContent
      mode={mode}
      tiles={tiles}
      actionable={actionable}
      chartColorsList={chartColorsList}
      variants={variants}
      slots={{
        unstable_AdditionalListItems: mode === 'profitAndLoss' && onTransactionsToReviewClick
          ? [
            <TransactionsToReview
              key='transactions-to-review'
              variants={variants}
              onClick={onTransactionsToReviewClick}
            />,
          ]
          : undefined,
      }}
    />
  )
}
