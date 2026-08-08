import { type ReactNode } from 'react'

import { BackButton } from '@ui/Button/BackButton'
import { CloseButton } from '@ui/Button/CloseButton'
import { Heading } from '@ui/Typography/Heading'
import { ViewHeader } from '@blocks/Layout/View/ViewHeader/ViewHeader'

import './journalEntryDetailHeader.scss'

interface JournalEntryDetailHeaderProps {
  onClose: () => void
  title: ReactNode
}

export const JournalEntryDetailHeader = ({ onClose, title }: JournalEntryDetailHeaderProps) => {
  return (
    <ViewHeader
      surface='panel'
      slots={{
        Title: (
          <>
            <span className='Layer__JournalEntryDetailHeader--HiddenOnLarge'>
              <BackButton onPress={onClose} />
            </span>
            <Heading size='sm'>{title}</Heading>
          </>
        ),
        Actions: (
          <span className='Layer__JournalEntryDetailHeader--VisibleOnLarge'>
            <CloseButton onPress={onClose} />
          </span>
        ),
      }}
    />
  )
}
