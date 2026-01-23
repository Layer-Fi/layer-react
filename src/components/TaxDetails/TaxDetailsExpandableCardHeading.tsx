import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { HStack, Spacer } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { MoneySpan } from '@ui/Typography/MoneySpan'

type TaxDetailsExpandableCardHeadingProps = {
  title: string
  amount: number
}

export const TaxDetailsExpandableCardHeading = ({ title, amount }: TaxDetailsExpandableCardHeadingProps) => {
  const { isMobile } = useSizeClass()
  return (
    <HStack className='Layer__TaxDetails__CardHeading' pie='xs' gap='xs'>
      <Heading size={isMobile ? 'sm' : 'md'}>{title}</Heading>
      <Spacer />
      <MoneySpan size='xl' weight='bold' amount={amount} />
    </HStack>
  )
}
