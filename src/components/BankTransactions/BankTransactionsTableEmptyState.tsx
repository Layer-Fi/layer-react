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
          title={t('bankTransactions.noTransactionsFound', 'No transactions found')}
          description={t('common.tryAdjustingYourSearchFilters', 'Try adjusting your search filters')}
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
            ? t('bankTransactions.youAreUpToDateWithTransactions', 'You are up to date with transactions!')
            : t('bankTransactions.youHaveNoCategorizedTransactions', 'You have no categorized transactions')
        }
        description={
          isCategorizationMode
            ? t('bankTransactions.allUncategorizedTransactionsWillBeDisplayedHere', 'All uncategorized transactions will be displayed here')
            : t('bankTransactions.allTransactionsWillBeDisplayedHereOnceReviewed', 'All transactions will be displayed here once reviewed')
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
          title={t('common.somethingWentWrong', 'Something went wrong')}
          description={t('bankTransactions.weCouldntLoadYourTransactions', 'We couldn’t load your transactions')}
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
