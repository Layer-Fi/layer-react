import { BigDecimal as BD } from 'effect'
import { Trans, useTranslation } from 'react-i18next'

import { convertBigIntCentsToBigDecimal, convertDecimalToPercent, formatBigDecimalToString, safeDivide } from '@utils/bigDecimalUtils'
import { useInvoiceSummaryStats } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Meter } from '@ui/Meter/Meter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { InvoiceOwedSummaryStatCard } from '@components/Invoices/InvoiceSummaryStats/InvoiceOwedSummaryStatCard'
import { FallbackWithSkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './invoiceOwedSummary.scss'

const getPercentageOverdue = (sentTotal: bigint | undefined, overdueTotal: bigint | undefined): number => {
  if (sentTotal === undefined || overdueTotal === undefined) return 50

  const total = sentTotal + overdueTotal
  if (total === BigInt(0)) return 0

  const totalAsBigDecimal = convertBigIntCentsToBigDecimal(total)
  const overdueTotalAsBigDecimal = convertBigIntCentsToBigDecimal(overdueTotal)

  const decimalOverdue = safeDivide(overdueTotalAsBigDecimal, totalAsBigDecimal)
  const percentOverdue = convertDecimalToPercent(decimalOverdue)

  // This is safe because it will always be less than 100
  return BD.unsafeToNumber(percentOverdue)
}

export const InvoiceOwedSummary = () => {
  const { t } = useTranslation()
  const formatter = useIntlFormatter()
  const { data, isLoading, isError } = useInvoiceSummaryStats()

  const showSkeleton = !data || isLoading || isError
  const { overdueCount, overdueTotal, sentCount, sentTotal } = data?.invoices ?? {}

  const invoicesTotal = (overdueTotal || BigInt(0)) + (sentTotal || BigInt(0))
  const percentageOverdue = getPercentageOverdue(sentTotal, overdueTotal)

  return (
    <VStack className='Layer__InvoiceOwedSummary' gap='sm' fluid>
      <HStack gap='md' align='end' justify='space-between'>
        <HStack align='center' gap='3xs'>
          <Trans
            i18nKey='invoices:label.owed_last_12_months'
            defaults='<owed>Owed to you</owed> <period>last 12 months</period>'
            components={{
              owed: <Span size='sm' pbe='3xs' />,
              period: <Span size='sm' pbe='3xs' variant='subtle' />,
            }}
          />
        </HStack>
        <FallbackWithSkeletonLoader isLoading={showSkeleton} height='24px' width='120px'>
          <Span size='xl' numeric='tabular-nums' noWrap>
            {invoicesTotal !== undefined && formatBigDecimalToString(formatter, convertBigIntCentsToBigDecimal(invoicesTotal), { mode: 'currency' })}
          </Span>
        </FallbackWithSkeletonLoader>
      </HStack>

      <Meter label={t('invoices:label.percentage_invoices_overdue', 'Percentage of invoices overdue')} minValue={0} maxValue={100} value={percentageOverdue} meterOnly className='Layer__InvoiceSummaryStats__Meter' />

      <div className='Layer__InvoiceOwedSummary__StatCards'>
        <InvoiceOwedSummaryStatCard
          variant='overdue'
          label={t('invoices:label.overdue', 'Overdue')}
          total={overdueTotal}
          count={overdueCount}
          showSkeleton={showSkeleton}
        />
        <InvoiceOwedSummaryStatCard
          variant='upcoming'
          label={t('invoices:label.upcoming', 'Upcoming')}
          total={sentTotal}
          count={sentCount}
          showSkeleton={showSkeleton}
        />
      </div>
    </VStack>
  )
}
