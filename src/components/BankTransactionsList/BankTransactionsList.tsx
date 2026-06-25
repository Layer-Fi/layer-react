import { type PropsWithChildren } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
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

type BankTransactionsListContainerProps = PropsWithChildren<{
  bankTransactions?: BankTransaction[]
}>

const BankTransactionsListContainer = ({
  bankTransactions,
  children,
}: BankTransactionsListContainerProps) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  return (
    <>
      {isCategorizationEnabled && <BankTransactionsListSelectAllHeader bankTransactions={bankTransactions} />}
      <ul className='Layer__bank-transactions__list'>
        {children}
      </ul>
    </>
  )
}

type BankTransactionsListContentProps = {
  bankTransactions?: BankTransaction[]
}

const BankTransactionsListContent = ({
  bankTransactions,
}: BankTransactionsListContentProps) => {
  const { isLoading, isError } = useBankTransactionsContext()
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  return (
    <ConditionalList
      list={bankTransactions ?? EMPTY_ARRAY}
      isLoading={isLoading}
      isError={isError}
      Loading={<BankTransactionsListLoader />}
      Error={<BankTransactionsErrorState />}
      Empty={<BankTransactionsEmptyState />}
      Container={({ children }) => (
        <BankTransactionsListContainer bankTransactions={bankTransactions}>
          {children}
        </BankTransactionsListContainer>
      )}
    >
      {({ item }) => (
        <BankTransactionsListItem key={item.id} bankTransaction={item} />
      )}
    </ConditionalList>
  )
}

export const BankTransactionsList = () => (
  <BankTransactionsPaginatedList>
    {displayedTransactions => <BankTransactionsListContent bankTransactions={displayedTransactions} />}
  </BankTransactionsPaginatedList>
)
