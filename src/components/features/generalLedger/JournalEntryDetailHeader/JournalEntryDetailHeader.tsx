import { type ReactNode } from 'react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { BackButton } from '@ui/Button/BackButton'
import { CloseButton } from '@ui/Button/CloseButton'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'

import './journalEntryDetailHeader.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__JournalEntryDetailHeader--HiddenOnLarge': 'Layer__EntryDetailHeader--HiddenOnLarge',
  'Layer__JournalEntryDetailHeader--VisibleOnLarge': 'Layer__EntryDetailHeader--VisibleOnLarge',
})

interface JournalEntryDetailHeaderProps {
  className?: string
  onClose: () => void
  title: ReactNode
}

export const JournalEntryDetailHeader = ({ onClose, title, className }: JournalEntryDetailHeaderProps) => {
  return (
    <Header className={className}>
      <HeaderRow>
        <HeaderCol className={legacyClassNames('Layer__JournalEntryDetailHeader--HiddenOnLarge')}>
          <BackButton onPress={onClose} />
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className={legacyClassNames('Layer__JournalEntryDetailHeader--VisibleOnLarge')}>
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className={legacyClassNames('Layer__JournalEntryDetailHeader--VisibleOnLarge')}>
          <CloseButton onPress={onClose} />
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}
