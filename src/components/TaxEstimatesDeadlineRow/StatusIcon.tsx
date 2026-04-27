import type { TFunction } from 'i18next'
import { Check, CircleAlert, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { Span } from '@ui/Typography/Text'

const ICON_SIZE = 14
const ICON_STROKE_WIDTH = 2.25

const getStatusVisuals = (t: TFunction, status: TaxOverviewDeadlineStatus) => {
  switch (status) {
    case TaxOverviewDeadlineStatus.Paid:
      return { Icon: Check, label: t('taxEstimates:label.paid', 'Paid'), tone: 'paid' as const }
    case TaxOverviewDeadlineStatus.PastDue:
      return { Icon: CircleAlert, label: t('taxEstimates:label.past_payment_due', 'Past Payment Due'), tone: 'pastDue' as const }
    case TaxOverviewDeadlineStatus.Due:
      return { Icon: Clock3, label: t('taxEstimates:label.due', 'Due'), tone: 'due' as const }
    case TaxOverviewDeadlineStatus.CategorizationIncomplete:
      return { Icon: CircleAlert, label: t('taxEstimates:label.categorization_incomplete', 'Categorization Incomplete'), tone: 'warning' as const }
    case TaxOverviewDeadlineStatus.Neutral:
    default:
      return { Icon: Clock3, label: t('taxEstimates:label.estimated_taxes', 'Estimated taxes'), tone: 'neutral' as const }
  }
}

export const StatusIcon = ({ status }: { status: TaxOverviewDeadlineStatus }) => {
  const { t } = useTranslation()
  const { Icon, label, tone } = getStatusVisuals(t, status)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Span
          nonAria
          className={`Layer__TaxOverview__AmountIcon Layer__TaxOverview__AmountIcon--${tone}`}
        >
          <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} role='img' aria-label={label} />
        </Span>
      </TooltipTrigger>
      <TooltipContent>
        <Span className='Layer__UI__tooltip-content--text'>
          {label}
        </Span>
      </TooltipContent>
    </Tooltip>
  )
}
