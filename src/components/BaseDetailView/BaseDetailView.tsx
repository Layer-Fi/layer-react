import { ChevronLeft } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import { Button } from '@ui/Button/Button'
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
        {onGoBack && (<Button variant='outlined' icon onPress={onGoBack}><BackIcon size={18} color='#1A130D' /></Button>)}
        <Header />
      </HStack>
      {children}
    </Container>
  )
}
