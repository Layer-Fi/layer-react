import { type ReactNode } from 'react'

import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

import './expandableCard.scss'

type ExpandableCardProps = {
  children: ReactNode
  isExpanded: boolean
  onToggleExpanded: () => void
  expandButtonPosition?: 'left' | 'right'
  slots: {
    Heading: ReactNode
  }
}

export const ExpandableCard = ({
  children,
  isExpanded,
  onToggleExpanded,
  expandButtonPosition = 'right',
  slots,
}: ExpandableCardProps) => {
  return (
    <Card className='Layer__ExpandableCard'>
      <button
        data-expanded={isExpanded}
        type='button'
        className='Layer__ExpandableCard__Header'
        onClick={onToggleExpanded}
      >
        <HStack justify='space-between' align='center' gap='sm'>
          {expandButtonPosition === 'left' && <ExpandButton isExpanded={isExpanded} />}
          {slots.Heading}
          {expandButtonPosition === 'right' && <ExpandButton isExpanded={isExpanded} />}
        </HStack>
      </button>
      <AnimatedPresenceElement
        motionKey='expandable-content'
        variant='expand'
        isOpen={isExpanded}
        style={{ overflow: 'hidden' }}
      >
        <VStack className='Layer__ExpandableCard__Content'>
          {children}
        </VStack>
      </AnimatedPresenceElement>
    </Card>
  )
}
