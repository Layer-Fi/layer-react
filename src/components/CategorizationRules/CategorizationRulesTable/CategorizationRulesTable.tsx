import { useCallback, useMemo } from 'react'
import { useListCategorizationRules } from '../../../hooks/useCategorizationRules/useListCategorizationRules'
import { Container } from '../../Container/Container'
import { PaginatedTable } from '../../DataTable/PaginatedTable'
import { DataState, DataStateStatus } from '../../DataState/DataState'
import { PencilRuler } from 'lucide-react'
import { CategorizationRule } from '../../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { ColumnConfig } from '../../DataTable/DataTable'
import { LedgerAccountCombobox } from '../../LedgerAccountCombobox/LedgerAccountCombobox'
import { Span } from '../../ui/Typography/Text'
import { CategoriesListMode } from '../../../schemas/categorization'
import { useSetCurrentCategorizationRulesPage } from '../../../providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'

enum CategorizationRuleColumns {
  Category = 'Category',
  Counterparty = 'Counterparty',
}
const COMPONENT_NAME = 'CategorizationRulesTable'

export const CategorizationRulesTable = () => {
  const listRulesParams = {}
  const { data, isLoading, isError, size, setSize, refetch } = useListCategorizationRules({ ...listRulesParams })
  const categorizationRules = useMemo(() => data?.flatMap(({ data }) => data), [data])

  const paginationMeta = data?.[data.length - 1].meta.pagination
  const hasMore = paginationMeta?.hasMore

  const { currentCategorizationRulesPage: currentPage, setCurrentCategorizationRulesPage: setCurrentPage } = useSetCurrentCategorizationRulesPage()

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const paginationProps = useMemo(() => {
    return {
      initialPage: currentPage,
      onSetPage: setCurrentPage,
      pageSize: 10,
      hasMore,
      fetchMore,
    }
  }, [hasMore, fetchMore, currentPage, setCurrentPage])

  const CategorizationRulesTableEmptyState = useCallback(() => {
    return (
      <DataState
        status={DataStateStatus.allDone}
        title='No rules found'
        description='No categorization rules have been created yet. You will receive suggestions for rules to create as you categorize transactions in the bank feed.'
        icon={<PencilRuler />}
        spacing
      />
    )
  }, [])

  const CategorizationRulesTableErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title='We couldn’t load your categorization rules'
      description='An error occurred while loading your categorization rules. Please check your connection and try again.'
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [refetch])

  const columnConfig: ColumnConfig<CategorizationRule, CategorizationRuleColumns> = useMemo(() => ({
    [CategorizationRuleColumns.Counterparty]: {
      id: CategorizationRuleColumns.Counterparty,
      header: 'Counterparty',
      cell: row => (
        <Span ellipsis>{row.counterpartyFilter?.name}</Span>
      ),
    },
    [CategorizationRuleColumns.Category]: {
      id: CategorizationRuleColumns.Category,
      header: 'Category',
      cell: row => (
        row.category
          ? (
            <LedgerAccountCombobox
              label='Account'
              value={row.category}
              mode={CategoriesListMode.All}
              onValueChange={() => {}}
              isReadOnly={true}
            />
          )
          : undefined
      ),
      isRowHeader: true,
    },
  }), [])

  return (
    <Container name='CategorizationRulesTable'>
      <PaginatedTable
        ariaLabel='CategorizationRules'
        data={categorizationRules}
        isLoading={data === undefined || isLoading}
        isError={isError}
        columnConfig={columnConfig}
        paginationProps={paginationProps}
        componentName={COMPONENT_NAME}
        slots={{
          EmptyState: CategorizationRulesTableEmptyState,
          ErrorState: CategorizationRulesTableErrorState,
        }}
      />
    </Container>
  )
}
