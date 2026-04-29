import { type ReactNode } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { useGlobalMonthSubtitle } from '@hooks/utils/i18n/useGlobalMonthSubtitle'
import { type HeadingSize } from '@ui/Typography/Heading'
import { ProfitAndLossDetailedCharts, type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ExpandSummaryCardButton } from '@ui/SummaryCard/ExpandSummaryCardButton'
import { SummaryCard } from '@ui/SummaryCard/SummaryCard'

import './expensesSummaryCard.scss'

export interface ExpensesSummaryCardInteractionProps {
  onExpandClick?: () => void
}

export type ExpensesSummaryCardProps = {
  title?: string
  headerSize?: HeadingSize
  chartColorsList?: string[]
  stringOverrides?: ProfitAndLossDetailedChartsStringOverrides
  legend?: ReactNode
  interactionProps?: ExpensesSummaryCardInteractionProps
  className?: string
}

export const ExpensesSummaryCard = ({
  title,
  headerSize,
  chartColorsList,
  stringOverrides,
  legend,
  interactionProps,
  className,
}: ExpensesSummaryCardProps) => {
  const { t } = useTranslation()
  const subtitle = useGlobalMonthSubtitle()

  const { onExpandClick } = interactionProps ?? {}

  const resolvedPrimaryAction = onExpandClick
    ? <ExpandSummaryCardButton callback={onExpandClick} ariaLabel={t('common:label.view_details', 'View details')} />
    : undefined

  return (
    <SummaryCard
      className={classNames('Layer__ExpensesSummaryCard', className)}
      title={title ?? t('common:label.expenses', 'Expenses')}
      subtitle={subtitle}
      headerSize={headerSize}
      legend={legend}
      primaryAction={resolvedPrimaryAction}
    >
      <ProfitAndLossDetailedCharts
        scope='expenses'
        hideClose
        hideHeader
        chartColorsList={chartColorsList}
        stringOverrides={stringOverrides}
        slotProps={{ detailedTable: { showTypeColumn: false } }}
      />
    </SummaryCard>
  )
}
