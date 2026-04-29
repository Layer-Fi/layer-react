import { type ReactNode } from 'react'
import classNames from 'classnames'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading, type HeadingSize } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'

import './summaryCard.scss'

export type SummaryCardProps = {
  title: ReactNode
  subtitle?: ReactNode
  headerSize?: HeadingSize
  legend?: ReactNode
  primaryAction?: ReactNode
  children: ReactNode
  className?: string
}

export const SummaryCard = ({
  title,
  subtitle,
  headerSize = 'md',
  legend,
  primaryAction,
  children,
  className,
}: SummaryCardProps) => {
  const titleNode = typeof title === 'string'
    ? <Heading size={headerSize}>{title}</Heading>
    : title

  const subtitleNode = typeof subtitle === 'string'
    ? <Span size='sm' variant='subtle'>{subtitle}</Span>
    : subtitle

  return (
    <Card className={classNames('Layer__SummaryCard', className)}>
      <VStack className='Layer__SummaryCard__Body'>
        <HStack
          className='Layer__SummaryCard__Header'
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
