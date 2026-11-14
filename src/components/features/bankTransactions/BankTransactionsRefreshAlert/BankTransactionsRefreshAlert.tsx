import { useCallback, useMemo } from 'react'
import { ChevronDown, CircleAlert, CircleArrowRight, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getBankAccountLabelWithMask } from '@utils/features/bankAccounts/bankAccount'
import {
  type BankAccountRefreshConnection,
  getBankAccountRefreshConnections,
  getRefreshConnectionKey,
} from '@utils/features/bankAccounts/refresh'
import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/features/bankTransactions/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { useHasLinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { useReconnectConnection } from '@hooks/features/linkedAccounts/useReconnectConnection'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack, Spacer } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'

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
  const { data, isLoading } = useBankAccountsContext()
  const showConnectionAlert = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.ConnectionAlert)
  const showRepairAsRefresh = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.RepairAsRefresh)

  const refreshConnections = useMemo(() => getBankAccountRefreshConnections(data), [data])

  if (!showConnectionAlert || isLoading || refreshConnections.length === 0) {
    return null
  }

  return (
    <BankTransactionsRefreshAlertBody
      refreshConnections={refreshConnections}
      showRepairAsRefresh={showRepairAsRefresh}
    />
  )
}

type RefreshAlertStatus = 'error' | 'success'

type BankTransactionsRefreshAlertBodyProps = {
  refreshConnections: ReadonlyArray<BankAccountRefreshConnection>
  showRepairAsRefresh: boolean
}

const BankTransactionsRefreshAlertBody = ({ refreshConnections, showRepairAsRefresh }: BankTransactionsRefreshAlertBodyProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
  const reconnectConnection = useReconnectConnection()

  const isMobile = view === 'mobile'
  const needsFixCopy = (connection: BankAccountRefreshConnection) => connection.needsRepair && !showRepairAsRefresh

  const summaryCounts = {
    count: refreshConnections.length,
    displayCount: formatNumber(refreshConnections.length),
  }

  const status: RefreshAlertStatus = refreshConnections.some(needsFixCopy) ? 'error' : 'success'

  const summaryLabel = status === 'error'
    ? tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.fix_bank_connections', {
      ...summaryCounts,
      one: 'Fix {{displayCount}} bank connection to see recent transactions',
      other: 'Fix {{displayCount}} bank connections to see recent transactions',
    })
    : tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_bank_connections', {
      ...summaryCounts,
      one: 'Refresh {{displayCount}} bank connection to see recent transactions',
      other: 'Refresh {{displayCount}} bank connections to see recent transactions',
    })

  const actionLabel = status === 'error'
    ? t('bankTransactions:BankTransactionsRefreshAlert.action.reconnect', 'Reconnect')
    : t('bankTransactions:BankTransactionsRefreshAlert.action.refresh', 'Refresh')

  const Trigger = useCallback(() => (
    <Button variant='outlined' inset>
      {actionLabel}
      <ChevronDown size={14} />
    </Button>
  ), [actionLabel])

  const connectionLabel = (connection: BankAccountRefreshConnection) => {
    const [onlyAccount] = connection.accounts
    const count = connection.accounts.length
    const displayCount = formatNumber(count)
    const { institutionName } = connection

    if (needsFixCopy(connection)) {
      if (count === 1 && onlyAccount) {
        return t('bankTransactions:BankTransactionsRefreshAlert.action.fix_account', 'Fix {{accountLabel}}', {
          accountLabel: getBankAccountLabelWithMask(t, onlyAccount),
        })
      }

      return institutionName
        ? tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.fix_institution_accounts', {
          count,
          displayCount,
          institutionName,
          one: 'Fix {{institutionName}} ({{displayCount}} account)',
          other: 'Fix {{institutionName}} ({{displayCount}} accounts)',
        })
        : tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.fix_linked_accounts', {
          count,
          displayCount,
          one: 'Fix {{displayCount}} linked account',
          other: 'Fix {{displayCount}} linked accounts',
        })
    }

    if (count === 1 && onlyAccount) {
      return t('bankTransactions:BankTransactionsRefreshAlert.action.reconnect_account', 'Refresh {{accountLabel}}', {
        accountLabel: getBankAccountLabelWithMask(t, onlyAccount),
      })
    }

    return institutionName
      ? tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_institution_accounts', {
        count,
        displayCount,
        institutionName,
        one: 'Refresh {{institutionName}} ({{displayCount}} account)',
        other: 'Refresh {{institutionName}} ({{displayCount}} accounts)',
      })
      : tPlural(t, 'bankTransactions:BankTransactionsRefreshAlert.action.reconnect_linked_accounts', {
        count,
        displayCount,
        one: 'Refresh {{displayCount}} linked account',
        other: 'Refresh {{displayCount}} linked accounts',
      })
  }

  const soleConnection = refreshConnections.length === 1 ? refreshConnections[0] : undefined

  return (
    <HStack
      ref={containerRef}
      className='Layer__BankTransactionsRefreshAlert'
      data-view={view}
      data-status={status}
      role='region'
      aria-label={t('bankTransactions:BankTransactionsRefreshAlert.label.connections_require_attention', 'Bank connections require attention')}
      align='center'
      justify='space-between'
      gap='sm'
      pb='xs'
      pis='md'
      pie='sm'
    >
      <HStack align='center' gap='xs' className='Layer__BankTransactionsRefreshAlert__Content'>
        <HStack align='center' justify='center' className='Layer__BankTransactionsRefreshAlert__Icon'>
          {status === 'error' ? <CircleAlert size={14} /> : <RefreshCcw size={14} />}
        </HStack>
        <Span variant='inherit' ellipsis>{summaryLabel}</Span>
      </HStack>
      {soleConnection
        ? (
          <Button variant='outlined' inset onPress={() => reconnectConnection(soleConnection)}>
            {actionLabel}
            <CircleArrowRight size={14} />
          </Button>
        )
        : (
          <DropdownMenu
            ariaLabel={summaryLabel}
            slots={{ Trigger }}
            slotProps={{ Dialog: { width: isMobile ? undefined : 320 } }}
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
        )}
    </HStack>
  )
}
