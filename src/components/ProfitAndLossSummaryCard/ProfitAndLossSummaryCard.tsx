import { useContext, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

<<<<<<< HEAD
import { useGlobalMonthSubtitle } from '@hooks/utils/i18n/useGlobalMonthSubtitle'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { VStack } from '@ui/Stack/Stack'
import { ExpandSummaryCardButton } from '@ui/SummaryCard/ExpandSummaryCardButton'
import { SummaryCard, type SummaryCardProps } from '@ui/SummaryCard/SummaryCard'
=======
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { VStack } from '@ui/Stack/Stack'
import { SummaryCard } from '@ui/SummaryCard/SummaryCard'
import {
  type SummaryCardInteractionProps,
  type SummaryCardStringOverrides,
  useSummaryCardSlots,
} from '@ui/SummaryCard/useSummaryCardSlots'
>>>>>>> main
import { ProfitAndLossChart } from '@components/ProfitAndLossChart/ProfitAndLossChart'
import { PnlLegend } from '@components/ProfitAndLossSummaryCard/PnlLegend'

import './profitAndLossSummaryCard.scss'

<<<<<<< HEAD
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
      ? <ExpandSummaryCardButton callback={onClickExpand} ariaLabel={t('common:label.view_label', 'View')} />
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

=======
export type ProfitAndLossSummaryCardProps = {
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
  className?: string
}

>>>>>>> main
export const ProfitAndLossSummaryCard = ({
  interactionProps,
  stringOverrides,
  className,
}: ProfitAndLossSummaryCardProps) => {
<<<<<<< HEAD
  const { tagFilter } = useContext(ProfitAndLossContext)
  const { resolvedSlots, legend, isDesktop } = useProfitAndLossSummaryCard({ interactionProps, stringOverrides })
=======
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
>>>>>>> main

  return (
    <SummaryCard
      className={classNames('Layer__ProfitAndLossSummaryCard', className)}
<<<<<<< HEAD
      slots={resolvedSlots}
=======
      slots={slots}
>>>>>>> main
    >
      <VStack gap='sm'>
        <ProfitAndLossChart tagFilter={tagFilter} hideLegend />
        {!isDesktop && legend}
      </VStack>
    </SummaryCard>
  )
}
