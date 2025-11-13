import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Button } from '@ui/Button/Button'
import { convertNumberToCurrency } from '@utils/format'
import { Separator } from '@components/Separator/Separator'
import './taxEstimate.scss'

interface TaxEstimateAnnualProjectionProps {
  projectedTaxesOwed: number
  taxesDueDate: Date
  federalTaxesOwed: number
  federalTaxesPaid: number
  stateTaxesOwed: number
  stateTaxesPaid: number
  onNavigateToTaxCalculations?: (type: 'federal' | 'state') => void
}

export const TaxEstimateAnnualProjection = ({
  projectedTaxesOwed,
  taxesDueDate,
  federalTaxesOwed,
  federalTaxesPaid,
  stateTaxesOwed,
  stateTaxesPaid,
  onNavigateToTaxCalculations,
}: TaxEstimateAnnualProjectionProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleTaxCalculationsClick = (type: 'federal' | 'state') => {
    if (onNavigateToTaxCalculations) {
      onNavigateToTaxCalculations(type)
    }
  }

  return (
    <HStack fluid className='Layer__tax-estimate__overview-container'>
      <VStack gap='xs' justify='center' align='center' className='Layer__tax-estimate__overview-total'>
        <Span size='md' weight='bold'>
          Projected Taxes Owed
        </Span>
        <Heading size='lg' className='Layer__tax-estimate__projected-amount'>{convertNumberToCurrency(projectedTaxesOwed)}</Heading>
        <VStack gap='xs' className='Layer__tax-estimate__due-date'>
          <Span size='sm' variant='subtle'>Taxes Due</Span>
          <Span size='sm'>{formatDate(taxesDueDate)}</Span>
        </VStack>
      </VStack>

      <VStack align='start' className='Layer__tax-estimate__breakdown'>
        <VStack gap='2xl' align='start' className='Layer__tax-estimate__tax-row'>
          <Span size='md' variant='subtle'>
            Federal & self-employed taxes
          </Span>
          <HStack gap='lg' align='start'>
            <VStack gap='xs' align='center'>
              <Heading size='lg' className='Layer__tax-estimate__projected-amount'>{convertNumberToCurrency(federalTaxesOwed - federalTaxesPaid)}</Heading>
              <Span size='md' className='Layer__tax-estimate__row-label'>
                Total
              </Span>
            </VStack>
            <Span size='xl' variant='subtle'>=</Span>
            <VStack gap='xs' justify='center' align='center'>
              <Heading size='lg' className='Layer__tax-estimate__projected-amount'>{convertNumberToCurrency(federalTaxesOwed)}</Heading>
              <Span size='sm' variant='subtle'>
                {onNavigateToTaxCalculations
                  ? (
                    <Button
                      variant='outlined'
                      size='md'
                      inset
                      onPress={() => {
                        handleTaxCalculationsClick('federal')
                      }}
                    >
                      Taxes Owed
                    </Button>
                  )
                  : (
                    <Button
                      variant='outlined'
                      size='md'
                      inset
                      isDisabled
                    >
                      Taxes Owed
                    </Button>
                  )}
              </Span>
            </VStack>
            <Span size='xl' variant='subtle'>-</Span>
            <VStack gap='xs' justify='center' align='center'>
              <Heading size='lg' className='Layer__tax-estimate__projected-amount'>{convertNumberToCurrency(federalTaxesPaid)}</Heading>
              <Span size='sm' variant='subtle'>
                {onNavigateToTaxCalculations
                  ? (
                    <Button
                      variant='outlined'
                      size='md'
                      inset
                      onPress={() => {
                        handleTaxCalculationsClick('federal')
                      }}
                    >
                      Taxes Paid
                    </Button>
                  )
                  : (
                    <Button
                      variant='outlined'
                      size='md'
                      inset
                      isDisabled
                    >
                      Taxes Paid
                    </Button>
                  )}
              </Span>
            </VStack>
          </HStack>

        </VStack>
        <Separator />
        <VStack gap='2xl' align='start' className='Layer__tax-estimate__tax-row'>
          <Span size='md' variant='subtle'>
            State taxes
          </Span>
          <HStack gap='lg' align='start'>
            <VStack gap='xs' align='center'>
              <Heading size='lg' className='Layer__tax-estimate__projected-amount'>{convertNumberToCurrency(stateTaxesOwed - stateTaxesPaid)}</Heading>
              <Span size='md' className='Layer__tax-estimate__row-label'>
                Total
              </Span>
            </VStack>
            <Span size='xl' variant='subtle'>=</Span>
            <VStack gap='xs' justify='center' align='center'>
              <Heading size='lg' className='Layer__tax-estimate__projected-amount'>{convertNumberToCurrency(stateTaxesOwed)}</Heading>
              <Span size='sm' variant='subtle'>
                {onNavigateToTaxCalculations
                  ? (
                    <Button
                      variant='outlined'
                      size='md'
                      inset
                      onPress={() => {
                        handleTaxCalculationsClick('state')
                      }}
                    >
                      Taxes Owed
                    </Button>
                  )
                  : (
                    <Button
                      variant='outlined'
                      size='md'
                      inset
                      isDisabled
                    >
                      Taxes Owed
                    </Button>
                  )}
              </Span>
            </VStack>
            <Span size='xl' variant='subtle'>-</Span>
            <VStack gap='xs' justify='center' align='center'>
              <Heading size='lg' className='Layer__tax-estimate__projected-amount'>{convertNumberToCurrency(stateTaxesPaid)}</Heading>
              <Span size='sm' variant='subtle'>
                {onNavigateToTaxCalculations
                  ? (
                    <Button
                      variant='outlined'
                      size='md'
                      inset
                      onPress={() => {
                        handleTaxCalculationsClick('state')
                      }}
                    >
                      Taxes Paid
                    </Button>
                  )
                  : (
                    <Button
                      variant='outlined'
                      size='md'
                      inset
                      isDisabled
                    >
                      Taxes Paid
                    </Button>
                  )}
              </Span>
            </VStack>
          </HStack>

        </VStack>
      </VStack>
    </HStack>
  )
}
