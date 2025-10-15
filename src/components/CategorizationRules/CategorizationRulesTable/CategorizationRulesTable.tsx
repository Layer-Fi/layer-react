import { useCallback, useMemo, useState } from 'react'
import { useListCategorizationRules } from '../../../hooks/useCategorizationRules/useListCategorizationRules'
import { Container } from '../../Container/Container'
import { PaginatedTable } from '../../DataTable/PaginatedTable'
import { DataState, DataStateStatus } from '../../DataState/DataState'
import { PencilRuler, Trash2 } from 'lucide-react'
import { CategorizationRule } from '../../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { ColumnConfig } from '../../DataTable/DataTable'
import { Span } from '../../ui/Typography/Text'
import { CategoriesListMode } from '../../../schemas/categorization'
import { useSetCurrentCategorizationRulesPage } from '../../../providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { Button } from '../../ui/Button/Button'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { useArchiveCategorizationRule } from '../../../hooks/useCategorizationRules/useArchiveCategorizationRule'
import { useLayerContext } from '../../../contexts/LayerContext/LayerContext'
import { useCategories } from '../../../hooks/categories/useCategories'
import { getLeafCategories, findCategoryForAccountIdentifier } from '../../../types/categories'

enum CategorizationRuleColumns {
  Category = 'Category',
  Counterparty = 'Counterparty',
  Delete = 'Delete',
}
const COMPONENT_NAME = 'CategorizationRulesTable'

export const CategorizationRulesTable = () => {
  const [selectedRule, setSelectedRule] = useState<CategorizationRule | null>(null)
  const [showDeletionConfirmationModal, setShowDeletionConfirmationModal] = useState(false)
  const { trigger: archiveCategorizationRuleTrigger } = useArchiveCategorizationRule()
  const { addToast } = useLayerContext()

  const { data: categories } = useCategories({ mode: CategoriesListMode.All })
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
            <Span ellipsis>{findCategoryForAccountIdentifier(row.category, options)?.display_name}</Span>
          )
          : undefined
      ),
      isRowHeader: true,
    },
    [CategorizationRuleColumns.Delete]: {
      id: CategorizationRuleColumns.Delete,
      cell: row => (
        <Button
          inset
          icon
          onPress={() => {
            setSelectedRule(row)
            setShowDeletionConfirmationModal(true)
          }}
          aria-label='Delete rule'
          variant='ghost'
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  }), [])

  return (
    <Container name='CategorizationRulesTable'>
      <PaginatedTable
        ariaLabel='CategorizationRules'
        data={categorizationRules}
        isLoading={data === undefined || rulesAreLoading}
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
