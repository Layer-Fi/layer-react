import type { PropsWithChildren, ReactNode } from 'react'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './mobileListItemContent.scss'

type MobileListItemContentProps = PropsWithChildren<{
  title: string
  value?: ReactNode
}>

export const MobileListItemContent = ({ title, value, children }: MobileListItemContentProps) => (
  <VStack gap='3xs' className='Layer__UI__MobileListItemContent'>
    <HStack fluid justify='space-between' align='start' gap='sm' className='Layer__UI__MobileListItemContent__TitleRow'>
      <Span weight='bold' ellipsis className='Layer__UI__MobileListItemContent__Title'>{title}</Span>
      {value}
    </HStack>
    {children}
  </VStack>
)
