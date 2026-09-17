import { useCallback, useContext, useMemo } from 'react'
import { ChevronDown, CircleArrowRight, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  type BankAccountRefreshConnection,
  getBankAccountRefreshConnections,
} from '@utils/features/bankAccounts/bankAccount'
import { tPlural } from '@utils/shared/i18n/plural'
import { usePeriodicNow } from '@hooks/utils/dates/usePeriodicNow'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useIsMobileContainer } from '@hooks/utils/size/useIsMobileContainer'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { LinkedAccountsContext, useHasLinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'

import './bankTransactionsRefreshAlert.scss'

export const BankTransactionsRefreshAlert = () => {
  const hasProvider = useHasLinkedAccountsProvider()

  if (hasProvider) {
    return <BankTransactionsRefreshAlertContent />
  }

  return (
    <LinkedAccountsProvider>
      <BankTransactionsRefreshAlertContent />
    </LinkedAccountsProvider>
  )
}

const BankTransactionsRefreshAlertContent = () => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { isMobile, containerRef } = useIsMobileContainer<HTMLDivElement>()
  const { data, isLoading } = useBankAccountsContext()
  const { addConnection, repairConnection } = useContext(LinkedAccountsContext)
  const now = usePeriodicNow()

  const refreshConnections = useMemo(
    () => getBankAccountRefreshConnections(data, now),
    [data, now],
  )

  const handleRefresh = useCallback((connection: BankAccountRefreshConnection) => {
    if (connection.reconnectWithNewCredentials) {
      void addConnection(connection.source)
      return
    }

    void repairConnection(connection.source, connection.connectionExternalId)
  }, [addConnection, repairConnection])

  const summaryLabel = tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_bank_connections', {
    count: refreshConnections.length,
    displayCount: formatNumber(refreshConnections.length),
    one: 'Refresh {{displayCount}} bank connection to see recent transactions',
    other: 'Refresh {{displayCount}} bank connections to see recent transactions',
  })

  const Trigger = useCallback(() => (
    <Button className='Layer__BankTransactionsRefreshAlert__action' variant='text' data-lrc-bank-transactions-refresh-alert-action>
      <HStack className='Layer__BankTransactionsRefreshAlert__content' align='center' gap='xs'>
        <RefreshCcw size={14} />
        <P size='sm' weight='normal' variant='inherit'>{summaryLabel}</P>
        <ChevronDown size={14} />
      </HStack>
    </Button>
  ), [summaryLabel])

  if (isLoading || refreshConnections.length === 0) {
    return null
  }

  const connectionLabel = (connection: BankAccountRefreshConnection) => {
    if (connection.accountNames.length === 1) {
      return t('bankTransactions:BankTransactionsRefreshAlert.action.reconnect_account', 'Refresh {{accountName}}', {
        accountName: connection.accountNames[0],
      })
    }

    return connection.institutionName
      ? tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_institution_accounts', {
        count: connection.accountNames.length,
        displayCount: formatNumber(connection.accountNames.length),
        institutionName: connection.institutionName,
        one: 'Refresh {{institutionName}} ({{displayCount}} account)',
        other: 'Refresh {{institutionName}} ({{displayCount}} accounts)',
      })
      : tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_linked_accounts', {
        count: connection.accountNames.length,
        displayCount: formatNumber(connection.accountNames.length),
        one: 'Refresh {{displayCount}} linked account',
        other: 'Refresh {{displayCount}} linked accounts',
      })
  }

  const multipleConnections = refreshConnections.length > 1

  return (
    <VStack
      ref={containerRef}
      className='Layer__BankTransactionsRefreshAlert'
      data-status='success'
      data-view={isMobile ? 'mobile' : 'desktop'}
      data-lrc-bank-transactions-refresh-alert
      role='region'
      aria-label={t('bankTransactions:BankTransactionsRefreshAlert.label.connections_require_attention', 'Bank connections require attention')}
      gap='2xs'
    >
      {multipleConnections
        ? (
          <DropdownMenu
            ariaLabel={summaryLabel}
            slots={{ Trigger }}
            slotProps={{ Dialog: { width: isMobile ? 'var(--trigger-width)' : 320 } }}
            popoverClassName='Layer__BankTransactionsRefreshAlert__popover'
          >
            <MenuList>
              {refreshConnections.map(connection => (
                <MenuItem
                  key={`${connection.source}:${connection.connectionExternalId}`}
                  onClick={() => handleRefresh(connection)}
                  data-lrc-bank-transactions-refresh-alert-item
                >
                  <P size='sm' weight='normal'>{connectionLabel(connection)}</P>
                  <Spacer />
                  <CircleArrowRight size={14} />
                </MenuItem>
              ))}
            </MenuList>
          </DropdownMenu>
        )
        : refreshConnections.map(connection => (
          <Button
            key={`${connection.source}:${connection.connectionExternalId}`}
            className='Layer__BankTransactionsRefreshAlert__action'
            variant='text'
            onPress={() => handleRefresh(connection)}
            data-lrc-bank-transactions-refresh-alert-action
          >
            <HStack className='Layer__BankTransactionsRefreshAlert__content' align='center' gap='xs'>
              <RefreshCcw size={14} />
              <P size='sm' weight='normal' variant='inherit' ellipsis>{summaryLabel}</P>
              <CircleArrowRight size={14} />
            </HStack>
          </Button>
        ))}
    </VStack>
  )
}
