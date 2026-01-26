import { useMemo } from 'react'
import { SearchX } from 'lucide-react'

import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import InboxIcon from '@icons/Inbox'
import { DataState, DataStateStatus } from '@components/DataState/DataState'

type BankTransactionsTableEmptyStatesProps = {
  hasVisibleTransactions: boolean
  isError: boolean
  isFiltered: boolean
  isLoadingWithoutData: boolean
}

export function BankTransactionsTableEmptyStates({
  hasVisibleTransactions,
  isError,
  isFiltered,
  isLoadingWithoutData,
}: BankTransactionsTableEmptyStatesProps) {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const StateComponent = useMemo(() => {
    if (isError) {
      return (
        <DataState
          status={DataStateStatus.failed}
          title='Something went wrong'
          description='We couldn’t load your transactions'
        />
      )
    }

    if (isLoadingWithoutData) {
      return null
    }

    if (!hasVisibleTransactions && !isFiltered) {
      return (
        <DataState
          status={DataStateStatus.allDone}
          title={
            isCategorizationEnabled
              ? 'You are up to date with transactions!'
              : 'You have no categorized transactions'
          }
          description={
            isCategorizationEnabled
              ? 'All uncategorized transactions will be displayed here'
              : 'All transactions will be displayed here once reviewed'
          }
          icon={isCategorizationEnabled ? undefined : <InboxIcon />}
        />
      )
    }

    if (!hasVisibleTransactions && isFiltered) {
      return (
        <DataState
          status={DataStateStatus.info}
          title='No transactions found'
          description='Try adjusting your search filters'
          icon={<SearchX />}
        />
      )
    }

    return null
  }, [isCategorizationEnabled, isError, isLoadingWithoutData, isFiltered, hasVisibleTransactions])

  if (StateComponent === null) {
    return null
  }

  return (
    <div className='Layer__table-state-container'>
      {StateComponent}
    </div>
  )
}
