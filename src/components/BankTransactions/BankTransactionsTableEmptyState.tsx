import { type PropsWithChildren, type ReactNode } from 'react'
import { SearchX } from 'lucide-react'

import { DisplayState } from '@internal-types/bank_transactions'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import InboxIcon from '@icons/Inbox'
import { DataState, DataStateStatus } from '@components/DataState/DataState'

type BankTransactionsTableEmptyStatesProps = {
  isEmpty: boolean
  slots: {
    Loader?: ReactNode
    List: ReactNode
  }
}

const DataStateContainer = ({ children }: PropsWithChildren) => (
  <div className='Layer__table-state-container'>
    {children}
  </div>
)

export const BankTransactionsTableEmptyState = () => {
  const { display } = useBankTransactionsContext()
  const { filters } = useBankTransactionsFiltersContext()

  const isCategorizationMode = display !== DisplayState.categorized
  const isFiltered = Boolean(filters?.query)

  if (isFiltered) {
    return (
      <DataStateContainer>
        <DataState
          status={DataStateStatus.info}
          title='No transactions found'
          description='Try adjusting your search filters'
          icon={<SearchX />}
          spacing
        />
      </DataStateContainer>
    )
  }

  return (
    <DataStateContainer>
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
        spacing
      />
    </DataStateContainer>
  )
}

export function BankTransactionsListWithEmptyStates({
  isEmpty,
  slots,
}: BankTransactionsTableEmptyStatesProps) {
  const { isLoading, isError } = useBankTransactionsContext()

  if (isError) {
    return (
      <DataStateContainer>
        <DataState
          status={DataStateStatus.failed}
          title='Something went wrong'
          description='We couldn’t load your transactions'
          spacing
        />
      </DataStateContainer>
    )
  }

  if (isLoading && slots.Loader) {
    return slots.Loader
  }

  if (isEmpty) {
    return <BankTransactionsTableEmptyState />
  }

  return slots.List
}
