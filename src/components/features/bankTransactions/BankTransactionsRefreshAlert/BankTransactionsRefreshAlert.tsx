import { type ReactNode, useCallback, useMemo } from 'react'
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

type RefreshAlertActionProps = {
  label: string
  status: RefreshAlertStatus
  icon: ReactNode
  isMobile: boolean
  ellipsis?: true
  onPress?: () => void
}

const RefreshAlertAction = ({ label, status, icon, isMobile, ellipsis, onPress }: RefreshAlertActionProps) => (
  <Button
    className='Layer__BankTransactionsRefreshAlert__Action'
    variant='text'
    fullWidth={isMobile}
    onPress={onPress}
  >
    <HStack
      className='Layer__BankTransactionsRefreshAlert__Content'
      align='center'
      gap='xs'
      pis={isMobile ? 'md' : undefined}
      pie={isMobile ? 'xs' : undefined}
    >
      {status === 'error' ? <CircleAlert size={14} /> : <RefreshCcw size={14} />}
      <P size='sm' weight='normal' variant='inherit' ellipsis={ellipsis}>{label}</P>
      {icon}
    </HStack>
  </Button>
)

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

  const Trigger = useCallback(() => (
    <RefreshAlertAction label={summaryLabel} status={status} icon={<ChevronDown size={14} />} isMobile={isMobile} />
  ), [isMobile, status, summaryLabel])

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

  const multipleConnections = refreshConnections.length > 1

  return (
    <VStack
      ref={containerRef}
      className='Layer__BankTransactionsRefreshAlert'
      data-view={view}
      data-status={status}
      role='region'
      aria-label={t('bankTransactions:BankTransactionsRefreshAlert.label.connections_require_attention', 'Bank connections require attention')}
      gap='2xs'
      pbs='xs'
      pbe='2xs'
      pis={isMobile ? undefined : 'md'}
      pie={isMobile ? undefined : 'xs'}
    >
      {multipleConnections
        ? (
          <DropdownMenu
            ariaLabel={summaryLabel}
            slots={{ Trigger }}
            slotProps={{ Dialog: { width: isMobile ? undefined : 320 } }}
            popoverClassName={isMobile ? 'Layer__BankTransactionsRefreshAlert__Popover--mobile' : undefined}
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
          <RefreshAlertAction
            key={getRefreshConnectionKey(connection)}
            label={summaryLabel}
            status={status}
            icon={<CircleArrowRight size={14} />}
            isMobile={isMobile}
            ellipsis
            onPress={() => reconnectConnection(connection)}
          />
        ))}
    </VStack>
  )
}
