import { useTranslation } from 'react-i18next'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Separator } from '@components/Separator/Separator'
import { type CommonTaxPaymentsListProps, getQuarterLabel, type TaxPaymentQuarterWithId } from '@components/TaxPayments/utils'

import './taxPaymentsMobileList.scss'

const TaxPaymentsMobileListItem = ({ payment }: { payment: TaxPaymentQuarterWithId }) => {
  const { t } = useTranslation()
  return (
    <VStack gap='xs' className='Layer__TaxPaymentsMobileListItem'>
      <Heading size='sm' weight='bold' pbe='3xs'>{getQuarterLabel(payment.quarter)}</Heading>
      <VStack gap='3xs'>
        <HStack justify='space-between'>
          <Span size='sm' variant='subtle'>{t('taxEstimates:label.rolled_over_from_previous_quarter', 'Rolled Over From Previous Quarter')}</Span>
          <MoneySpan size='sm' amount={payment.owedRolledOverFromPrevious} />
        </HStack>
        <HStack justify='space-between'>
          <Span size='sm' variant='subtle'>{t('taxEstimates:label.owed_quarter', 'Owed This Quarter')}</Span>
          <MoneySpan size='sm' amount={payment.owedThisQuarter} />
        </HStack>
        <HStack justify='space-between'>
          <Span size='sm' variant='subtle'>{t('taxEstimates:label.total_paid', 'Total Paid')}</Span>
          <MoneySpan size='sm' amount={payment.totalPaid} />
        </HStack>
      </VStack>
      <Separator />
      <HStack justify='space-between'>
        <Span size='md' weight='bold'>{t('taxEstimates:label.remaining_balance', 'Remaining Balance')}</Span>
        <MoneySpan size='md' amount={payment.total} weight='bold' />
      </HStack>
    </VStack>
  )
}

export const TaxPaymentsMobileList = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  const { t } = useTranslation()
  const { EmptyState, ErrorState } = slots

  if (isLoading) {
    return <div className='Layer__TaxPaymentsMobileList'>{t('common:label.loading', 'Loading...')}</div>
  }

  if (isError) {
    return <div className='Layer__TaxPaymentsMobileList'><ErrorState /></div>
  }

  if (!data || data.length === 0) {
    return <div className='Layer__TaxPaymentsMobileList'><EmptyState /></div>
  }

  return (
    <div className='Layer__TaxPaymentsMobileList'>
      {data.map(payment => (
        <TaxPaymentsMobileListItem key={payment.id} payment={payment} />
      ))}
    </div>
  )
}
