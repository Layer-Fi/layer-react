import classNames from 'classnames'
import { ChevronLeft, type LucideIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import { BackButton } from '@ui/Button/BackButton'
import { HStack } from '@ui/Stack/Stack'
import { Container } from '@blocks/Layout/Container/Container'

import './baseDetailView.scss'

export type BaseDetailViewProps = PropsWithChildren<{
  className?: string
  borderless?: boolean
  onGoBack?: () => void
  slots: {
    Header: React.FC
    BackIcon?: LucideIcon
  }
}>

export const BaseDetailView = ({ className, onGoBack, slots, children, borderless = false }: BaseDetailViewProps) => {
  const { Header, BackIcon = ChevronLeft } = slots

  return (
    <Container
      className={classNames('Layer__BaseDetailView', className)}
      variant={borderless ? 'plain' : 'default'}
    >
      <HStack align='center' gap='md' className='Layer__BaseDetailView__Header'>
        {onGoBack && <BackButton onPress={onGoBack} slots={{ Icon: BackIcon }} />}
        <Header />
      </HStack>
      {children}
    </Container>
  )
}
