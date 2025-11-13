import { useState } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Button } from '@ui/Button/Button'
import { ChevronDown, Download } from 'lucide-react'
import { convertNumberToCurrency } from '@utils/format'
import './taxEstimate.scss'
import { TaxEstimateAnnualProjection } from './TaxEstimateAnnualProjection'

interface QuarterlyEstimate {
  quarter: string
  amount: number
}

interface TaxEstimateProps {
  projectedTaxesOwed?: number
  taxesDueDate?: Date
  federalTaxesOwed?: number
  federalTaxesPaid?: number
  stateTaxesOwed?: number
  stateTaxesPaid?: number
  quarterlyEstimates?: QuarterlyEstimate[]
  onNavigateToTaxCalculations?: (type: 'federal' | 'state') => void
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

export const TaxEstimate = ({
  projectedTaxesOwed = defaultProjectedTaxesOwed,
  taxesDueDate = defaultTaxesDueDate,
  federalTaxesOwed = defaultFederalTaxesOwed,
  federalTaxesPaid = defaultFederalTaxesPaid,
  stateTaxesOwed = defaultStateTaxesOwed,
  stateTaxesPaid = defaultStateTaxesPaid,
  quarterlyEstimates = defaultQuarterlyEstimates,
  onNavigateToTaxCalculations,
}: TaxEstimateProps) => {
  const [selectedYear] = useState('2021')

  return (
    <VStack gap='lg' fluid>
      <HStack justify='space-between' align='center' fluid>
        <VStack>
          <Heading size='lg'>Annual Taxes</Heading>
          <Span size='md' variant='subtle'>
            Projected for Year
            {' '}
            {selectedYear}
          </Span>
        </VStack>
      </HStack>
      <VStack gap='md' fluid className='Layer__tax-estimate__overview'>
        <TaxEstimateAnnualProjection
          projectedTaxesOwed={projectedTaxesOwed}
          taxesDueDate={taxesDueDate}
          federalTaxesOwed={federalTaxesOwed}
          federalTaxesPaid={federalTaxesPaid}
          stateTaxesOwed={stateTaxesOwed}
          stateTaxesPaid={stateTaxesPaid}
          onNavigateToTaxCalculations={onNavigateToTaxCalculations}
        />

        <VStack gap='md' fluid className='Layer__tax-estimate__details-container'>
          <HStack justify='space-between' align='end' pb='lg' pi='lg'>
            <Heading size='md'>Payments</Heading>
            <HStack gap='md'>
              <Button variant='ghost' onPress={() => {}}>
                Tax Forms
                <Download size={16} />
              </Button>
              <Button variant='solid' onPress={() => {}}>
                Record Payment
              </Button>
            </HStack>
          </HStack>

          <VStack gap='sm' fluid>
            {quarterlyEstimates.map(estimate => (
              <HStack key={estimate.quarter} justify='space-between' align='center' fluid className='Layer__tax-estimate__quarter-item'>
                <HStack gap='md' align='center'>
                  <ChevronDown size={24} fontWeight='bold' />
                  <Span size='xl' weight='bold'>{estimate.quarter}</Span>

                </HStack>
                <Span size='md'>
                  {convertNumberToCurrency(estimate.amount)}
                </Span>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}
