import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { SummaryCard } from '@blocks/SummaryCard/SummaryCard'
import {
  type SummaryCardInteractionProps,
  type SummaryCardStringOverrides,
  useSummaryCardSlots,
} from '@blocks/SummaryCard/useSummaryCardSlots'
import { ProfitAndLossDetailedCharts, type ProfitAndLossDetailedChartsStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { type ProfitAndLossChartColors } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/utils'

import './expensesSummaryCard.scss'

type StylingProps = {
  chartColors?: ProfitAndLossChartColors
  chartColorsList?: string[]
}

export type ExpensesSummaryCardProps = {
  stylingProps?: StylingProps
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
  className?: string
}

export const ExpensesSummaryCard = ({
  stylingProps,
  interactionProps,
  stringOverrides,
  className,
}: ExpensesSummaryCardProps) => {
  const { t } = useTranslation()
  const { chartColors, chartColorsList } = stylingProps ?? {}

  const slots = useSummaryCardSlots({
    defaultTitle: t('common:label.expenses', 'Expenses'),
    interactionProps,
    stringOverrides,
  })

  const resolvedStringOverrides: ProfitAndLossDetailedChartsStringOverrides = useMemo(() => ({
    detailedChartStringOverrides: {
      expenseChartHeader: stringOverrides?.title ?? t('common:label.expenses', 'Expenses'),
    },
  }), [stringOverrides?.title, t])

  return (
    <SummaryCard
      className={classNames('Layer__ExpensesSummaryCard', className)}
      slots={slots}
    >
      <ProfitAndLossDetailedCharts
        scope='expenses'
        hideClose
        hideHeader
        chartColors={chartColors}
        chartColorsList={chartColorsList}
        stringOverrides={resolvedStringOverrides}
        slotProps={{ detailedTable: { showTypeColumn: false } }}
      />
    </SummaryCard>
  )
}
