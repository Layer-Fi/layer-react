import { useCallback } from 'react'

import { MobileList } from '@ui/MobileList/MobileList'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Separator } from '@components/Separator/Separator'
import { type CommonTaxPaymentsListProps, getQuarterLabel, type TaxPaymentQuarterWithId } from '@components/TaxPayments/utils'

import './taxPaymentsMobileList.scss'

const TaxPaymentsMobileListItem = ({ payment }: { payment: TaxPaymentQuarterWithId }) => (
  <VStack gap='xs' className='Layer__TaxPaymentsMobileListItem'>
    <Heading size='sm' weight='bold' pbe='3xs'>{getQuarterLabel(payment.quarter)}</Heading>
    <VStack gap='3xs'>
      <HStack justify='space-between'>
        <Span size='sm' variant='subtle'>Rolled Over From Previous Quarter</Span>
        <MoneySpan size='sm' amount={payment.owedRolledOverFromPrevious} />
      </HStack>
      <HStack justify='space-between'>
        <Span size='sm' variant='subtle'>Owed This Quarter</Span>
        <MoneySpan size='sm' amount={payment.owedThisQuarter} />
      </HStack>
      <HStack justify='space-between'>
        <Span size='sm' variant='subtle'>Total Paid</Span>
        <MoneySpan size='sm' amount={payment.totalPaid} />
      </HStack>
    </VStack>
    <Separator />
    <HStack justify='space-between'>
      <Span size='md' weight='bold'>Remaining Balance</Span>
      <MoneySpan size='md' amount={payment.total} weight='bold' />
    </HStack>
  </VStack>
)

export const TaxPaymentsMobileList = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  const renderItem = useCallback(
    (payment: TaxPaymentQuarterWithId) => <TaxPaymentsMobileListItem payment={payment} />,
    [],
  )

  return (
    <div className='Layer__TaxPaymentsMobileList'>
      <MobileList
        ariaLabel='Tax payments'
        data={data}
        isLoading={isLoading}
        isError={isError}
        renderItem={renderItem}
        slots={slots}
      />
    </div>
  )
}
