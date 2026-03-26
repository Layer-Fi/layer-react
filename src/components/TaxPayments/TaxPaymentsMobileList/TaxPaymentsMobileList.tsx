import { useTranslation } from 'react-i18next'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Separator } from '@components/Separator/Separator'
import { type CommonTaxPaymentsListProps, getQuarterLabel, type TaxPaymentQuarterWithId } from '@components/TaxPayments/utils'

import './taxPaymentsMobileList.scss'

type TaxBreakdownItem = {
  label: string
  amount: number
}

const TaxPaymentsBreakdown = ({ items }: { items: TaxBreakdownItem[] }) => (
  <VStack gap='3xs' className='Layer__TaxPaymentsMobileListItem__Breakdown'>
    {items.map(item => (
      <HStack key={item.label} justify='space-between' className='Layer__TaxPaymentsMobileListItem__BreakdownRow'>
        <Span size='sm' variant='subtle'>{item.label}</Span>
        <MoneySpan size='sm' variant='subtle' amount={item.amount} />
      </HStack>
    ))}
  </VStack>
)

const TaxPaymentsMobileListItem = ({ payment }: { payment: TaxPaymentQuarterWithId }) => {
  const { t } = useTranslation()
  const federalTaxLabel = t('taxEstimates:label.federal_tax', 'Federal Tax')
  const stateTaxLabel = t('taxEstimates:label.state_tax', 'State Tax')
  const uncategorizedLabel = t('common:label.uncategorized', 'Uncategorized')

  return (
    <VStack gap='xs' className='Layer__TaxPaymentsMobileListItem'>
      <Heading size='sm' weight='bold' pbe='3xs'>{getQuarterLabel(payment.quarter)}</Heading>
      <VStack gap='3xs'>
        <HStack justify='space-between'>
          <Span size='sm' variant='subtle'>{t('taxEstimates:label.rolled_over_from_previous_quarter', 'Rolled Over From Previous Quarter')}</Span>
          <MoneySpan size='sm' amount={payment.owedRolledOverFromPrevious} />
        </HStack>
        <VStack gap='3xs'>
          <TaxPaymentsBreakdown
            items={[
              { label: federalTaxLabel, amount: payment.owedThisQuarterBreakdown.usFederal },
              { label: stateTaxLabel, amount: payment.owedThisQuarterBreakdown.usState },
            ]}
          />
          <Separator />
          <HStack justify='space-between'>
            <Span size='sm' variant='subtle'>{t('taxEstimates:label.owed_quarter', 'Owed This Quarter')}</Span>
            <MoneySpan size='md' amount={payment.owedThisQuarter} />
          </HStack>
        </VStack>
        <VStack gap='3xs'>
          <TaxPaymentsBreakdown
            items={[
              { label: federalTaxLabel, amount: payment.totalPaidBreakdown.usFederal },
              { label: stateTaxLabel, amount: payment.totalPaidBreakdown.usState },
              { label: uncategorizedLabel, amount: payment.totalPaidBreakdown.uncategorized },
            ]}
          />
          <Separator />
          <HStack justify='space-between'>
            <Span size='sm' variant='subtle'>{t('taxEstimates:label.total_paid', 'Total Paid')}</Span>
            <MoneySpan size='md' amount={payment.totalPaid} />
          </HStack>
        </VStack>
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
    return <VStack className='Layer__TaxPaymentsMobileList'>{t('common:label.loading', 'Loading...')}</VStack>
  }

  if (isError) {
    return <VStack className='Layer__TaxPaymentsMobileList'><ErrorState /></VStack>
  }

  if (!data || data.length === 0) {
    return <VStack className='Layer__TaxPaymentsMobileList'><EmptyState /></VStack>
  }

  return (
    <VStack className='Layer__TaxPaymentsMobileList' gap='sm'>
      {data.map(payment => (
        <TaxPaymentsMobileListItem key={payment.id} payment={payment} />
      ))}
    </VStack>
  )
}
