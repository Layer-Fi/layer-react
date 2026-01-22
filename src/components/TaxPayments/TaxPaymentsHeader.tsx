import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

type TaxPaymentsHeaderProps = {
  variant: 'Desktop' | 'Mobile'
}

export const TaxPaymentsHeader = ({ variant }: TaxPaymentsHeaderProps) => (
  <VStack gap='3xs'>
    <Heading size={variant === 'Desktop' ? 'md' : 'sm'}>Tax Payments</Heading>
    <Span size={variant === 'Desktop' ? 'md' : 'sm'} variant='subtle'>
      Federal and state tax payments for the selected tax year
    </Span>
  </VStack>
)
