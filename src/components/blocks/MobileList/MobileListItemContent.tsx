import type { PropsWithChildren, ReactNode } from 'react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './mobileListItemContent.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__MobileListItemContent__Title: 'Layer__UI__MobileListItemContent__Title',
  Layer__MobileListItemContent__TitleRow: 'Layer__UI__MobileListItemContent__TitleRow',
})

type MobileListItemContentProps = PropsWithChildren<{
  title: string
  slots?: {
    Value?: ReactNode
  }
}>

export const MobileListItemContent = ({ title, slots, children }: MobileListItemContentProps) => {
  const { Value } = slots ?? {}

  return (
    <VStack gap='3xs'>
      <HStack fluid justify='space-between' align='start' gap='sm' className={legacyClassNames('Layer__MobileListItemContent__TitleRow')}>
        <Span weight='bold' ellipsis className={legacyClassNames('Layer__MobileListItemContent__Title')}>{title}</Span>
        {Value}
      </HStack>
      {children}
    </VStack>
  )
}
