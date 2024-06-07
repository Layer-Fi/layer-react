import React from 'react'
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
  return (
    <>
      {!isLoading &&
      !error &&
      (bankTransactions === undefined ||
        (bankTransactions !== undefined && bankTransactions.length === 0)) ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.allDone}
            title={
              editable
                ? 'You are up to date with transactions!'
                : 'You have no categorized transactions'
            }
            description={
              editable
                ? 'All uncategorized transaction will be displayed here'
                : 'All transaction will be displayed here once reviewed'
            }
            onRefresh={() => refetch()}
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
            onRefresh={() => refetch()}
            isLoading={isValidating}
          />
        </div>
      ) : null}
    </>
  )
}
