import { useCallback, useMemo, useState } from 'react'
import type { Row } from '@tanstack/react-table'
import { PencilRuler, Trash2 } from 'lucide-react'

import { accountIdentifierIsForCategory, getLeafCategories } from '@internal-types/categories'
import { type AccountIdentifier } from '@schemas/accountIdentifier'
import { type CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { CategoriesListMode, type NestedCategorization } from '@schemas/categorization'
import { useCategories } from '@hooks/categories/useCategories'
import { useArchiveCategorizationRule } from '@hooks/useCategorizationRules/useArchiveCategorizationRule'
import { useListCategorizationRules } from '@hooks/useCategorizationRules/useListCategorizationRules'
import { useSetCurrentCategorizationRulesPage } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { PaginatedTable } from '@components/PaginatedDataTable/PaginatedDataTable'

import './categorizationRulesTable.scss'

enum CategorizationRuleColumns {
  Category = 'Category',
  Counterparty = 'Counterparty',
  Delete = 'Delete',
}
const COMPONENT_NAME = 'CategorizationRulesTable'

const CategoryDisplay = ({
  accountIdentifier,
  options,
}: {
  accountIdentifier: AccountIdentifier
  options: NestedCategorization[]
}) => {
  if (!accountIdentifier) return null
  const category = options.find(cat =>
    accountIdentifierIsForCategory(accountIdentifier, cat),
  )
  if (!category?.displayName) return null
  return <Span ellipsis>{category.displayName}</Span>
}

export const CategorizationRulesTable = () => {
  const [selectedRule, setSelectedRule] = useState<CategorizationRule | null>(null)
  const [showDeletionConfirmationModal, setShowDeletionConfirmationModal] = useState(false)
  const { trigger: archiveCategorizationRuleTrigger } = useArchiveCategorizationRule()
  const { addToast } = useLayerContext()

  const { data: categories, isLoading: categoriesAreLoading } = useCategories({ mode: CategoriesListMode.All })
  const options = useMemo(() => {
    if (!categories) return []
    return getLeafCategories(categories)
  }, [categories])

  const archiveCategorizationRule = useCallback(() => {
    if (selectedRule?.id) {
      archiveCategorizationRuleTrigger(selectedRule?.id).then(() => {
        setShowDeletionConfirmationModal(false)
      }).catch(() => {
        addToast({ content: 'Failed to archive categorization rule', type: 'error' })
      })
    }
  }, [addToast, archiveCategorizationRuleTrigger, selectedRule?.id])

  const { data, hasMore, isLoading: rulesAreLoading, isError, size, setSize, refetch } = useListCategorizationRules({})
  const categorizationRules = useMemo(() => data?.flatMap(({ data }) => data), [data])

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

  type CategorizationRuleRow = Row<CategorizationRule>
  const columnConfig: NestedColumnConfig<CategorizationRule> = useMemo(() => [
    {
      id: CategorizationRuleColumns.Counterparty,
      header: 'Counterparty',
      cell: (row: CategorizationRuleRow) => (
        <Span ellipsis>{row.original.counterpartyFilter?.name}</Span>
      ),
    },
    {
      id: CategorizationRuleColumns.Category,
      header: 'Category',
      cell: (row: CategorizationRuleRow) => {
        const accountIdentifier = row.original.category
        return accountIdentifier && (
          <CategoryDisplay accountIdentifier={accountIdentifier} options={options} />
        )
      },
      isRowHeader: true,
    },
    {
      id: CategorizationRuleColumns.Delete,
      cell: (row: CategorizationRuleRow) => (
        <Button
          inset
          icon
          onPress={() => {
            setSelectedRule(row.original)
            setShowDeletionConfirmationModal(true)
          }}
          aria-label='Delete rule'
          variant='ghost'
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ], [options])

  return (
    <Container name='CategorizationRulesTable'>
      <PaginatedTable
        ariaLabel='CategorizationRules'
        data={categorizationRules}
        isLoading={data === undefined || rulesAreLoading || categoriesAreLoading}
        isError={isError}
        columnConfig={columnConfig}
        paginationProps={paginationProps}
        componentName={COMPONENT_NAME}
        slots={{
          EmptyState: CategorizationRulesTableEmptyState,
          ErrorState: CategorizationRulesTableErrorState,
        }}
      />
      <BaseConfirmationModal
        isOpen={showDeletionConfirmationModal}
        onOpenChange={setShowDeletionConfirmationModal}
        title='Delete categorization rule?'
        description={`Transactions will no longer automatically be categorized as by this rule. Any transactions previously categorized to ${selectedRule?.counterpartyFilter?.name} will not be affected.`}
        onConfirm={archiveCategorizationRule}
        confirmLabel='Delete'
        cancelLabel='Cancel'
      />
    </Container>
  )
}
