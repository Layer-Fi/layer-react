import { type PropsWithChildren, type ReactNode } from 'react'
import { SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DisplayState } from '@internal-types/bankTransactions'
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
  const { t } = useTranslation()
  const { display } = useBankTransactionsContext()
  const { filters } = useBankTransactionsFiltersContext()

  const isCategorizationMode = display !== DisplayState.categorized
  const isFiltered = Boolean(filters?.query)

  if (isFiltered) {
    return (
      <DataStateContainer>
        <DataState
          status={DataStateStatus.info}
          title={t('bankTransactions:empty.no_transactions_found', 'No transactions found')}
          description={t('bankTransactions:empty.try_adjusting_search_filters', 'Try adjusting your search filters')}
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
            ? t('bankTransactions:empty.transactions_up_to_date', 'You are up to date with transactions!')
            : t('bankTransactions:empty.no_categorized_transactions', 'You have no categorized transactions')
        }
        description={
          isCategorizationMode
            ? t('bankTransactions:empty.uncategorized_transactions_displayed_here', 'All uncategorized transactions will be displayed here')
            : t('bankTransactions:empty.transactions_displayed_here_once_reviewed', 'All transactions will be displayed here once reviewed')
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
  const { t } = useTranslation()
  const { isLoading, isError } = useBankTransactionsContext()

  if (isError) {
    return (
      <DataStateContainer>
        <DataState
          status={DataStateStatus.failed}
          title={t('common:error.something_went_wrong', 'Something went wrong')}
          description={t('bankTransactions:error.couldnt_load_transactions', 'We couldn’t load your transactions')}
          spacing
        />
      </DataStateContainer>
    )
  }

  if (isLoading && slots.Loader) {
    return slots.Loader
  }

  if (!isLoading && isEmpty) {
    return <BankTransactionsTableEmptyState />
  }

  return slots.List
}
