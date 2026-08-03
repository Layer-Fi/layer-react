import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { BackButton } from '@ui/Button/BackButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'

export interface LedgerAccountHeaderProps {
  onClose: () => void
}

export const LedgerAccountPanelHeader = ({ onClose }: LedgerAccountHeaderProps) => {
  const { t } = useTranslation()
  const { selectedAccount } = useContext(LedgerAccountsContext)

  return (
    <Header>
      <HeaderRow>
        <HeaderCol>
          <BackButton onPress={onClose} />
          <VStack align='start'>
            <Span weight='bold'>{selectedAccount?.name ?? ''}</Span>
            <HStack gap='xs' align='center'>
              <Span size='sm' variant='subtle'>
                {t('generalLedger:label.balance', 'Current balance')}
              </Span>
              <MoneySpan size='sm' amount={selectedAccount?.balance ?? 0} />
            </HStack>
          </VStack>
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}
