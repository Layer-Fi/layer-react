import { Check, CircleAlert, Clock3, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type TaxOverviewDeadline, type TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { DateFormat } from '@utils/i18n/date/patterns'
import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import type { TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'

const getDeadlineAmountTone = (status?: TaxOverviewDeadlineStatus) => {
  switch (status?.kind) {
    case 'pastDue':
      return 'pastDue'
    case 'paid':
      return 'paid'
    case 'due':
      return 'due'
    case 'categorizationIncomplete':
      return 'warning'
    default:
      return 'neutral'
  }
}

const TaxOverviewDeadlineStatusIcon = ({ status }: { status?: TaxOverviewDeadlineStatus }) => {
  const tone = getDeadlineAmountTone(status)
  const Icon = (() => {
    switch (status?.kind) {
      case 'paid':
        return Check
      case 'due':
        return Clock3
      case 'pastDue':
      case 'categorizationIncomplete':
      default:
        return CircleAlert
    }
  })()

  return (
    <Span
      nonAria
      className={`Layer__TaxOverview__AmountIcon Layer__TaxOverview__AmountIcon--${tone}`}
    >
      <Icon size={14} strokeWidth={2.25} />
    </Span>
  )
}

type TaxOverviewDeadlineCardProps = {
  deadline: TaxOverviewDeadline
  onTaxBannerReviewClick?: (payload: TaxBannerReviewPayload) => void
}

export const TaxOverviewDeadlineCard = ({
  deadline,
  onTaxBannerReviewClick,
}: TaxOverviewDeadlineCardProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const reviewAction = deadline.reviewAction

  return (
    <VStack className='Layer__TaxOverview__DeadlineCard' gap='md'>
      <HStack className='Layer__TaxOverview__DeadlineRow' justify='space-between' align='start' gap='md'>
        <VStack className='Layer__TaxOverview__DeadlineContent' gap='3xs'>
          <Heading level={3} size='sm'>{deadline.title}</Heading>
          <Span size='sm' variant='subtle'>
            {t('taxEstimates:label.due_with_date', 'Due: {{date}}', { date: formatDate(deadline.dueAt, DateFormat.DateShort) })}
          </Span>
        </VStack>
        <VStack className='Layer__TaxOverview__DeadlineAmountColumn' align='end' gap='xs'>
          <VStack align='end' gap='3xs'>
            <HStack className='Layer__TaxOverview__DeadlineValueRow' align='center' gap='xs'>
              <TaxOverviewDeadlineStatusIcon status={deadline.status} />
              <MoneySpan size='lg' weight='bold' amount={deadline.amount} />
            </HStack>
            <VStack className='Layer__TaxOverview__DeadlineAmountCopy' align='end' gap='3xs'>
              <Span size='xs' variant='subtle'>{deadline.description}</Span>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
      {reviewAction && (
        <HStack className='Layer__TaxOverview__DeadlineReviewRow' justify='space-between' align='center' gap='md'>
          <HStack className='Layer__TaxOverview__DeadlineReviewContent' align='center' gap='xs'>
            <Span nonAria className='Layer__TaxOverview__DeadlineReviewIcon'>
              <FileText size={12} />
            </Span>
            <Span className='Layer__TaxOverview__DeadlineReviewLabel' size='sm' weight='bold'>
              {tPlural(t, 'taxEstimates:label.uncategorized_transactions', {
                count: reviewAction.payload.count,
                one: '{{count}} uncategorized transaction',
                other: '{{count}} uncategorized transactions',
              })}
            </Span>
          </HStack>
          {onTaxBannerReviewClick && (
            <Button
              variant='outlined'
              onPress={() => onTaxBannerReviewClick(reviewAction.payload)}
            >
              {t('taxEstimates:action.review_banner', 'Review')}
            </Button>
          )}
        </HStack>
      )}
    </VStack>
  )
}
