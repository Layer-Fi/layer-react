import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

export const TaxDetailsHeader = () => {
  const { isMobile } = useSizeClass()
  return (
    <VStack gap='3xs'>
      <Heading size={isMobile ? 'sm' : 'md'}>Estimated Business Income Taxes</Heading>
      <Span size='md' variant='subtle'>
        Calculated based on your categorized transactions and tracked mileage
      </Span>
    </VStack>
  )
}
