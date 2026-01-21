import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { TaxPaymentsTable } from '@components/TaxPayments/TaxPaymentsTable'

const TaxPaymentsHeader = () => (
  <VStack gap='3xs'>
    <Heading size='md'>Tax Payments</Heading>
    <Span size='md' variant='subtle'>
      Federal and state tax payments for the selected tax year
    </Span>
  </VStack>
)
export const TaxPayments = () => {
  return (
    <BaseDetailView name='TaxPayments' slots={{ Header: TaxPaymentsHeader }}>
      <TaxPaymentsTable />
    </BaseDetailView>
  )
}
