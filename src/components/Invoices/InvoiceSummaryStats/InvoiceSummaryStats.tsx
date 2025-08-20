import { useInvoiceSummaryStats } from '../../../features/invoices/api/useInvoiceSummaryStats'
import Check from '../../../icons/Check'
import { convertBigIntCentsToBigDecimal, convertDecimalToPercent, formatBigDecimalToString, safeDivide } from '../../../utils/bigDecimalUtils'
import { Badge, BadgeSize, BadgeVariant } from '../../Badge/Badge'
import { BadgeLoader } from '../../BadgeLoader/BadgeLoader'
import { FallbackWithSkeletonLoader } from '../../SkeletonLoader/SkeletonLoader'
import { Meter } from '../../ui/Meter/Meter'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { Span } from '../../ui/Typography/Text'
import { BigDecimal as BD } from 'effect'

const getPercentageOverdue = (sentTotal: bigint | undefined, overdueTotal: bigint | undefined): number => {
  if (!sentTotal && !overdueTotal) return 50
  if (!sentTotal) return 100
  if (!overdueTotal) return 0

  const totalAsBigDecimal = convertBigIntCentsToBigDecimal(sentTotal + overdueTotal)
  const overdueTotalAsBigDecimal = convertBigIntCentsToBigDecimal(overdueTotal)

  const decimalOverdue = safeDivide(overdueTotalAsBigDecimal, totalAsBigDecimal)
  const percentOverdue = convertDecimalToPercent(decimalOverdue)

  // This is safe because it will always be less than 100
  return BD.unsafeToNumber(percentOverdue)
}

export const InvoiceSummaryStats = () => {
  const { data, isLoading, isError } = useInvoiceSummaryStats()

  const showSkeleton = !data || isLoading || isError
  const { sumTotal: invoicePaymentsTotal } = data?.invoicePayments ?? {}
  const { overdueCount, overdueTotal, sentCount, sentTotal } = data?.invoices ?? {}

  const invoicesTotal = (overdueTotal || BigInt(0)) + (sentTotal || BigInt(0))
  const percentageOverdue = getPercentageOverdue(sentTotal, overdueTotal)

  return (
    <HStack className='Layer__InvoiceSummaryStats__Container' gap='lg'>
      <VStack className='Layer__InvoiceSummaryStats__Payments' gap='3xs'>
        <HStack align='center'>
          <Span size='sm'>Paid</Span>
          &nbsp;
          <Span size='sm' variant='subtle'>last 30 days</Span>
        </HStack>
        <HStack align='center' gap='xs'>
          <Badge variant={BadgeVariant.SUCCESS} size={BadgeSize.EXTRA_SMALL} icon={<Check size={11} />} iconOnly />
          <FallbackWithSkeletonLoader isLoading={showSkeleton} height='24px' width='120px'>
            <Span size='xl'>
              {invoicePaymentsTotal !== undefined && formatBigDecimalToString(convertBigIntCentsToBigDecimal(invoicePaymentsTotal), { mode: 'currency' })}
            </Span>
          </FallbackWithSkeletonLoader>
        </HStack>
      </VStack>
      <VStack gap='sm' fluid>
        <HStack gap='md' align='end'>
          <HStack align='center'>
            <Span size='sm' pbe='3xs'>Owed to you</Span>
            &nbsp;
            <Span size='sm' pbe='3xs' variant='subtle'>last 12 months</Span>
          </HStack>
          <FallbackWithSkeletonLoader isLoading={showSkeleton} height='24px' width='120px'>
            <Span size='xl'>
              {invoicesTotal !== undefined && formatBigDecimalToString(convertBigIntCentsToBigDecimal(invoicesTotal), { mode: 'currency' })}
            </Span>
          </FallbackWithSkeletonLoader>
        </HStack>
        <HStack justify='space-between'>
          <HStack gap='xs' align='center'>
            <FallbackWithSkeletonLoader isLoading={showSkeleton} height='17px' width='80px'>
              <Span size='md'>
                {overdueTotal !== undefined && formatBigDecimalToString(convertBigIntCentsToBigDecimal(overdueTotal), { mode: 'currency' })}
              </Span>
            </FallbackWithSkeletonLoader>
            {!showSkeleton && overdueCount !== undefined
              ? (
                <Badge variant={BadgeVariant.WARNING} size={BadgeSize.SMALL}>
                  {`Overdue invoices: ${overdueCount}`}
                </Badge>
              )
              : <BadgeLoader variant={BadgeVariant.WARNING} showLoading />}
          </HStack>
          <HStack gap='xs' align='center'>
            {!showSkeleton && sentCount !== undefined
              ? (
                <Badge variant={BadgeVariant.INFO} size={BadgeSize.SMALL}>
                  {`Upcoming invoices: ${sentCount}`}
                </Badge>
              )
              : <BadgeLoader variant={BadgeVariant.INFO} showLoading />}
            <FallbackWithSkeletonLoader isLoading={showSkeleton} height='17px' width='80px'>
              <Span size='md'>
                {sentTotal !== undefined && formatBigDecimalToString(convertBigIntCentsToBigDecimal(sentTotal), { mode: 'currency' })}
              </Span>
            </FallbackWithSkeletonLoader>
          </HStack>
        </HStack>
        <Meter label='Invoices meter' minValue={0} maxValue={100} value={percentageOverdue} meterOnly className='Layer__InvoiceSummaryStats__Meter' />
      </VStack>
    </HStack>
  )
}
