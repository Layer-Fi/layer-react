import classNames from 'classnames'
import { BellRing } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import type { SummaryCardProps } from './types'

type NextPaymentBannerProps = Pick<SummaryCardProps, 'nextTax'> & {
  isMobile: boolean
  isSummaryCardLayout: boolean
}

export const NextPaymentBanner = ({
  isMobile,
  isSummaryCardLayout,
  nextTax,
}: NextPaymentBannerProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const nextPaymentLabel = isMobile
    ? t(
      'taxEstimates:label.next_quarter_due_on_short',
      'Q{{quarter}} due {{date}}',
      {
        quarter: nextTax.quarter,
        date: formatDate(nextTax.dueAt),
      },
    )
    : t(
      'taxEstimates:label.next_quarter_payment_due_on',
      'Q{{quarter}} payment due: {{date}}',
      {
        quarter: nextTax.quarter,
        date: formatDate(nextTax.dueAt),
      },
    )

  return (
    <HStack className={classNames('Layer__TaxEstimatesSummaryCard__NextPaymentBanner', isSummaryCardLayout && 'Layer__TaxEstimatesSummaryCard__NextPaymentBanner--summaryCard')} justify='space-between' align='center' gap='md'>
      <HStack className='Layer__TaxEstimatesSummaryCard__NextPaymentCopy' align='center' gap='md'>
        {!isMobile && (
          <Span nonAria className='Layer__TaxEstimatesSummaryCard__NextPaymentIcon'>
            <BellRing size={14} />
          </Span>
        )}
        <Span
          className='Layer__TaxEstimatesSummaryCard__NextPaymentText'
          size='sm'
          weight='bold'
          variant='inherit'
        >
          {nextPaymentLabel}
        </Span>
      </HStack>
      <MoneySpan
        size={isMobile ? 'sm' : 'md'}
        weight='bold'
        amount={nextTax.amount}
        variant='inherit'
      />
    </HStack>
  )
}
