import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { ChevronDown, CircleArrowRight, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  type BankAccountRefreshConnection,
  getBankAccountRefreshConnections,
  getRefreshConnectionKey,
} from '@utils/features/bankAccounts/refresh'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { useHasLinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { useReconnectConnection } from '@hooks/features/linkedAccounts/useReconnectConnection'
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
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
  const { data, isLoading } = useBankAccountsContext()
  const reconnectConnection = useReconnectConnection()

  const refreshConnections = useMemo(() => getBankAccountRefreshConnections(data), [data])

  const summaryLabel = tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_bank_connections', {
    count: refreshConnections.length,
    displayCount: formatNumber(refreshConnections.length),
    one: 'Refresh {{displayCount}} bank connection to see recent transactions',
    other: 'Refresh {{displayCount}} bank connections to see recent transactions',
  })

  const Trigger = useCallback(() => (
    <Button className='Layer__BankTransactionsRefreshAlert__action' variant='text'>
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
    const [onlyAccount] = connection.accounts
    if (connection.accounts.length === 1 && onlyAccount) {
      return onlyAccount.mask
        ? t('bankTransactions:BankTransactionsRefreshAlert.action.reconnect_masked_account', 'Refresh {{accountName}} ({{mask}})', {
          accountName: onlyAccount.accountName,
          mask: onlyAccount.mask,
        })
        : t('bankTransactions:BankTransactionsRefreshAlert.action.reconnect_account', 'Refresh {{accountName}}', {
          accountName: onlyAccount.accountName,
        })
    }

    return connection.institutionName
      ? tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_institution_accounts', {
        count: connection.accounts.length,
        displayCount: formatNumber(connection.accounts.length),
        institutionName: connection.institutionName,
        one: 'Refresh {{institutionName}} ({{displayCount}} account)',
        other: 'Refresh {{institutionName}} ({{displayCount}} accounts)',
      })
      : tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_linked_accounts', {
        count: connection.accounts.length,
        displayCount: formatNumber(connection.accounts.length),
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
      data-view={view}
      role='region'
      aria-label={t('bankTransactions:BankTransactionsRefreshAlert.label.connections_require_attention', 'Bank connections require attention')}
      gap='2xs'
    >
      {multipleConnections
        ? (
          <DropdownMenu
            ariaLabel={summaryLabel}
            slots={{ Trigger }}
            slotProps={{ Dialog: { width: view === 'mobile' ? undefined : 320 } }}
            popoverClassName={classNames(
              'Layer__BankTransactionsRefreshAlert__popover',
              view === 'mobile' && 'Layer__BankTransactionsRefreshAlert__popover--mobile',
            )}
          >
            <MenuList>
              {refreshConnections.map(connection => (
                <MenuItem
                  key={getRefreshConnectionKey(connection)}
                  onClick={() => reconnectConnection(connection)}
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
            key={getRefreshConnectionKey(connection)}
            className='Layer__BankTransactionsRefreshAlert__action'
            variant='text'
            onPress={() => reconnectConnection(connection)}
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
