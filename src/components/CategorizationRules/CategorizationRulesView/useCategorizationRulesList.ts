import { useMemo } from 'react'

import { useListCategorizationRules } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useTablePaginationProps } from '@hooks/utils/pagination/useTablePaginationProps'
import { useCategorizationRulesTableFilters, useSetCurrentCategorizationRulesPage } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'

const PAGE_SIZE = 10

export const useCategorizationRulesList = () => {
  const { tableFilters } = useCategorizationRulesTableFilters()
  const filterParams = useMemo(() => ({ query: tableFilters.query }), [tableFilters.query])

  const {
    data,
    flattenedData: categorizationRules,
    hasMore,
    isLoading,
    isError,
    fetchMore,
  } = useListCategorizationRules(filterParams)

  const {
    currentCategorizationRulesPage: pageIndex,
    setCurrentCategorizationRulesPage: onPageIndexChange,
  } = useSetCurrentCategorizationRulesPage()

  const paginationProps = useTablePaginationProps({
    filterParams,
    data,
    pageSize: PAGE_SIZE,
    hasMore,
    fetchMore,
    pageIndex,
    onPageIndexChange,
  })

  return useMemo(
    () => ({ categorizationRules, isLoading, isError, paginationProps }),
    [categorizationRules, isLoading, isError, paginationProps],
  )
}
