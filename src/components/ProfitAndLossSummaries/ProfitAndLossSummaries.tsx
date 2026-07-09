import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import { getCashflowBreakdownFooter } from '@components/CashflowSummaries/CashflowSummariesFooters'
import { CashflowSummariesNetCashflowFooter } from '@components/CashflowSummaries/CashflowSummariesNetCashflowFooter'
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

  const revenueFooter = useMemo<SummaryTileConfig['renderFooter']>(() => (
    isCashflow
      ? getCashflowBreakdownFooter({
        showProfitAndLossBreakout,
        chartColorsList,
        categorizedLabel: t('overview:label.categorized_revenue', 'Categorized revenue'),
        uncategorizedLabel,
      })
      : undefined
  ), [
    isCashflow,
    showProfitAndLossBreakout,
    chartColorsList,
    t,
    uncategorizedLabel,
  ])

  const expensesFooter = useMemo<SummaryTileConfig['renderFooter']>(() => (
    isCashflow
      ? getCashflowBreakdownFooter({
        showProfitAndLossBreakout,
        chartColorsList,
        categorizedLabel: t('overview:label.categorized_expenses', 'Categorized expenses'),
        uncategorizedLabel,
      })
      : undefined
  ), [
    isCashflow,
    showProfitAndLossBreakout,
    chartColorsList,
    t,
    uncategorizedLabel,
  ])

  const renderNetFooter = useCallback<NonNullable<SummaryTileConfig['renderFooter']>>(({ categorized }, isLoading) => (
    <CashflowSummariesNetCashflowFooter
      isLoading={isLoading}
      categorized={showProfitAndLossBreakout
        ? {
          label: t('overview:label.categorized_net_profit', 'Categorized net profit'),
          amount: categorized,
        }
        : undefined}
      onTransactionsToReviewClick={onTransactionsToReviewClick}
    />
  ), [
    showProfitAndLossBreakout,
    t,
    onTransactionsToReviewClick,
  ])

  const revenue: SummaryTileConfig = useMemo(() => ({
    label: isCashflow
      ? stringOverrides?.moneyInLabel || t('common:label.money_in', 'Money in')
      : stringOverrides?.revenueLabel || revenueLabel || t('common:label.revenue', 'Revenue'),
    renderFooter: revenueFooter,
  }), [
    isCashflow,
    stringOverrides?.moneyInLabel,
    stringOverrides?.revenueLabel,
    revenueLabel,
    t,
    revenueFooter,
  ])

  const expenses: SummaryTileConfig = useMemo(() => ({
    label: isCashflow
      ? stringOverrides?.moneyOutLabel || t('common:label.money_out', 'Money out')
      : stringOverrides?.expensesLabel || t('common:label.expenses', 'Expenses'),
    renderFooter: expensesFooter,
  }), [
    isCashflow,
    stringOverrides?.moneyOutLabel,
    stringOverrides?.expensesLabel,
    t,
    expensesFooter,
  ])

  const net: SummaryTileConfig = useMemo(() => ({
    label: isCashflow
      ? stringOverrides?.netCashFlowLabel || t('overview:label.net_cash_flow', 'Net cash flow')
      : stringOverrides?.netProfitLabel || t('common:label.net_profit', 'Net Profit'),
    renderFooter: isCashflow && (showProfitAndLossBreakout || onTransactionsToReviewClick)
      ? renderNetFooter
      : undefined,
  }), [
    isCashflow,
    stringOverrides?.netCashFlowLabel,
    stringOverrides?.netProfitLabel,
    t,
    showProfitAndLossBreakout,
    onTransactionsToReviewClick,
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
