import type { TFunction } from 'i18next'
import { Check, CircleAlert, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { Span } from '@ui/Typography/Text'

const ICON_SIZE = 14
const ICON_STROKE_WIDTH = 2.25

const getDeadlineAmountTone = (status: TaxOverviewDeadlineStatus) => {
  switch (status) {
    case TaxOverviewDeadlineStatus.PastDue:
      return 'pastDue'
    case TaxOverviewDeadlineStatus.Paid:
      return 'paid'
    case TaxOverviewDeadlineStatus.Due:
      return 'due'
    case TaxOverviewDeadlineStatus.CategorizationIncomplete:
      return 'warning'
    case TaxOverviewDeadlineStatus.Neutral:
    default:
      return 'neutral'
  }
}

const getDeadlineStatusLabel = (t: TFunction, status: TaxOverviewDeadlineStatus) => {
  switch (status) {
    case TaxOverviewDeadlineStatus.Paid:
      return t('taxEstimates:label.paid', 'Paid')
    case TaxOverviewDeadlineStatus.PastDue:
      return t('taxEstimates:label.past_payment_due', 'Past Payment Due')
    case TaxOverviewDeadlineStatus.Due:
      return t('taxEstimates:label.due', 'Due')
    case TaxOverviewDeadlineStatus.CategorizationIncomplete:
      return t('taxEstimates:label.categorization_incomplete', 'Categorization Incomplete')
    case TaxOverviewDeadlineStatus.Neutral:
    default:
      return t('taxEstimates:label.estimated_taxes', 'Estimated taxes')
  }
}

const getDeadlineStatusIcon = (status: TaxOverviewDeadlineStatus) => {
  switch (status) {
    case TaxOverviewDeadlineStatus.Paid:
      return Check
    case TaxOverviewDeadlineStatus.PastDue:
    case TaxOverviewDeadlineStatus.CategorizationIncomplete:
      return CircleAlert
    case TaxOverviewDeadlineStatus.Due:
    case TaxOverviewDeadlineStatus.Neutral:
    default:
      return Clock3
  }
}

export const StatusIcon = ({ status }: { status: TaxOverviewDeadlineStatus }) => {
  const { t } = useTranslation()
  const tone = getDeadlineAmountTone(status)
  const Icon = getDeadlineStatusIcon(status)
  const label = getDeadlineStatusLabel(t, status)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Span
          nonAria
          className={`Layer__TaxOverview__AmountIcon Layer__TaxOverview__AmountIcon--${tone}`}
        >
          <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />
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
