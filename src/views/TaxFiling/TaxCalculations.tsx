import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

interface TaxCalculationsProps {
  type?: 'federal' | 'state'
}

export const TaxCalculations = ({ type }: TaxCalculationsProps) => {
  return (
    <VStack gap='lg' fluid>
      <Heading size='lg'>Tax Calculations</Heading>
      <Span size='md' variant='subtle'>
        {type === 'federal' ? 'Federal & Self-employed taxes' : 'State taxes'}
        {' '}
        calculations will be displayed here.
      </Span>
    </VStack>
  )
}
