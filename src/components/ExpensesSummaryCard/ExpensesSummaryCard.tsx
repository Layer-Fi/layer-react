import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

<<<<<<< HEAD
import { useGlobalMonthSubtitle } from '@hooks/utils/i18n/useGlobalMonthSubtitle'
import { ExpandSummaryCardButton } from '@ui/SummaryCard/ExpandSummaryCardButton'
import { SummaryCard, type SummaryCardProps } from '@ui/SummaryCard/SummaryCard'
=======
import { SummaryCard } from '@ui/SummaryCard/SummaryCard'
import {
  type SummaryCardInteractionProps,
  type SummaryCardStringOverrides,
  useSummaryCardSlots,
} from '@ui/SummaryCard/useSummaryCardSlots'
>>>>>>> main
import { ProfitAndLossDetailedCharts, type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

import './expensesSummaryCard.scss'

<<<<<<< HEAD
type InteractionProps = {
  onClickExpand?: () => void
}

=======
>>>>>>> main
type StylingProps = {
  chartColorsList?: string[]
}

<<<<<<< HEAD
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
      ? <ExpandSummaryCardButton callback={onClickExpand} ariaLabel={t('common:label.view_label', 'View')} />
      : undefined

    return {
      title: stringOverrides?.title ?? t('common:label.expenses', 'Expenses'),
      subtitle: subtitle,
      legend: undefined,
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

=======
export type ExpensesSummaryCardProps = {
  stylingProps?: StylingProps
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
  className?: string
}

>>>>>>> main
export const ExpensesSummaryCard = ({
  stylingProps,
  interactionProps,
  stringOverrides,
  className,
}: ExpensesSummaryCardProps) => {
<<<<<<< HEAD
  const { resolvedSlots, resolvedStringOverrides, chartColorsList } = useExpensesSummaryCard({ stylingProps, interactionProps, stringOverrides })
  return (
    <SummaryCard
      className={classNames('Layer__ExpensesSummaryCard', className)}
      slots={resolvedSlots}
=======
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
>>>>>>> main
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
