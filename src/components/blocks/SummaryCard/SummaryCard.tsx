import { type PropsWithChildren, type ReactNode } from 'react'
import classNames from 'classnames'

import { Card } from '@ui/Card/Card'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

import './summaryCard.scss'

type SummaryCardSlotProps = {
  title: ReactNode
  subtitle?: ReactNode
  legend?: ReactNode
  primaryAction?: ReactNode
}

export type SummaryCardProps = PropsWithChildren<{
  slots: SummaryCardSlotProps
  className?: string
  /**
   * Class names the calling feature shipped under. Several cards render this body now but named
   * their elements differently before, so each passes its own.
   */
  legacyClassNames?: { body?: string, header?: string }
}>

export const SummaryCard = ({
  slots,
  children,
  className,
  legacyClassNames: callerLegacyClassNames,
}: SummaryCardProps) => {
  const { title, subtitle, legend, primaryAction } = slots

  const titleNode = typeof title === 'string'
    ? <Heading size='md'>{title}</Heading>
    : title

  const subtitleNode = typeof subtitle === 'string'
    ? <Span size='sm' variant='subtle'>{subtitle}</Span>
    : subtitle

  return (
    <Card className={classNames('Layer__SummaryCard', className)}>
      <VStack className={classNames('Layer__SummaryCard__Body', callerLegacyClassNames?.body)}>
        <HStack
          className={classNames('Layer__SummaryCard__Header', callerLegacyClassNames?.header)}
          justify='space-between'
          align='center'
          gap='md'
          pb='md'
          pi='lg'
        >
          <VStack className='Layer__SummaryCard__HeaderTitle'>
            {titleNode}
            {subtitleNode && (
              <div className='Layer__SummaryCard__HeaderSubtitle'>
                {subtitleNode}
              </div>
            )}
          </VStack>
          {(legend || primaryAction) && (
            <HStack className='Layer__SummaryCard__HeaderActions' gap='md' align='center'>
              {legend && (
                <div className='Layer__SummaryCard__HeaderLegend'>
                  {legend}
                </div>
              )}
              {primaryAction && (
                <div className='Layer__SummaryCard__HeaderPrimaryAction'>
                  {primaryAction}
                </div>
              )}
            </HStack>
          )}
        </HStack>
        <div className='Layer__SummaryCard__Content'>
          {children}
        </div>
      </VStack>
    </Card>
  )
}
