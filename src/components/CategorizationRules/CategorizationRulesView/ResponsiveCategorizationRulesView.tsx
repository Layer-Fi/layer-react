import { useCallback, useMemo, useState } from 'react'
import { PencilRuler, Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { CategoriesListMode } from '@schemas/categorization'
import { flattenCategories } from '@utils/categories'
import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import { useArchiveCategorizationRule } from '@hooks/api/businesses/[business-id]/categorization-rules/[categorization-rule-id]/archive/useArchiveCategorizationRule'
import { useDebouncedSearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBankTransactionsNavigation, useCategorizationRulesTableFilters } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { VStack } from '@ui/Stack/Stack'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { DataTableHeader } from '@blocks/DataTable/DataTableHeader'
import { CategorizationRuleFormDrawer } from '@components/CategorizationRules/CategorizationRuleForm/CategorizationRuleFormDrawer'
import { type CategorizationRuleFormState } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'
import { CategorizationRulesMobileList } from '@components/CategorizationRules/CategorizationRulesMobileList/CategorizationRulesMobileList'
import { CategorizationRulesTable } from '@components/CategorizationRules/CategorizationRulesTable/CategorizationRulesTable'
import { useCategorizationRulesList } from '@components/CategorizationRules/CategorizationRulesView/useCategorizationRulesList'
import { getCategorizationRuleCounterpartyLabel } from '@components/CategorizationRules/utils'
import { Container } from '@components/Container/Container'
import { ResponsiveComponent } from '@components/utility/ResponsiveComponent'

import './categorizationRulesView.scss'

const CategorizationRulesEmptyState = ({ isFiltered }: { isFiltered: boolean }) => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.allDone}
      title={isFiltered
        ? t('common:empty.results', 'No results found')
        : t('categorizationRules:empty.no_rules_found', 'No rules found')}
      description={isFiltered
        ? t('categorizationRules:empty.no_categorization_rules_match_search', 'We couldn’t find any categorization rules matching your search. Try a different search term.')
        : t('categorizationRules:empty.no_categorization_rules_yet', 'No categorization rules have been created yet. You will receive suggestions for rules to create as you categorize transactions in the bank feed.')}
      icon={isFiltered ? <Search /> : <PencilRuler />}
      spacing
      className='Layer__CategorizationRulesView__EmptyState'
    />
  )
}

const CategorizationRulesErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('categorizationRules:error.couldnt_load_data', 'We couldn’t load your categorization rules')}
      description={t('categorizationRules:error.load_categorization_rules', 'An error occurred while loading your categorization rules. Please check your connection and try again.')}
      spacing
      className='Layer__CategorizationRulesView__ErrorState'
    />
  )
}

type CategorizationRulesHeaderProps = {
  isMobile?: boolean
  onGoBack?: () => void
  onCreateRule: () => void
}

const CategorizationRulesHeader = ({ isMobile, onGoBack, onCreateRule }: CategorizationRulesHeaderProps) => {
  const { t } = useTranslation()
  const { tableFilters, setTableFilters } = useCategorizationRulesTableFilters()
  const searchProps = useDebouncedSearchProps({ query: tableFilters.query, setTableFilters })
  const HeaderActions = useCallback(() => (
    <Button onPress={onCreateRule}>
      {t('common:action.create_label', 'Create')}
      <Plus size={16} />
    </Button>
  ), [t, onCreateRule])

  return (
    <DataTableHeader
      isMobile={isMobile}
      name={t('categorizationRules:label.categorization_rules', 'Categorization Rules')}
      slots={{ HeaderActions }}
      slotProps={{
        SearchField: {
          label: t('categorizationRules:label.search_rules', 'Search rules'),
          ...searchProps,
        },
        BackButton: onGoBack ? { onPress: onGoBack } : undefined,
        Heading: { size: 'sm' },
      }}
    />
  )
}

const resolveVariant = ({ width }: { width: number }) => width < BREAKPOINTS.TABLET ? 'Mobile' : 'Desktop'

