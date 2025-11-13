import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { convertNumberToCurrency } from '@utils/format'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@ui/Button/Button'
import { TaxEstimateAnnualProjection, type TaxEstimateAnnualProjectionProps } from './TaxEstimateAnnualProjection'
import { TaxEstimateDetailSection } from './TaxEstimateDetailSection'

interface QuarterlyEstimate {
  quarter: string
  amount: number
}

const defaultQuarterlyEstimates: QuarterlyEstimate[] = [
  { quarter: 'Q1', amount: 945.52 },
  { quarter: 'Q2', amount: 6654.00 },
  { quarter: 'Q3', amount: 4649.00 },
  { quarter: 'Q4', amount: 6199.00 },
]

const defaultProjectedTaxesOwed = 18448.00
const defaultFederalTaxesOwed = 14816.00
const defaultFederalTaxesPaid = 150.00
const defaultStateTaxesOwed = 3782.00
const defaultStateTaxesPaid = 0.00
const defaultTaxesDueDate = new Date('2022-01-17')

const defaultTaxEstimateAnnualProjectionProps: TaxEstimateAnnualProjectionProps = {
  projectedTaxesOwed: defaultProjectedTaxesOwed,
  taxesDueDate: defaultTaxesDueDate,
  federalTaxesOwed: defaultFederalTaxesOwed,
  federalTaxesPaid: defaultFederalTaxesPaid,
  stateTaxesOwed: defaultStateTaxesOwed,
  stateTaxesPaid: defaultStateTaxesPaid,
}

interface TaxPaymentsProps {
  taxEstimateAnnualProjectionProps?: TaxEstimateAnnualProjectionProps
  quarterlyEstimates?: QuarterlyEstimate[]
}

export const TaxPayments = ({
  taxEstimateAnnualProjectionProps = defaultTaxEstimateAnnualProjectionProps,
  quarterlyEstimates = defaultQuarterlyEstimates,
}: TaxPaymentsProps = {}) => {
  const [selectedYear] = useState('2021')

  return (
    <VStack gap='lg' fluid>
      <HStack justify='space-between' align='center' fluid>
        <VStack>
          <Heading size='lg'>Tax Payments</Heading>
          <Span size='md' variant='subtle'>
            All federal and state taxes for year
            {' '}
            {selectedYear}
            {' '}
            payments will be displayed here.
          </Span>
        </VStack>
      </HStack>
      <VStack gap='md' fluid className='Layer__tax-estimate__overview'>
        <TaxEstimateAnnualProjection {...taxEstimateAnnualProjectionProps} />

        <VStack gap='md' fluid className='Layer__tax-estimate__details-container'>
          <VStack gap='sm' fluid>
            <TaxEstimateDetailSection
              title='Payments'
              headerActions={(
                <HStack gap='md'>
                  <Button variant='ghost' onPress={() => {}}>
                    Schedule C
                    <Download size={16} />
                  </Button>
                  <Button variant='solid' onPress={() => {}}>
                    Record Payment
                  </Button>
                </HStack>
              )}
            >
              {quarterlyEstimates.map(estimate => (
                <HStack key={estimate.quarter} justify='space-between' align='center' fluid className='Layer__tax-estimate__quarter-item'>
                  <Span size='md'>{estimate.quarter}</Span>
                  <Span size='md'>
                    {convertNumberToCurrency(estimate.amount)}
                  </Span>
                </HStack>
              ))}
            </TaxEstimateDetailSection>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}
