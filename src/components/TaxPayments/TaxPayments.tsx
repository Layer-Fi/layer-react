import { useCallback } from 'react'

import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { TaxPaymentsTable } from '@components/TaxPayments/TaxPaymentsTable'

export const TaxPayments = () => {
  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'year' })
  const selectedYear = startDate.getFullYear()

  const TaxPaymentsHeader = useCallback(() => (
    <VStack gap='3xs'>
      <Heading size='md'>Tax Payments</Heading>
      <Span size='md' variant='subtle'>
        Federal and state tax payments for the
        {' '}
        {selectedYear}
        {' '}
        tax year
      </Span>
    </VStack>
  ), [selectedYear])

  return (
    <BaseDetailView name='TaxPayments' slots={{ Header: TaxPaymentsHeader }}>
      <TaxPaymentsTable />
    </BaseDetailView>
  )
}
