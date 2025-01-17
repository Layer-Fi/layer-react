
import InboxIcon from '../../icons/Inbox'
import { BankTransaction } from '../../types'
import { DataState, DataStateStatus } from '../DataState'

interface DataStatesProps {
  bankTransactions?: BankTransaction[]
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  refetch: () => void
  editable: boolean
}

export const DataStates = ({
  bankTransactions,
  isLoading,
  isValidating,
  error,
  refetch,
  editable,
}: DataStatesProps) => {
  const title = editable
    ? 'You are up to date with transactions!'
    : 'You have no categorized transactions'
  const description = editable
    ? 'All uncategorized transactions will be displayed here'
    : 'All transactions will be displayed here once reviewed'

  const showRefreshButton = bankTransactions?.length

  return (
    <>
      {!isLoading &&
      !error &&
      (bankTransactions === undefined ||
        (bankTransactions !== undefined && bankTransactions.length === 0)) ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={isLoading ? DataStateStatus.info : DataStateStatus.allDone}
            title={title}
            description={description}
            onRefresh={showRefreshButton ? refetch : undefined}
            isLoading={isValidating}
            icon={!editable ? <InboxIcon /> : undefined}
          />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.failed}
            title='Something went wrong'
            description='We couldn’t load your data.'
            onRefresh={refetch}
            isLoading={isValidating}
          />
        </div>
      ) : null}
    </>
  )
}
