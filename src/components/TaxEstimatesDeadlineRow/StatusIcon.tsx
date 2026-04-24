import type { TFunction } from 'i18next'
import { Check, CircleAlert, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { Span } from '@ui/Typography/Text'

const getDeadlineAmountTone = (status?: TaxOverviewDeadlineStatus) => {
  switch (status) {
    case TaxOverviewDeadlineStatus.PastDue:
      return 'pastDue'
    case TaxOverviewDeadlineStatus.Paid:
      return 'paid'
    case TaxOverviewDeadlineStatus.Due:
      return 'due'
    case TaxOverviewDeadlineStatus.CategorizationIncomplete:
      return 'warning'
    default:
      return 'neutral'
  }
}

const getDeadlineStatusLabel = (t: TFunction, status?: TaxOverviewDeadlineStatus) => {
  switch (status) {
    case TaxOverviewDeadlineStatus.Paid:
      return t('taxEstimates:label.paid', 'Paid')
    case TaxOverviewDeadlineStatus.PastDue:
      return t('taxEstimates:label.past_payment_due', 'Past Payment Due')
    case TaxOverviewDeadlineStatus.Due:
      return t('taxEstimates:label.due', 'Due')
    case TaxOverviewDeadlineStatus.CategorizationIncomplete:
      return t('taxEstimates:label.categorization_incomplete', 'Categorization Incomplete')
    default:
      return t('common:state.unknown', 'Unknown')
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
          <Icon size={14} strokeWidth={2.25} />
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
