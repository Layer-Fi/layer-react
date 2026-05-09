import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { SummaryCard } from '@ui/SummaryCard/SummaryCard'
import {
  useSummaryCardSlots,
  type SummaryCardInteractionProps,
  type SummaryCardStringOverrides,
} from '@ui/SummaryCard/useSummaryCardSlots'
import { ProfitAndLossDetailedCharts, type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

import './expensesSummaryCard.scss'

type StylingProps = {
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
  const { chartColorsList } = stylingProps ?? {}

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
        chartColorsList={chartColorsList}
        stringOverrides={resolvedStringOverrides}
        slotProps={{ detailedTable: { showTypeColumn: false } }}
      />
    </SummaryCard>
  )
}
