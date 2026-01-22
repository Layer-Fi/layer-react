import { VStack } from '@ui/Stack/Stack'
import { TaxPaymentsHeader } from '@components/TaxPayments/TaxPaymentsHeader'
import { TaxPaymentsMobileList } from '@components/TaxPayments/TaxPaymentsMobileList/TaxPaymentsMobileList'
import type { CommonTaxPaymentsListProps } from '@components/TaxPayments/utils'

export const TaxPaymentsMobileView = (props: CommonTaxPaymentsListProps) => {
  return (
    <VStack gap='xs'>
      <TaxPaymentsHeader variant='Mobile' />
      <TaxPaymentsMobileList {...props} />
    </VStack>
  )
}
