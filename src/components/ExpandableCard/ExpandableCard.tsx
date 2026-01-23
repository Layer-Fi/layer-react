import { type ReactNode } from 'react'

import { AnimatedPresenceDiv } from '@ui/AnimatedPresenceDiv/AnimatedPresenceDiv'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

import './expandableCard.scss'

type ExpandableCardProps = {
  children: ReactNode
  isExpanded: boolean
  onToggle: () => void
  slots: {
    Heading: ReactNode
  }
}

export const ExpandableCard = ({
  children,
  isExpanded,
  onToggle,
  slots,
}: ExpandableCardProps) => {
  return (
    <Card className='Layer__ExpandableCard'>
      <button
        type='button'
        className='Layer__ExpandableCard__Header'
        onClick={onToggle}
      >
        <HStack justify='space-between' align='center'>
          {slots.Heading}
          <ExpandButton isExpanded={isExpanded} />
        </HStack>
      </button>
      <AnimatedPresenceDiv
        key='expandable-content'
        variant='expand'
        isOpen={isExpanded}
        style={{ overflow: 'hidden' }}
      >
        <VStack className='Layer__ExpandableCard__Content'>
          {children}
        </VStack>
      </AnimatedPresenceDiv>
    </Card>
  )
}
