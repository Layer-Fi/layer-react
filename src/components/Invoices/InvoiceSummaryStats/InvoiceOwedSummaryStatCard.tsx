import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { convertBigIntCentsToBigDecimal, formatBigDecimalToString } from '@utils/bigDecimalUtils'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { FallbackWithSkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './invoiceOwedSummaryStatCard.scss'

interface InvoiceOwedSummaryStatCardProps {
  variant: 'overdue' | 'upcoming'
  label: string
  total: bigint | undefined
  count: number | undefined
  showSkeleton: boolean
}

export const InvoiceOwedSummaryStatCard = ({ variant, label, total, count, showSkeleton }: InvoiceOwedSummaryStatCardProps) => {
  const { t } = useTranslation()
  const formatter = useIntlFormatter()

  return (
    <div className='Layer__InvoiceOwedSummary__StatCard'>
      <HStack className='Layer__InvoiceOwedSummary__StatCard__Status' align='center' gap='2xs'>
        <span className={classNames('Layer__InvoiceOwedSummary__StatCard__Dot', `Layer__InvoiceOwedSummary__StatCard__Dot--${variant}`)} aria-hidden='true' />
        <Span size='sm'>{label}</Span>
      </HStack>
      <div className='Layer__InvoiceOwedSummary__StatCard__Count'>
        <FallbackWithSkeletonLoader isLoading={showSkeleton} height='14px' width='60px'>
          <Span size='sm' variant='subtle'>
            {count !== undefined && t('invoices:label.invoices_count', '{{count}} invoices', { count })}
          </Span>
        </FallbackWithSkeletonLoader>
      </div>
      <div className='Layer__InvoiceOwedSummary__StatCard__Total'>
        <FallbackWithSkeletonLoader isLoading={showSkeleton} height='20px' width='90px'>
          <Span size='lg' numeric='tabular-nums' noWrap>
            {total !== undefined && formatBigDecimalToString(formatter, convertBigIntCentsToBigDecimal(total), { mode: 'currency' })}
          </Span>
        </FallbackWithSkeletonLoader>
      </div>
    </div>
  )
}
