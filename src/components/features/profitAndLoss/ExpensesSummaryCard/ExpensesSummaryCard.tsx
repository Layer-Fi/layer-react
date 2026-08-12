import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { SummaryCard } from '@blocks/SummaryCard/SummaryCard'
import {
  type SummaryCardInteractionProps,
  type SummaryCardStringOverrides,
  useSummaryCardSlots,
} from '@blocks/SummaryCard/useSummaryCardSlots'
import { ProfitAndLossDetailedCharts, type ProfitAndLossDetailedChartsStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

import './expensesSummaryCard.scss'

type StylingProps = {
  chartConfig?: ProfitAndLossChartConfig
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
        chartConfig={stylingProps?.chartConfig}
        chartColorsList={stylingProps?.chartColorsList}
        stringOverrides={resolvedStringOverrides}
        slotProps={{ detailedTable: { showTypeColumn: false } }}
      />
    </SummaryCard>
  )
}
