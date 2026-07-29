import { ChevronLeft } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import { BackButton } from '@ui/Button/BackButton'
import { HStack } from '@ui/Stack/Stack'
import { Container } from '@components/Container/Container'

import './baseDetailView.scss'

export type BaseDetailViewProps = PropsWithChildren<{
  name: string
  borderless?: boolean
  onGoBack?: () => void
  slots: {
    Header: React.FC
    BackIcon?: React.ComponentType<{ size?: string | number, color?: string }>
  }
}>

export const BaseDetailView = ({ name, onGoBack, slots, children, borderless = false }: BaseDetailViewProps) => {
  const { Header, BackIcon = ChevronLeft } = slots

  return (
    <Container name={name} className='Layer__BaseDetailView' transparentBg={borderless}>
      <HStack align='center' gap='md' className='Layer__BaseDetailView__Header'>
        {onGoBack && <BackButton onPress={onGoBack} slots={{ Icon: BackIcon }} />}
        <Header />
      </HStack>
      {children}
    </Container>
  )
}
