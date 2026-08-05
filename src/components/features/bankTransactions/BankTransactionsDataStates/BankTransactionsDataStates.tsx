import { Inbox, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DisplayState } from '@internal-types/features/bankTransactions/bankTransaction'
import { useBankTransactionsContext } from '@providers/features/bankTransactions/BankTransactions/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@providers/features/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { DataStateContainer } from '@ui/DataState/DataStateContainer'

export const BankTransactionsEmptyState = () => {
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
          title={t('bankTransactions:BankTransactionsDataStates.empty.no_transactions_found', 'No transactions found')}
          description={t('bankTransactions:BankTransactionsDataStates.empty.try_adjusting_search_filters', 'Try adjusting your search filters')}
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
            ? t('bankTransactions:BankTransactionsDataStates.empty.transactions_up_to_date', 'You are up to date with transactions!')
            : t('bankTransactions:BankTransactionsDataStates.empty.no_categorized_transactions', 'You have no categorized transactions')
        }
        description={
          isCategorizationMode
            ? t('bankTransactions:BankTransactionsDataStates.empty.uncategorized_transactions_displayed_here', 'All uncategorized transactions will be displayed here')
            : t('bankTransactions:BankTransactionsDataStates.empty.transactions_displayed_here_once_reviewed', 'All transactions will be displayed here once reviewed')
        }
        icon={isCategorizationMode ? undefined : <Inbox size={18} />}
        spacing
      />
    </DataStateContainer>
  )
}

export const BankTransactionsErrorState = () => {
  const { t } = useTranslation()

  return (
    <DataStateContainer>
      <DataState
        status={DataStateStatus.failed}
        title={t('common:error.something_went_wrong', 'Something went wrong')}
        description={t('bankTransactions:BankTransactionsDataStates.error.couldnt_load_transactions', 'We couldn’t load your transactions')}
        spacing
      />
    </DataStateContainer>
  )
}
