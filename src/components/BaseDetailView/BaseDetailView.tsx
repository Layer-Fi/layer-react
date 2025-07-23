import type { PropsWithChildren } from 'react'
import { Container } from '../Container/Container'
import { Button } from '../ui/Button/Button'
import BackArrow from '../../icons/BackArrow'
import { HStack } from '../ui/Stack/Stack'

export type BaseDetailViewProps = PropsWithChildren<{
  name: string
  onGoBack: () => void
  slots: {
    Header: React.FC
  }
}>

export const BaseDetailView = ({ name, onGoBack, slots, children }: BaseDetailViewProps) => {
  const { Header } = slots

  return (
    <Container name={name} className='Layer__BaseDetailView'>
      <HStack align='center' gap='md' className='Layer__BaseDetailView__Header'>
        <Button variant='outlined' icon onPress={onGoBack}><BackArrow /></Button>
        <Header />
      </HStack>
      {children}
    </Container>
  )
}
