import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useGlobalLabels } from '@hooks/utils/i18n/useGlobalMonthSubtitle'
import { ExpandSummaryCardButton } from '@ui/SummaryCard/ExpandSummaryCardButton'
import { type SummaryCardProps } from '@ui/SummaryCard/SummaryCard'

export type SummaryCardInteractionProps = {
  onClickExpand?: () => void
}

export type SummaryCardStringOverrides = {
  title?: string
}

type UseSummaryCardSlotsParams = {
  defaultTitle: string
  legend?: ReactNode
  subtitleMode?: 'monthYear' | 'year'
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
}

export const useSummaryCardSlots = ({
  defaultTitle,
  legend,
  interactionProps,
  subtitleMode = 'monthYear',
  stringOverrides,
}: UseSummaryCardSlotsParams): SummaryCardProps['slots'] => {
  const { t } = useTranslation()
  const { monthYear, year } = useGlobalLabels()
  const { onClickExpand } = interactionProps ?? {}

  return useMemo(() => {
    const primaryAction = onClickExpand
      ? <ExpandSummaryCardButton callback={onClickExpand} ariaLabel={t('common:label.view_label', 'View')} />
      : undefined

    return {
      title: stringOverrides?.title ?? defaultTitle,
      subtitle: subtitleMode === 'monthYear' ? monthYear : year,
      legend,
      primaryAction,
    }
  }, [stringOverrides?.title, defaultTitle, subtitleMode, monthYear, year, legend, onClickExpand, t])
}
