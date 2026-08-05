import { type PropsWithChildren } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsContext } from '@providers/features/bankTransactions/BankTransactions/BankTransactionsContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/features/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { ConditionalList } from '@components/utility/ConditionalList'
import { Loader } from '@ui/Loader/Loader'
import { BankTransactionsEmptyState, BankTransactionsErrorState } from '@features/bankTransactions/BankTransactionsDataStates/BankTransactionsDataStates'
import { BankTransactionsListItem } from '@features/bankTransactions/BankTransactionsList/BankTransactionsListItem'
import { BankTransactionsListSelectAllHeader } from '@features/bankTransactions/BankTransactionsList/BankTransactionsListSelectAllHeader'
import { BankTransactionsPaginatedList } from '@features/bankTransactions/BankTransactionsPaginatedList/BankTransactionsPaginatedList'

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

  const showSelectAllHeader =
    isCategorizationEnabled && !isLoading && !isError && (bankTransactions?.length ?? 0) > 0

  return (
    <>
      {showSelectAllHeader && (
        <BankTransactionsListSelectAllHeader bankTransactions={bankTransactions} />
      )}
      <ConditionalList
        list={bankTransactions ?? EMPTY_ARRAY}
        isLoading={isLoading}
        isError={isError}
        Loading={<BankTransactionsListLoader />}
        Error={<BankTransactionsErrorState />}
        Empty={<BankTransactionsEmptyState />}
        Container={BankTransactionsListContainer}
      >
        {({ item }) => (
          <BankTransactionsListItem key={item.id} bankTransaction={item} />
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
