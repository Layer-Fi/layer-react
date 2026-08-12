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
  /**
   * Class names the calling feature shipped under. Several mobile lists render this content now but
   * named their elements differently before, so each passes its own.
   */
  legacyClassNames?: { root?: string }
}>

export const MobileListItemContent = ({
  title,
  slots,
  legacyClassNames: callerLegacyClassNames,
  children,
}: MobileListItemContentProps) => {
  const { Value } = slots ?? {}

  return (
    <VStack gap='3xs' className={callerLegacyClassNames?.root}>
      <HStack fluid justify='space-between' align='start' gap='sm' className={legacyClassNames('Layer__MobileListItemContent__TitleRow')}>
        <Span weight='bold' ellipsis className={legacyClassNames('Layer__MobileListItemContent__Title')}>{title}</Span>
        {Value}
      </HStack>
      {children}
    </VStack>
  )
}
