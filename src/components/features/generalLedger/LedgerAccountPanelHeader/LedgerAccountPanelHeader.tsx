import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ChartOfAccountsContext } from '@providers/features/generalLedger/ChartOfAccountsContext/ChartOfAccountsContext'
import { LedgerAccountsContext } from '@providers/features/generalLedger/LedgerAccountsContext/LedgerAccountsContext'
import { BackButton } from '@ui/Button/BackButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'
import { flattenAccounts } from '@features/generalLedger/utils'

export interface LedgerAccountHeaderProps {
  onClose: () => void
}

export const LedgerAccountPanelHeader = ({ onClose }: LedgerAccountHeaderProps) => {
  const { t } = useTranslation()
  const { selectedAccount } = useContext(LedgerAccountsContext)
  const { data } = useContext(ChartOfAccountsContext)

  const currentBalance = useMemo(() => {
    if (!selectedAccount) return 0
    return flattenAccounts(data?.accounts ?? [])
      .find(account => account.accountId === selectedAccount.accountId)?.balance
      ?? selectedAccount.balance
  }, [data?.accounts, selectedAccount])

  return (
    <Header>
      <HeaderRow>
        <HeaderCol>
          <BackButton onPress={onClose} />
          <VStack align='start'>
            <Span weight='bold'>{selectedAccount?.name ?? ''}</Span>
            <HStack gap='xs' align='center'>
              <Span size='sm' variant='subtle'>
                {t('generalLedger:LedgerAccountPanelHeader.label.balance', 'Current balance')}
              </Span>
              <MoneySpan size='sm' amount={currentBalance} />
            </HStack>
          </VStack>
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}
