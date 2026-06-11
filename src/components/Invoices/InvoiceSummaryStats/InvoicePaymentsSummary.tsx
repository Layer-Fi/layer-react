import { Check } from 'lucide-react'
import { Trans } from 'react-i18next'

import { convertBigIntCentsToBigDecimal, formatBigDecimalToString } from '@utils/bigDecimalUtils'
import { useInvoiceSummaryStats } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { FallbackWithSkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './invoicePaymentsSummary.scss'

export const InvoicePaymentsSummary = () => {
  const formatter = useIntlFormatter()
  const { data, isLoading, isError } = useInvoiceSummaryStats()

  const showSkeleton = !data || isLoading || isError
  const { sumTotal: invoicePaymentsTotal } = data?.invoicePayments ?? {}

  return (
    <VStack className='Layer__InvoiceSummaryStats__Payments' gap='3xs'>
      <HStack align='center' gap='3xs'>
        <Trans
          i18nKey='invoices:label.paid_last_30_days'
          defaults='<paid>Paid</paid> <period>last 30 days</period>'
          components={{
            paid: <Span size='sm' />,
            period: <Span size='sm' variant='subtle' />,
          }}
        />
      </HStack>
      <HStack align='center' gap='xs'>
        <Badge variant={BadgeVariant.SUCCESS} size={BadgeSize.EXTRA_SMALL} icon={<Check size={11} />} iconOnly />
        <FallbackWithSkeletonLoader isLoading={showSkeleton} height='24px' width='120px'>
          <Span size='xl' numeric='tabular-nums'>
            {invoicePaymentsTotal !== undefined && formatBigDecimalToString(formatter, convertBigIntCentsToBigDecimal(invoicePaymentsTotal), { mode: 'currency' })}
          </Span>
        </FallbackWithSkeletonLoader>
      </HStack>
    </VStack>
  )
}