export const ResponsiveCategorizationRulesView = () => {
  const { t } = useTranslation()
  const [selectedRule, setSelectedRule] = useState<CategorizationRule | null>(null)
  const [showDeletionConfirmationModal, setShowDeletionConfirmationModal] = useState(false)
  const [formState, setFormState] = useState<CategorizationRuleFormState | null>(null)
  const { trigger: archiveCategorizationRuleTrigger } = useArchiveCategorizationRule()
  const { addToast } = useLayerContext()
  const { isMobile } = useSizeClass()

  const onCreateRule = useCallback(() => setFormState({ mode: 'create' }), [])
  const onEditRule = useCallback((rule: CategorizationRule) => setFormState({ mode: 'edit', rule }), [])
  const onFormDrawerOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setFormState(null)
  }, [])
  const onFormSuccess = useCallback(() => setFormState(null), [])

  const { data: categories, isLoading: categoriesAreLoading } = useCategories({ mode: CategoriesListMode.All })
  const options = useMemo(() => {
    if (!categories) return []
    return flattenCategories(categories)
  }, [categories])

  const { isFiltered } = useCategorizationRulesTableFilters()

  const { categorizationRules, isLoading: rulesAreLoading, isError, paginationProps } = useCategorizationRulesList()

  const onDeleteRule = useCallback((rule: CategorizationRule) => {
    setSelectedRule(rule)
    setShowDeletionConfirmationModal(true)
  }, [])

  const archiveCategorizationRule = useCallback(() => {
    if (selectedRule?.id) {
      archiveCategorizationRuleTrigger(selectedRule.id).then(() => {
        setShowDeletionConfirmationModal(false)
        setSelectedRule(null)
      }).catch(() => {
        addToast({ content: t('categorizationRules:error.archive_categorization_rule', 'Failed to archive categorization rule'), type: 'error' })
      })
    }
  }, [t, addToast, archiveCategorizationRuleTrigger, selectedRule?.id])

  const isLoading = categorizationRules === undefined || rulesAreLoading || categoriesAreLoading
  const { toBankTransactionsTable } = useBankTransactionsNavigation()

  const EmptyState = useCallback(
    () => <CategorizationRulesEmptyState isFiltered={isFiltered} />,
    [isFiltered],
  )

  const listProps = useMemo(() => ({
    data: categorizationRules,
    isLoading,
    isError,
    paginationProps,
    options,
    onEditRule,
    onDeleteRule,
    slots: {
      EmptyState,
      ErrorState: CategorizationRulesErrorState,
    },
  }), [categorizationRules, isLoading, isError, paginationProps, options, onEditRule, onDeleteRule, EmptyState])

  const DesktopView = useMemo(() => (
    <Container name='CategorizationRulesView'>
      <CategorizationRulesHeader
        onGoBack={toBankTransactionsTable}
        onCreateRule={onCreateRule}
      />
      <CategorizationRulesTable {...listProps} />
    </Container>
  ), [toBankTransactionsTable, onCreateRule, listProps])

  const MobileView = useMemo(() => (
    <VStack>
      <CategorizationRulesHeader
        isMobile
        onGoBack={toBankTransactionsTable}
        onCreateRule={onCreateRule}
      />
      <CategorizationRulesMobileList {...listProps} />
    </VStack>
  ), [toBankTransactionsTable, onCreateRule, listProps])

  const selectedRuleCounterpartyLabel = (selectedRule && getCategorizationRuleCounterpartyLabel(selectedRule))
    ?? t('bankTransactions:label.selected_counterparty', 'this counterparty')

  const responsiveSlots = useMemo(
    () => ({ Desktop: DesktopView, Mobile: MobileView }),
    [DesktopView, MobileView],
  )

  return (
    <>
      <ResponsiveComponent
        resolveVariant={resolveVariant}
        slots={responsiveSlots}
      />
      <BaseConfirmationModal
        isOpen={showDeletionConfirmationModal}
        onOpenChange={setShowDeletionConfirmationModal}
        title={t('categorizationRules:prompt.delete_categorization_rule', 'Delete categorization rule?')}
        description={t('categorizationRules:label.transaction_no_longer_automatically_categorized', 'Transactions will no longer automatically be categorized by this rule. Any transactions previously categorized to {{counterparty}} will not be affected.', { counterparty: selectedRuleCounterpartyLabel })}
        onConfirm={archiveCategorizationRule}
        confirmLabel={t('common:action.delete_label', 'Delete')}
        cancelLabel={t('common:action.cancel_label', 'Cancel')}
        useDrawer={isMobile}
      />
      <CategorizationRuleFormDrawer
        isOpen={!!formState}
        formState={formState}
        onOpenChange={onFormDrawerOpenChange}
        onSuccess={onFormSuccess}
      />
    </>
  )
}
