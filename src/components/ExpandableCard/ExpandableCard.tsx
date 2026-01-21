import { type ReactNode, useCallback, useState } from 'react'
import type React from 'react'

import { AnimatedPresenceDiv } from '@ui/AnimatedPresenceDiv/AnimatedPresenceDiv'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

import './expandableCard.scss'

type ExpandableCardProps = {
  children: ReactNode
  defaultExpanded?: boolean
  slots: {
    Heading: React.FC
  }
}

export const ExpandableCard = ({ children, defaultExpanded = true, slots }: ExpandableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = useCallback(() => setIsExpanded(!isExpanded), [isExpanded])

  return (
    <Card className='Layer__ExpandableCard'>
      <button
        type='button'
        className='Layer__ExpandableCard__Header'
        onClick={toggleExpanded}
      >
        <HStack justify='space-between' align='center'>
          <slots.Heading />
          <ExpandButton isExpanded={isExpanded} onClick={toggleExpanded} />
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
