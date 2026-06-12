import { type ReactNode } from 'react'

import { BackButton } from '@ui/Button/BackButton'
import { CloseButton } from '@ui/Button/CloseButton'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'

interface EntryDetailHeaderProps {
  onClose: () => void
  title: ReactNode
}

export const EntryDetailHeader = ({ onClose, title }: EntryDetailHeaderProps) => {
  return (
    <Header>
      <HeaderRow>
        <HeaderCol className='Layer__hidden-lg Layer__hidden-xl'>
          <BackButton onPress={onClose} />
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className='Layer__show-lg Layer__show-xl'>
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className='Layer__show-lg Layer__show-xl'>
          <CloseButton onPress={onClose} />
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}
