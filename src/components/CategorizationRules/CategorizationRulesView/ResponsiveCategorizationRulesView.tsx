import { useCallback, useMemo, useState } from 'react'
import { PencilRuler, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { flattenCategories } from '@internal-types/categories'
import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { CategoriesListMode } from '@schemas/categorization'
import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import { useArchiveCategorizationRule } from '@hooks/api/businesses/[business-id]/categorization-rules/[categorization-rule-id]/archive/useArchiveCategorizationRule'
import { useListCategorizationRules } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBankTransactionsNavigation, useSetCurrentCategorizationRulesPage } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import BackArrow from '@icons/BackArrow'
import { Button } from '@ui/Button/Button'
import { ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { CategorizationRuleFormDrawer } from '@components/CategorizationRules/CategorizationRuleForm/CategorizationRuleFormDrawer'
import { type CategorizationRuleFormState } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'
import { CategorizationRulesMobileList } from '@components/CategorizationRules/CategorizationRulesMobileList/CategorizationRulesMobileList'
import { CategorizationRulesTable } from '@components/CategorizationRules/CategorizationRulesTable/CategorizationRulesTable'
import { getCategorizationRuleCounterpartyLabel } from '@components/CategorizationRules/utils'
import { DataState, DataStateStatus } from '@components/DataState/DataState'

const CategorizationRulesEmptyState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.allDone}
      title={t('categorizationRules:empty.no_rules_found', 'No rules found')}
      description={t('categorizationRules:empty.no_categorization_rules_yet', 'No categorization rules have been created yet. You will receive suggestions for rules to create as you categorize transactions in the bank feed.')}
      icon={<PencilRuler />}
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
  onGoBack?: () => void
  onCreateRule: () => void
}

const CategorizationRulesHeader = ({ onGoBack, onCreateRule }: CategorizationRulesHeaderProps) => {
  const { t } = useTranslation()
  return (
    <HStack fluid justify='space-between' align='center' gap='xs'>
      <HStack align='center' gap='md'>
        {onGoBack && (
          <Button variant='outlined' icon onPress={onGoBack}>
            <BackArrow />
          </Button>
        )}
        <Heading size='sm'>{t('categorizationRules:label.categorization_rules', 'Categorization Rules')}</Heading>
      </HStack>
      <HStack pie='md' align='center' gap='xs'>
        <Button onPress={onCreateRule}>
          {t('categorizationRules:action.create_rule', 'Create Rule')}
          <Plus size={16} />
        </Button>
      </HStack>
    </HStack>
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

  const { data, hasMore, isLoading: rulesAreLoading, isError, size, setSize } = useListCategorizationRules({})
  const categorizationRules = useMemo(() => data?.flatMap(({ data }) => data), [data])

  const { currentCategorizationRulesPage: currentPage, setCurrentCategorizationRulesPage: setCurrentPage } = useSetCurrentCategorizationRulesPage()

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const paginationProps = useMemo(() => ({
    initialPage: currentPage,
    onSetPage: setCurrentPage,
    pageSize: 10,
    hasMore,
    fetchMore,
  }), [hasMore, fetchMore, currentPage, setCurrentPage])

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

  const isLoading = data === undefined || rulesAreLoading || categoriesAreLoading
  const { toBankTransactionsTable } = useBankTransactionsNavigation()

  const DesktopHeader = useCallback(
    () => <CategorizationRulesHeader onCreateRule={onCreateRule} />,
    [onCreateRule],
  )

  const DesktopView = useMemo(() => (
    <BaseDetailView
      slots={{ Header: DesktopHeader, BackIcon: BackArrow }}
      name='CategorizationRulesDrawer'
      onGoBack={toBankTransactionsTable}
    >
      <CategorizationRulesTable
        data={categorizationRules}
        isLoading={isLoading}
        isError={isError}
        paginationProps={paginationProps}
        options={options}
        onEditRule={onEditRule}
        onDeleteRule={onDeleteRule}
        slots={{
          EmptyState: CategorizationRulesEmptyState,
          ErrorState: CategorizationRulesErrorState,
        }}
      />
    </BaseDetailView>
  ), [DesktopHeader, toBankTransactionsTable, categorizationRules, isLoading, isError, paginationProps, options, onEditRule, onDeleteRule])

  const MobileView = useMemo(() => (
    <VStack gap='md'>
      <CategorizationRulesHeader onGoBack={toBankTransactionsTable} onCreateRule={onCreateRule} />
      <CategorizationRulesMobileList
        data={categorizationRules}
        isLoading={isLoading}
        isError={isError}
        paginationProps={paginationProps}
        options={options}
        onEditRule={onEditRule}
        onDeleteRule={onDeleteRule}
        slots={{
          EmptyState: CategorizationRulesEmptyState,
          ErrorState: CategorizationRulesErrorState,
        }}
      />
    </VStack>
  ), [toBankTransactionsTable, onCreateRule, categorizationRules, isLoading, isError, paginationProps, options, onEditRule, onDeleteRule])

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
