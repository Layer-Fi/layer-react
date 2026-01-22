import { type ReactNode, useCallback, useState } from 'react'

import { AnimatedPresenceDiv } from '@ui/AnimatedPresenceDiv/AnimatedPresenceDiv'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

import './expandableCard.scss'

type ExpandableCardProps = {
  children: ReactNode
  defaultExpanded?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  slots: {
    Heading: ReactNode
  }
}

export const ExpandableCard = ({
  children,
  defaultExpanded = true,
  isExpanded: controlledIsExpanded,
  onToggle,
  slots,
}: ExpandableCardProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)

  const isControlled = controlledIsExpanded !== undefined
  const isExpanded = isControlled ? controlledIsExpanded : internalExpanded

  const toggleExpanded = useCallback(() => {
    if (isControlled) {
      onToggle?.()
    } else {
      setInternalExpanded(prev => !prev)
    }
  }, [isControlled, onToggle])

  return (
    <Card className='Layer__ExpandableCard'>
      <button
        type='button'
        className='Layer__ExpandableCard__Header'
        onClick={toggleExpanded}
      >
        <HStack justify='space-between' align='center'>
          {slots.Heading}
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
