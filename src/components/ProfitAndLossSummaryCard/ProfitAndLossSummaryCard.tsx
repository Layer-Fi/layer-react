import { type ReactNode, useContext } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { useGlobalMonthSubtitle } from '@hooks/utils/i18n/useGlobalMonthSubtitle'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { VStack } from '@ui/Stack/Stack'
import { type HeadingSize } from '@ui/Typography/Heading'
import { ProfitAndLossChart } from '@components/ProfitAndLossChart/ProfitAndLossChart'
import { PnlLegend } from '@components/ProfitAndLossSummaryCard/PnlLegend'
import { ExpandSummaryCardButton } from '@ui/SummaryCard/ExpandSummaryCardButton'
import { SummaryCard } from '@ui/SummaryCard/SummaryCard'

import './profitAndLossSummaryCard.scss'

export interface ProfitAndLossSummaryCardInteractionProps {
  onExpandClick?: () => void
}

export type ProfitAndLossSummaryCardProps = {
  title?: string
  headerSize?: HeadingSize
  className?: string
  legend?: ReactNode
  interactionProps?: ProfitAndLossSummaryCardInteractionProps
}

export const ProfitAndLossSummaryCard = ({
  title,
  headerSize,
  legend,
  interactionProps,
  className,
}: ProfitAndLossSummaryCardProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const subtitle = useGlobalMonthSubtitle()
  const { tagFilter } = useContext(ProfitAndLossContext)

  const { onExpandClick } = interactionProps ?? {}

  const resolvedLegend = legend ?? <PnlLegend direction={isDesktop ? 'row' : 'column'} />
  const resolvedPrimaryAction = onExpandClick
    ? <ExpandSummaryCardButton callback={onExpandClick} ariaLabel={t('common:label.view_details', 'View details')} />
    : undefined

  return (
    <SummaryCard
      className={classNames('Layer__ProfitAndLossSummaryCard', className)}
      title={title ?? t('common:label.profit_loss', 'Profit & Loss')}
      subtitle={subtitle}
      headerSize={headerSize}
      legend={isDesktop ? resolvedLegend : undefined}
      primaryAction={resolvedPrimaryAction}
    >
      <VStack gap='sm'>
        <ProfitAndLossChart tagFilter={tagFilter} hideLegend />
        {!isDesktop && resolvedLegend}
      </VStack>
    </SummaryCard>
  )
}
