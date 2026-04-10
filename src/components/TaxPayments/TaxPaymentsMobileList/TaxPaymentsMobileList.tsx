import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type TaxPaymentRow } from '@schemas/taxEstimates/payments'
import { asMutable } from '@utils/asMutable'
import { MobileList } from '@ui/MobileList/MobileList'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Separator } from '@components/Separator/Separator'
import { type CommonTaxPaymentsListProps } from '@components/TaxPayments/utils'

import './taxPaymentsMobileList.scss'

const TaxPaymentsMobileListItem = ({ payment }: { payment: TaxPaymentRow }) => {
  const { t } = useTranslation()
  return (
    <VStack gap='xs' className='Layer__TaxPaymentsMobileListItem'>
      <Heading size='sm' weight='bold' pbe='3xs'>{payment.label}</Heading>
      <VStack gap='3xs'>
        <HStack justify='space-between'>
          <Span size='sm' variant='subtle'>{t('taxEstimates:label.rolled_over_from_previous_quarter', 'Rolled Over From Previous Quarter')}</Span>
          <MoneySpan size='sm' amount={payment.rolledOverFromPrevious} />
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
        <MoneySpan size='md' amount={payment.remainingBalance} weight='bold' />
      </HStack>
    </VStack>
  )
}

type TaxPaymentRowWithId = TaxPaymentRow & { id: string }

export const TaxPaymentsMobileList = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  const { t } = useTranslation()
  const mutableData = data
    ? asMutable(data.map(row => ({ ...row, id: row.rowKey })))
    : undefined
  const renderItem = useCallback(
    (payment: TaxPaymentRowWithId) => <TaxPaymentsMobileListItem payment={payment} />,
    [],
  )

  return (
    <div className='Layer__TaxPaymentsMobileList'>
      <MobileList
        ariaLabel={t('taxEstimates:label.tax_payments', 'Tax Payments')}
        data={mutableData}
        isLoading={isLoading}
        isError={isError}
        renderItem={renderItem}
        slots={slots}
      />
    </div>
  )
}
