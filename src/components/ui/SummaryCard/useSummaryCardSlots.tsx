import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DateFormat } from '@utils/i18n/date/patterns'
import { useGlobalDateFormatter } from '@hooks/utils/i18n/useGlobalDateFormatter'
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
  subtitleDateFormat?: DateFormat
  interactionProps?: SummaryCardInteractionProps
  stringOverrides?: SummaryCardStringOverrides
}

export const useSummaryCardSlots = ({
  defaultTitle,
  legend,
  interactionProps,
  subtitleDateFormat = DateFormat.MonthYear,
  stringOverrides,
}: UseSummaryCardSlotsParams): SummaryCardProps['slots'] => {
  const { t } = useTranslation()
  const formatGlobalDate = useGlobalDateFormatter()
  const { onClickExpand } = interactionProps ?? {}

  return useMemo(() => {
    const primaryAction = onClickExpand
      ? <ExpandSummaryCardButton callback={onClickExpand} ariaLabel={t('common:label.view_label', 'View')} />
      : undefined

    return {
      title: stringOverrides?.title ?? defaultTitle,
      subtitle: formatGlobalDate(subtitleDateFormat),
      legend,
      primaryAction,
    }
  }, [stringOverrides?.title, defaultTitle, subtitleDateFormat, formatGlobalDate, legend, onClickExpand, t])
}
