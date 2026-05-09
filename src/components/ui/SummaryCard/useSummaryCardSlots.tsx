import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useGlobalMonthSubtitle } from '@hooks/utils/i18n/useGlobalMonthSubtitle'
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
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
}

export const useSummaryCardSlots = ({
  defaultTitle,
  legend,
  interactionProps,
  stringOverrides,
}: UseSummaryCardSlotsParams): SummaryCardProps['slots'] => {
  const { t } = useTranslation()
  const subtitle = useGlobalMonthSubtitle()
  const { onClickExpand } = interactionProps ?? {}

  return useMemo(() => {
    const primaryAction = onClickExpand
      ? <ExpandSummaryCardButton callback={onClickExpand} ariaLabel={t('common:label.view_label', 'View')} />
      : undefined

    return {
      title: stringOverrides?.title ?? defaultTitle,
      subtitle,
      legend,
      primaryAction,
    }
  }, [stringOverrides?.title, defaultTitle, subtitle, legend, onClickExpand, t])
}
