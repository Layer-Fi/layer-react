import { type ReactNode } from 'react'

import { Card } from '@ui/Card/Card'
import { ExpandButton } from '@ui/ExpandButton/ExpandButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { AnimatedPresenceElement } from '@components/utility/AnimatedPresenceElement/AnimatedPresenceElement'

import './expandableCard.scss'

type ExpandableCardProps = {
  children: ReactNode
  isExpanded: boolean
  onToggleExpanded: () => void
  slots: {
    Heading: ReactNode
  }
}

export const ExpandableCard = ({
  children,
  isExpanded,
  onToggleExpanded,
  slots,
}: ExpandableCardProps) => {
  return (
    <Card className='Layer__ExpandableCard'>
      <button
        type='button'
        className='Layer__ExpandableCard__Header'
        onClick={onToggleExpanded}
      >
        <HStack justify='space-between' align='center'>
          {slots.Heading}
          <ExpandButton isExpanded={isExpanded} />
        </HStack>
      </button>
      <AnimatedPresenceElement
        motionKey='expandable-content'
        variant='expand'
        isPresent={isExpanded}
        style={{ overflow: 'hidden' }}
      >
        <VStack className='Layer__ExpandableCard__Content'>
          {children}
        </VStack>
      </AnimatedPresenceElement>
    </Card>
  )
}
