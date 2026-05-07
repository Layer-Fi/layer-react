import { useContext, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { useGlobalMonthSubtitle } from '@hooks/utils/i18n/useGlobalMonthSubtitle'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { VStack } from '@ui/Stack/Stack'
import { ExpandSummaryCardButton } from '@ui/SummaryCard/ExpandSummaryCardButton'
import { SummaryCard, type SummaryCardProps } from '@ui/SummaryCard/SummaryCard'
import { ProfitAndLossChart } from '@components/ProfitAndLossChart/ProfitAndLossChart'
import { PnlLegend } from '@components/ProfitAndLossSummaryCard/PnlLegend'

import './profitAndLossSummaryCard.scss'

type InteractionProps = {
  onClickExpand?: () => void
}

type StringOverrides = {
  title?: string
}

export type ProfitAndLossSummaryCardProps = {
  interactionProps?: InteractionProps
  stringOverrides?: StringOverrides
  className?: string
}

type UseProfitAndLossSummaryCardParams = {
  interactionProps?: InteractionProps
  stringOverrides?: StringOverrides
}

const useProfitAndLossSummaryCard = ({ interactionProps, stringOverrides }: UseProfitAndLossSummaryCardParams) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const subtitle = useGlobalMonthSubtitle()

  const { onClickExpand } = interactionProps ?? {}

  const legend = useMemo(
    () => <PnlLegend direction={isDesktop ? 'row' : 'column'} />,
    [isDesktop],
  )

  const resolvedSlots: SummaryCardProps['slots'] = useMemo(() => {
    const resolvedPrimaryAction = onClickExpand
      ? <ExpandSummaryCardButton callback={onClickExpand} ariaLabel={t('common:label.view_details', 'View details')} />
      : undefined

    return {
      title: stringOverrides?.title ?? t('common:label.profit_loss', 'Profit & Loss'),
      subtitle,
      legend: isDesktop ? legend : undefined,
      primaryAction: resolvedPrimaryAction,
    }
  }, [stringOverrides?.title, subtitle, t, onClickExpand, isDesktop, legend])

  return {
    resolvedSlots,
    legend,
    isDesktop,
  }
}

export const ProfitAndLossSummaryCard = ({
  interactionProps,
  stringOverrides,
  className,
}: ProfitAndLossSummaryCardProps) => {
  const { tagFilter } = useContext(ProfitAndLossContext)
  const { resolvedSlots, legend, isDesktop } = useProfitAndLossSummaryCard({ interactionProps, stringOverrides })

  return (
    <SummaryCard
      className={classNames('Layer__ProfitAndLossSummaryCard', className)}
      slots={resolvedSlots}
    >
      <VStack gap='sm'>
        <ProfitAndLossChart tagFilter={tagFilter} hideLegend />
        {!isDesktop && legend}
      </VStack>
    </SummaryCard>
  )
}
