import { useContext, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ProfitAndLossContext } from '@providers/features/profitAndLoss/ProfitAndLossContext/ProfitAndLossContext'
import { SummaryCard } from '@blocks/SummaryCard/SummaryCard'
import {
  type SummaryCardInteractionProps,
  type SummaryCardStringOverrides,
  useSummaryCardSlots,
} from '@blocks/SummaryCard/useSummaryCardSlots'
import { ProfitAndLossChart } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChart'
import { ProfitAndLossLegend } from '@features/profitAndLoss/ProfitAndLossLegend/ProfitAndLossLegend'

import './profitAndLossSummaryCard.scss'

export type ProfitAndLossSummaryCardProps = {
  chartConfig?: ProfitAndLossChartConfig
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
  className?: string
}

export const ProfitAndLossSummaryCard = ({
  chartConfig,
  interactionProps,
  stringOverrides,
  className,
}: ProfitAndLossSummaryCardProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { tagFilter } = useContext(ProfitAndLossContext)

  const legend = useMemo(
    () => <ProfitAndLossLegend direction={isDesktop ? 'row' : 'column'} />,
    [isDesktop],
  )

  const slots = useSummaryCardSlots({
    defaultTitle: t('common:label.profit_loss', 'Profit & Loss'),
    legend: isDesktop ? legend : undefined,
    interactionProps,
    stringOverrides,
  })

  return (
    <SummaryCard
      className={classNames('Layer__ProfitAndLossSummaryCard', 'Layer__UI__Chart--focusReset', className)}
      slots={slots}
    >
      <ProfitAndLossChart tagFilter={tagFilter} hideLegend chartConfig={chartConfig} />
      {!isDesktop && legend}
    </SummaryCard>
  )
}
