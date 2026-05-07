import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { useGlobalMonthSubtitle } from '@hooks/utils/i18n/useGlobalMonthSubtitle'
import { ExpandSummaryCardButton } from '@ui/SummaryCard/ExpandSummaryCardButton'
import { SummaryCard, type SummaryCardProps } from '@ui/SummaryCard/SummaryCard'
import { ProfitAndLossDetailedCharts, type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

import './expensesSummaryCard.scss'

type InteractionProps = {
  onClickExpand?: () => void
}

type StylingProps = {
  chartColorsList?: string[]
}

type StringOverrides = {
  title?: string
}

export type ExpensesSummaryCardProps = {
  stylingProps?: StylingProps
  interactionProps?: InteractionProps
  stringOverrides?: StringOverrides
  className?: string
}

const useExpensesSummaryCard = ({ stylingProps, interactionProps, stringOverrides }: UseExpensesSummaryCardParams) => {
  const { t } = useTranslation()
  const subtitle = useGlobalMonthSubtitle()
  const { chartColorsList } = stylingProps ?? {}

  const { onClickExpand } = interactionProps ?? {}

  const resolvedSlots: SummaryCardProps['slots'] = useMemo(() => {
    const resolvedPrimaryAction = onClickExpand
      ? <ExpandSummaryCardButton callback={onClickExpand} ariaLabel={t('common:label.view_details', 'View details')} />
      : undefined

    return {
      title: stringOverrides?.title ?? t('common:label.expenses', 'Expenses'),
      subtitle: subtitle,
      legend: <></>,
      primaryAction: resolvedPrimaryAction,
    }
  }, [stringOverrides?.title, subtitle, t, onClickExpand])

  const resolvedStringOverrides: ProfitAndLossDetailedChartsStringOverrides = useMemo(() => {
    return {
      detailedChartStringOverrides: {
        expenseChartHeader: stringOverrides?.title ?? t('common:label.expenses', 'Expenses'),
      },
    }
  }, [stringOverrides?.title, t])

  return {
    resolvedSlots,
    resolvedStringOverrides,
    chartColorsList,
  }
}

type UseExpensesSummaryCardParams = {
  stylingProps?: StylingProps
  interactionProps?: InteractionProps
  stringOverrides?: StringOverrides
}

export const ExpensesSummaryCard = ({
  stylingProps,
  interactionProps,
  stringOverrides,
  className,
}: ExpensesSummaryCardProps) => {
  const { resolvedSlots, resolvedStringOverrides, chartColorsList } = useExpensesSummaryCard({ stylingProps, interactionProps, stringOverrides })
  return (
    <SummaryCard
      className={classNames('Layer__ExpensesSummaryCard', className)}
      slots={resolvedSlots}
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
