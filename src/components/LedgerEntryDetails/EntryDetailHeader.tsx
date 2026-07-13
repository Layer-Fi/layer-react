import { type ReactNode } from 'react'

import { BackButton } from '@ui/Button/BackButton'
import { CloseButton } from '@ui/Button/CloseButton'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'

import './entryDetailHeader.scss'

interface EntryDetailHeaderProps {
  onClose: () => void
  title: ReactNode
}

export const EntryDetailHeader = ({ onClose, title }: EntryDetailHeaderProps) => {
  return (
    <Header>
      <HeaderRow>
        <HeaderCol className='Layer__EntryDetailHeader--HiddenOnLarge'>
          <BackButton onPress={onClose} />
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className='Layer__EntryDetailHeader--VisibleOnLarge'>
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className='Layer__EntryDetailHeader--VisibleOnLarge'>
          <CloseButton onPress={onClose} />
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}
