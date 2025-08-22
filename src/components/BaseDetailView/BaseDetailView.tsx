import type { PropsWithChildren } from 'react'
import { Container } from '../Container/Container'
import { Button } from '../ui/Button/Button'
import BackArrow from '../../icons/BackArrow'
import { HStack } from '../ui/Stack/Stack'

export type BaseDetailViewProps = PropsWithChildren<{
  name: string
  borderless?: boolean
  onGoBack: () => void
  slots: {
    Header: React.FC
    BackIcon?: React.FC
  }
}>

export const BaseDetailView = ({ name, onGoBack, slots, children, borderless = false }: BaseDetailViewProps) => {
  const { Header, BackIcon } = slots

  return (
    <Container name={name} className='Layer__BaseDetailView' transparentBg={borderless}>
      <HStack align='center' gap='md' className='Layer__BaseDetailView__Header'>
        <Button variant='outlined' icon onPress={onGoBack}>{BackIcon ? <BackIcon /> : <BackArrow />}</Button>
        <Header />
      </HStack>
      {children}
    </Container>
  )
}
