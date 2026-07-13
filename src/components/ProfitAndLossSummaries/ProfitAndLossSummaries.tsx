import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DEFAULT_CHART_COLORS } from '@utils/chartColors'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { CashflowSummariesNetCashflowFooter } from '@components/CashflowSummaries/CashflowSummariesNetCashflowFooter'
import { UNCATEGORIZED_CHART_COLOR } from '@components/ProfitAndLossDetailedCharts/utils'
import { BaseSummariesBreakdownFooter } from '@components/ProfitAndLossSummaries/internal/BaseSummariesBreakdownFooter'
import {
  SummariesContent,
  type SummariesTiles,
  type SummaryTileBreakdown,
  type SummaryTileConfig,
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
  | { type: 'cashflow', showProfitAndLossBreakdown?: boolean }

export type ProfitAndLossSummariesSlotProps = {
  reportingVariant?: ProfitAndLossSummariesReportingVariant
  /**
   * @deprecated This prop no longer has any effect; the summaries tiles size themselves
   * responsively to their container. Override the `--text-*` font size variables to adjust sizing.
   */
  variants?: Variants
}

type ProfitAndLossSummariesProps = {
  actionable?: boolean
  stringOverrides?: ProfitAndLossSummariesStringOverrides
  chartColorsList?: string[]
  reportingVariant?: ProfitAndLossSummariesReportingVariant
  /**
   * @deprecated This prop no longer has any effect; the summaries tiles size themselves
   * responsively to their container. Override the `--text-*` font size variables to adjust sizing.
   */
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
  onTransactionsToReviewClick,
}: ProfitAndLossSummariesProps) {
  const { t } = useTranslation()
  const mode = reportingVariant?.type === 'cashflow' ? 'cashflow' : 'profitAndLoss'
  const isCashflow = mode === 'cashflow'
  const showProfitAndLossBreakdown =
    reportingVariant?.type === 'cashflow'
      ? reportingVariant.showProfitAndLossBreakdown ?? true
      : false

  const uncategorizedLabel = t('common:label.uncategorized', 'Uncategorized')
  const categorizedSwatchColor = chartColorsList?.[0] ?? DEFAULT_CHART_COLORS[0]

  const renderRevenueFooter = useCallback(({ categorized, uncategorized }: SummaryTileBreakdown, isLoading: boolean) => (
    <BaseSummariesBreakdownFooter
      isLoading={isLoading}
      categorized={{
        label: t('overview:label.categorized_revenue', 'Categorized revenue'),
        amount: categorized,
        swatchColor: categorizedSwatchColor,
      }}
      uncategorized={{
        label: uncategorizedLabel,
        amount: uncategorized,
        swatchColor: UNCATEGORIZED_CHART_COLOR,
      }}
    />
  ), [
    t,
    categorizedSwatchColor,
    uncategorizedLabel,
  ])

  const renderExpensesFooter = useCallback(({ categorized, uncategorized }: SummaryTileBreakdown, isLoading: boolean) => (
    <BaseSummariesBreakdownFooter
      isLoading={isLoading}
      categorized={{
        label: t('overview:label.categorized_expenses', 'Categorized expenses'),
        amount: categorized,
        swatchColor: categorizedSwatchColor,
      }}
      uncategorized={{
        label: uncategorizedLabel,
        amount: uncategorized,
        swatchColor: UNCATEGORIZED_CHART_COLOR,
      }}
    />
  ), [
    t,
    categorizedSwatchColor,
    uncategorizedLabel,
  ])

  const renderNetFooter = useCallback(({ categorized }: SummaryTileBreakdown, isLoading: boolean) => (
    <CashflowSummariesNetCashflowFooter
      isLoading={isLoading}
      categorized={showProfitAndLossBreakdown
        ? {
          label: t('overview:label.categorized_net_profit', 'Categorized net profit'),
          amount: categorized,
        }
        : undefined}
      onTransactionsToReviewClick={onTransactionsToReviewClick}
    />
  ), [
    showProfitAndLossBreakdown,
    t,
    onTransactionsToReviewClick,
  ])

  const revenue: SummaryTileConfig = useMemo(() => ({
    label: isCashflow
      ? stringOverrides?.moneyInLabel || t('common:label.money_in', 'Money in')
      : stringOverrides?.revenueLabel || revenueLabel || t('common:label.revenue', 'Revenue'),
    renderFooter: isCashflow && showProfitAndLossBreakdown
      ? renderRevenueFooter
      : undefined,
  }), [
    isCashflow,
    stringOverrides?.moneyInLabel,
    stringOverrides?.revenueLabel,
    revenueLabel,
    t,
    showProfitAndLossBreakdown,
    renderRevenueFooter,
  ])

  const expenses: SummaryTileConfig = useMemo(() => ({
    label: isCashflow
      ? stringOverrides?.moneyOutLabel || t('common:label.money_out', 'Money out')
      : stringOverrides?.expensesLabel || t('common:label.expenses', 'Expenses'),
    renderFooter: isCashflow && showProfitAndLossBreakdown
      ? renderExpensesFooter
      : undefined,
  }), [
    isCashflow,
    stringOverrides?.moneyOutLabel,
    stringOverrides?.expensesLabel,
    t,
    showProfitAndLossBreakdown,
    renderExpensesFooter,
  ])

  const net: SummaryTileConfig = useMemo(() => ({
    label: isCashflow
      ? stringOverrides?.netCashFlowLabel || t('overview:label.net_cash_flow', 'Net cash flow')
      : stringOverrides?.netProfitLabel || t('common:label.net_profit', 'Net Profit'),
    renderFooter: isCashflow && showProfitAndLossBreakdown
      ? renderNetFooter
      : undefined,
  }), [
    isCashflow,
    stringOverrides?.netCashFlowLabel,
    stringOverrides?.netProfitLabel,
    t,
    showProfitAndLossBreakdown,
    renderNetFooter,
  ])

  const tiles: SummariesTiles = useMemo(() => ({
    revenue,
    expenses,
    net,
  }), [revenue, expenses, net])

  return (
    <SummariesContent
      mode={mode}
      tiles={tiles}
      actionable={actionable}
      chartColorsList={chartColorsList}
      slots={{
        unstable_AdditionalListItems: mode === 'profitAndLoss' && onTransactionsToReviewClick
          ? [
            <TransactionsToReview
              key='transactions-to-review'
              onClick={onTransactionsToReviewClick}
            />,
          ]
          : undefined,
      }}
    />
  )
}
