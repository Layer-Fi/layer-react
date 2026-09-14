import { useCallback, useContext, useMemo } from 'react'
import { CircleArrowRight, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  formatBankAccountWithMask,
  getBankAccountRefreshConnectionInfo,
  getBankAccountsReadyForRefresh,
} from '@utils/features/bankAccounts/bankAccount'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { P } from '@ui/Typography/Text'

import './bankTransactionsRefreshAlert.scss'

export const BankTransactionsRefreshAlert = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useBankAccountsContext()
  const { addConnection, repairConnection } = useContext(LinkedAccountsContext)

  const accountsReadyForRefresh = useMemo(
    () => getBankAccountsReadyForRefresh(data),
    [data],
  )

  const accountReadyForRefresh = accountsReadyForRefresh[0]
  const refreshInfo = accountReadyForRefresh
    ? getBankAccountRefreshConnectionInfo(accountReadyForRefresh)
    : null

  const handleRefresh = useCallback(() => {
    if (!refreshInfo?.connectionExternalId) return

    if (refreshInfo.reconnectWithNewCredentials) {
      void addConnection(refreshInfo.source)
      return
    }

    void repairConnection(refreshInfo.source, refreshInfo.connectionExternalId)
  }, [addConnection, refreshInfo, repairConnection])

  if (isLoading || !accountReadyForRefresh) {
    return null
  }

  const accountName = formatBankAccountWithMask(accountReadyForRefresh)
  const message = t(
    'bankTransactions:BankTransactionsRefreshAlert.label.refresh_account_for_up_to_date_transactions',
    'Refresh {{accountName}} for up-to-date transactions',
    { accountName },
  )

  const content = (
    <>
      <P variant='inherit'><RefreshCcw size={11} /></P>
      <P size='sm' weight='normal' variant='inherit'>{message}</P>
      {refreshInfo?.connectionExternalId && <CircleArrowRight size={14} />}
    </>
  )

  return (
    <div className='Layer__BankTransactionsRefreshAlert' data-status='warning' role='status'>
      {refreshInfo?.connectionExternalId
        ? (
          <button
            type='button'
            className='Layer__BankTransactionsRefreshAlert__action'
            onClick={handleRefresh}
          >
            {content}
          </button>
        )
        : (
          <div className='Layer__BankTransactionsRefreshAlert__text'>
            {content}
          </div>
        )}
    </div>
  )
}
