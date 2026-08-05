import { useCallback, useMemo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/features/categorization/categorizationRule'
import type { NestedCategorization } from '@schemas/features/categorization/nestedCategorization'
import type { TablePaginationProps } from '@hooks/utils/pagination/types'
import { PaginatedMobileList } from '@blocks/MobileList/PaginatedMobileList'
import { CategorizationRuleMobileListItem, CategorizationRuleMobileListItemFooter } from '@features/categorization/CategorizationRulesMobileList/CategorizationRuleMobileListItem'

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
    ariaLabel: t('categorization:CategorizationRulesMobileList.label.rule_actions', 'Rule actions'),
    getActions: (rule: CategorizationRule) => [
      {
        key: 'edit',
        label: t('categorization:CategorizationRulesMobileList.action.edit_rule', 'Edit Rule'),
        onClick: () => onEditRule(rule),
        slots: { Icon: Pencil },
      },
      {
        key: 'delete',
        label: t('categorization:CategorizationRulesMobileList.action.delete_rule', 'Delete Rule'),
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
        ariaLabel={t('categorization:CategorizationRulesMobileList.label.categorization_rules', 'Categorization rules')}
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
