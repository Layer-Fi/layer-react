import { useContext, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { SummaryCard } from '@ui/SummaryCard/SummaryCard'
import {
  type SummaryCardInteractionProps,
  type SummaryCardStringOverrides,
  useSummaryCardSlots,
} from '@ui/SummaryCard/useSummaryCardSlots'
import { ProfitAndLossChart } from '@components/ProfitAndLossChart/ProfitAndLossChart'
import { PnlLegend } from '@components/ProfitAndLossSummaryCard/PnlLegend'

import './profitAndLossSummaryCard.scss'

export type ProfitAndLossSummaryCardProps = {
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
  className?: string
}

export const ProfitAndLossSummaryCard = ({
  interactionProps,
  stringOverrides,
  className,
}: ProfitAndLossSummaryCardProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { tagFilter } = useContext(ProfitAndLossContext)

  const legend = useMemo(
    () => <PnlLegend direction={isDesktop ? 'row' : 'column'} />,
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
      interactionProps={interactionProps}
      slots={slots}
    >
      <ProfitAndLossChart tagFilter={tagFilter} hideLegend />
      {!isDesktop && legend}
    </SummaryCard>
  )
}
