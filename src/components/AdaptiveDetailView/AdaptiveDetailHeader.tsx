import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

type AdaptiveDetailHeaderProps = {
  title: string
  description: string
}

export const AdaptiveDetailHeader = ({ title, description }: AdaptiveDetailHeaderProps) => {
  const { isDesktop } = useSizeClass()
  return (
    <VStack gap='3xs'>
      <Heading size={isDesktop ? 'md' : 'sm'}>{title}</Heading>
      <Span size={isDesktop ? 'md' : 'sm'} variant='subtle'>
        {description}
      </Span>
    </VStack>
  )
}
