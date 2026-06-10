import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Heading } from '@ui/Typography/Heading'
import { BackButton } from '@components/Button/BackButton'
import { CloseButton } from '@components/Button/CloseButton'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'

interface EntryDetailHeaderProps {
  onClose: () => void
  title: ReactNode
}

export const EntryDetailHeader = ({ onClose, title }: EntryDetailHeaderProps) => {
  const { t } = useTranslation()

  return (
    <Header>
      <HeaderRow>
        <HeaderCol className='Layer__hidden-lg Layer__hidden-xl'>
          <BackButton onClick={onClose} />
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className='Layer__show-lg Layer__show-xl'>
          <Heading size='sm'>{title}</Heading>
        </HeaderCol>
        <HeaderCol className='Layer__show-lg Layer__show-xl'>
          <CloseButton onClick={onClose} aria-label={t('common:action.close', 'Close')} />
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}
