import { type ReactNode } from 'react'

import { BackButton } from '@ui/Button/BackButton'
import { CloseButton } from '@ui/Button/CloseButton'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'

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
