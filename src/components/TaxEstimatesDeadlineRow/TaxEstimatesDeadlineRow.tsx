import { useMemo } from 'react'
import classNames from 'classnames'
import { Check, CircleAlert, Clock3, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type TaxOverviewBannerReview, TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { DateFormat } from '@utils/i18n/date/patterns'
import { tPlural } from '@utils/i18n/plural'
import { type TaxEstimateDeadlineRow } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxDeadlines'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'

import '@components/TaxEstimatesDeadlineRow/taxEstimatesDeadlineRow.scss'

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

const AMOUNT_ICON_CLASS_MAP = {
  due: 'Layer__TaxOverview__AmountIcon--due',
  neutral: 'Layer__TaxOverview__AmountIcon--neutral',
  paid: 'Layer__TaxOverview__AmountIcon--paid',
  pastDue: 'Layer__TaxOverview__AmountIcon--pastDue',
  warning: 'Layer__TaxOverview__AmountIcon--warning',
} as const

const StatusIcon = ({ status }: { status: TaxOverviewDeadlineStatus }) => {
  const { t } = useTranslation()
  const tone = getDeadlineAmountTone(status)
  const Icon = (() => {
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
  })()

  const label = useMemo(() => {
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
  }, [status, t])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Span
          nonAria
          className={classNames('Layer__TaxOverview__AmountIcon', AMOUNT_ICON_CLASS_MAP[tone])}
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

type TaxEstimatesDeadlineRowProps = {
  data: TaxEstimateDeadlineRow
  onTaxBannerReviewClick?: (payload: TaxOverviewBannerReview) => void
}

export const TaxEstimatesDeadlineRow = ({
  data,
  onTaxBannerReviewClick,
}: TaxEstimatesDeadlineRowProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()

  return (
    <Card className='Layer__TaxOverview__Card'>
      <HStack className='Layer__TaxOverview__DeadlineRow' justify='space-between' align='start' gap='md'>
        <VStack className='Layer__TaxOverview__DeadlineContent' gap='3xs'>
          <Heading level={3} size='sm'>{data.title}</Heading>
          <Span size='sm' variant='subtle'>
            {t('taxEstimates:label.due_with_date', 'Due: {{date}}', { date: formatDate(data.dueDate, DateFormat.DateShort) })}
          </Span>
        </VStack>
        <VStack className='Layer__TaxOverview__DeadlineAmountColumn' align='end' gap='xs'>
          <VStack align='end' gap='3xs'>
            <HStack className='Layer__TaxOverview__DeadlineValueRow' align='center' gap='sm'>
              <StatusIcon status={data.status} />
              <MoneySpan size='lg' weight='bold' amount={data.amount} />
            </HStack>
            <VStack className='Layer__TaxOverview__DeadlineAmountCopy' align='end' gap='3xs'>
              <Span size='xs' variant='subtle'>{t('taxEstimates:label.estimated_taxes', 'Estimated taxes')}</Span>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
      {data.uncategorizedCount > 0 && (
        <HStack className='Layer__TaxOverview__DeadlineReviewRow' justify='space-between' align='center' gap='md'>
          <HStack className='Layer__TaxOverview__DeadlineReviewContent' align='center' gap='xs'>
            <Span nonAria className='Layer__TaxOverview__DeadlineReviewIcon'>
              <FileText size={12} />
            </Span>
            <Span className='Layer__TaxOverview__DeadlineReviewLabel' size='sm' weight='bold'>
              {tPlural(t, 'taxEstimates:label.uncategorized_transactions', {
                count: data.uncategorizedCount,
                one: '{{count}} uncategorized transaction',
                other: '{{count}} uncategorized transactions',
              })}
            </Span>
          </HStack>
          {onTaxBannerReviewClick && (
            <Button
              variant='outlined'
              onPress={() => onTaxBannerReviewClick({
                amount: data.uncategorizedSum,
                count: data.uncategorizedCount,
                type: 'UNCATEGORIZED_TRANSACTIONS',
              })}
            >
              {t('taxEstimates:action.review_banner', 'Review')}
            </Button>
          )}
        </HStack>
      )}
    </Card>
  )
}
