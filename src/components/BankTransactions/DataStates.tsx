import React from 'react'
import { BankTransaction } from '../../types'
import { DataState, DataStateStatus } from '../DataState'

interface DataStatesProps {
  bankTransactions?: BankTransaction[]
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  refetch: () => void
}

export const DataStates = ({
  bankTransactions,
  isLoading,
  isValidating,
  error,
  refetch,
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
            title='You are up to date with transactions!'
            description='All uncategorized transaction will be displayed here'
            onRefresh={() => refetch()}
            isLoading={isValidating}
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
