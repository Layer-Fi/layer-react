import { useMemo } from 'react'
import { SearchX } from 'lucide-react'

import { DisplayState } from '@internal-types/bank_transactions'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import InboxIcon from '@icons/Inbox'
import { DataState, DataStateStatus } from '@components/DataState/DataState'

type BankTransactionsTableEmptyStatesProps = {
  slots: {
    Loader: React.FC
    List: React.FC
  }
}

export function BankTransactionsListWithEmptyStates({
  slots,
}: BankTransactionsTableEmptyStatesProps) {
  const { data, isLoading, isError, display } = useBankTransactionsContext()
  const { filters } = useBankTransactionsFiltersContext()

  const isCategorizationMode = display !== DisplayState.categorized
  const isFiltered = Boolean(filters?.query)
  const hasVisibleTransactions = (data?.length ?? 0) > 0

  const DataStateComponent = useMemo(() => {
    if (isError) {
      return (
        <DataState
          status={DataStateStatus.failed}
          title='Something went wrong'
          description='We couldn’t load your transactions'
        />
      )
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
  }, [isError, hasVisibleTransactions, isFiltered, isCategorizationMode])

  if (isLoading) {
    return <slots.Loader />
  }

  if (DataStateComponent === null) {
    return <slots.List />
  }

  return (
    <div className='Layer__table-state-container'>
      {DataStateComponent}
    </div>
  )
}
