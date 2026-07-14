import { type PropsWithChildren } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsWithExit } from '@hooks/features/bankTransactions/useBankTransactionsWithExit'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { BankTransactionsPaginatedList } from '@components/BankTransactions/BankTransactionsPaginatedList'
import { BankTransactionsEmptyState, BankTransactionsErrorState } from '@components/BankTransactions/BankTransactionsTableEmptyState'
import { BankTransactionsListItem } from '@components/BankTransactionsList/BankTransactionsListItem'
import { BankTransactionsListSelectAllHeader } from '@components/BankTransactionsList/BankTransactionsListSelectAllHeader'
import { Loader } from '@components/Loader/Loader'
import { ConditionalList } from '@components/utility/ConditionalList'

import './bankTransactionsList.scss'

const EMPTY_ARRAY = [] as const

const BankTransactionsListLoader = () => (
  <div className='Layer__bank-transactions__list-loader'>
    <Loader />
  </div>
)

const BankTransactionsListContainer = ({ children }: PropsWithChildren) => (
  <ul className='Layer__bank-transactions__list'>
    {children}
  </ul>
)

type BankTransactionsListContentProps = {
  bankTransactions?: BankTransaction[]
}

const BankTransactionsListContent = ({
  bankTransactions,
}: BankTransactionsListContentProps) => {
  const { isLoading, isError } = useBankTransactionsContext()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  const { displayItems, exitingIds, onExitComplete } = useBankTransactionsWithExit(bankTransactions)

  const showSelectAllHeader =
    isCategorizationEnabled && !isLoading && !isError && (bankTransactions?.length ?? 0) > 0

  return (
    <>
      {showSelectAllHeader && (
        <BankTransactionsListSelectAllHeader bankTransactions={bankTransactions} />
      )}
      <ConditionalList
        list={displayItems ?? EMPTY_ARRAY}
        isLoading={isLoading}
        isError={isError}
        Loading={<BankTransactionsListLoader />}
        Error={<BankTransactionsErrorState />}
        Empty={<BankTransactionsEmptyState />}
        Container={BankTransactionsListContainer}
      >
        {({ item }) => (
          <BankTransactionsListItem
            key={item.id}
            bankTransaction={item}
            isExiting={exitingIds.has(item.id)}
            onExitComplete={onExitComplete}
          />
        )}
      </ConditionalList>
    </>
  )
}

export const BankTransactionsList = () => (
  <BankTransactionsPaginatedList>
    {displayedTransactions => <BankTransactionsListContent bankTransactions={displayedTransactions} />}
  </BankTransactionsPaginatedList>
)
