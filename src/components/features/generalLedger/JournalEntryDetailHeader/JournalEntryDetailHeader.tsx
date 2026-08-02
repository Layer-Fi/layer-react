import { type ReactNode } from 'react'

import { BackButton } from '@ui/Button/BackButton'
import { CloseButton } from '@ui/Button/CloseButton'
import { Header } from '@ui/Header/Header'
import { HeaderCol } from '@ui/Header/HeaderCol'
import { HeaderRow } from '@ui/Header/HeaderRow'
import { Heading } from '@ui/Typography/Heading'

import './journalEntryDetailHeader.scss'

interface JournalEntryDetailHeaderProps {
  onClose: () => void
  title: ReactNode
}

export const JournalEntryDetailHeader = ({ onClose, title }: JournalEntryDetailHeaderProps) => {
  return (
    <Header>
      <HeaderRow>
        <HeaderCol className='Layer__JournalEntryDetailHeader--HiddenOnLarge'>
          <BackButton onPress={onClose} />
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className='Layer__JournalEntryDetailHeader--VisibleOnLarge'>
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className='Layer__JournalEntryDetailHeader--VisibleOnLarge'>
          <CloseButton onPress={onClose} />
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}
