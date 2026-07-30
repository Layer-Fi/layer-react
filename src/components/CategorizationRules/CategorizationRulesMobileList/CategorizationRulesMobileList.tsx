import { useCallback, useMemo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import type { NestedCategorization } from '@schemas/categorization'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import type { TablePaginationProps } from '@blocks/PaginatedDataTable/PaginatedDataTable'
import { CategorizationRuleMobileListItem, CategorizationRuleMobileListItemFooter } from '@components/CategorizationRules/CategorizationRulesMobileList/CategorizationRuleMobileListItem'

import './categorizationRulesMobileList.scss'

export interface CategorizationRulesMobileListProps {
  data: CategorizationRule[] | undefined
  isLoading: boolean
  isError: boolean
  paginationProps: TablePaginationProps
  options: NestedCategorization[]
  onEditRule: (rule: CategorizationRule) => void
  onDeleteRule: (rule: CategorizationRule) => void
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}

export const CategorizationRulesMobileList = ({
  data,
  isLoading,
  isError,
  paginationProps,
  options,
  onEditRule,
  onDeleteRule,
  slots,
}: CategorizationRulesMobileListProps) => {
  const { t } = useTranslation()

  const renderItem = useCallback((rule: CategorizationRule) => (
    <CategorizationRuleMobileListItem rule={rule} />
  ), [])

  const actionsMenu = useMemo(() => ({
    ariaLabel: t('categorizationRules:label.rule_actions', 'Rule actions'),
    getActions: (rule: CategorizationRule) => [
      {
        key: 'edit',
        label: t('categorizationRules:action.edit_rule', 'Edit Rule'),
        onClick: () => onEditRule(rule),
        slots: { Icon: Pencil },
      },
      {
        key: 'delete',
        label: t('categorizationRules:action.delete_rule', 'Delete Rule'),
        onClick: () => onDeleteRule(rule),
        slots: { Icon: Trash2 },
      },
    ],
  }), [t, onEditRule, onDeleteRule])

  const renderFooter = useCallback((rule: CategorizationRule) => (
    <CategorizationRuleMobileListItemFooter rule={rule} options={options} />
  ), [options])

  return (
    <div className='Layer__CategorizationRulesMobileList'>
      <PaginatedMobileList
        ariaLabel={t('categorizationRules:label.categorization_rules', 'Categorization rules')}
        data={data}
        isLoading={isLoading}
        isError={isError}
        renderItem={renderItem}
        renderFooter={renderFooter}
        slotProps={{ ActionsMenu: actionsMenu }}
        paginationProps={paginationProps}
        slots={slots}
      />
    </div>
  )
}
