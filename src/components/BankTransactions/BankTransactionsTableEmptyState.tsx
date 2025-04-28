import { useMemo } from 'react'
import InboxIcon from '../../icons/Inbox'
import { DataState, DataStateStatus } from '../DataState'
import { SearchX } from 'lucide-react'

type BankTransactionsTableEmptyStatesProps = {
  hasVisibleTransactions: boolean
  isCategorizationMode: boolean
  isError: boolean
  isFiltered: boolean
  isLoadingWithoutData: boolean
}

export function BankTransactionsTableEmptyStates({
  hasVisibleTransactions,
  isCategorizationMode,
  isError,
  isFiltered,
  isLoadingWithoutData,
}: BankTransactionsTableEmptyStatesProps) {
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
            isCategorizationMode
              ? 'You are up to date with transactions!'
              : 'You have no categorized transactions'
          }
          description={
            isCategorizationMode
              ? 'All uncategorized transactions will be displayed here'
              : 'All transactions will be displayed here once reviewed'
          }
          icon={isCategorizationMode ? undefined : <InboxIcon />}
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
  }, [isCategorizationMode, isError, isLoadingWithoutData, isFiltered, hasVisibleTransactions])

  if (StateComponent === null) {
    return null
  }

  return (
    <div className='Layer__table-state-container'>
      {StateComponent}
    </div>
  )
}
