import { useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import type { NestedCategorization } from '@schemas/categorization'
import { getResolvedCategoryName } from '@utils/categories'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { getCategorizationRuleAmountLabel, getCategorizationRuleCounterpartyLabel, getCategorizationRuleDirectionLabel } from '@components/CategorizationRules/utils'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

import './categorizationRulesMobileList.scss'

type CategorizationRuleMobileListItemProps = {
  rule: CategorizationRule
  options: NestedCategorization[]
  onEditPress?: (rule: CategorizationRule) => void
  onDeletePress: (rule: CategorizationRule) => void
}

const CategorizationRuleMobileListItem = ({
  rule,
  options,
  onEditPress,
  onDeletePress,
}: CategorizationRuleMobileListItemProps) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const counterpartyLabel = getCategorizationRuleCounterpartyLabel(rule)
  const hasAmountFilter = rule.amountMinFilter != null || rule.amountMaxFilter != null
  const categoryName = rule.category ? getResolvedCategoryName(rule.category, options) : undefined

  return (
    <HStack justify='space-between' align='center' gap='sm' className='Layer__CategorizationRulesMobileListItem'>
      <VStack gap='2xs' className='Layer__CategorizationRulesMobileListItem__Content'>
        <Span weight='bold' ellipsis>{counterpartyLabel}</Span>
        <Span size='sm' variant='subtle'>
          {t('categorizationRules:label.direction_value', 'Direction: {{value}}', { value: getCategorizationRuleDirectionLabel(rule.bankDirectionFilter, t) })}
        </Span>
        {hasAmountFilter && (
          <Span size='sm' variant='subtle'>
            {t('categorizationRules:label.amount_value', 'Amount: {{value}}', { value: getCategorizationRuleAmountLabel(rule, formatCurrencyFromCents, t) })}
          </Span>
        )}
        {categoryName && (
          <Span size='sm' variant='subtle'>
            {t('categorizationRules:label.category_value', 'Category: {{value}}', { value: categoryName })}
          </Span>
        )}
      </VStack>
      <HStack gap='3xs' align='center'>
        {onEditPress && (
          <Button
            inset
            icon
            onPress={() => onEditPress(rule)}
            aria-label={t('categorizationRules:action.edit_rule', 'Edit Rule')}
            variant='ghost'
          >
            <Pencil size={16} />
          </Button>
        )}
        <Button
          inset
          icon
          onPress={() => onDeletePress(rule)}
          aria-label={t('categorizationRules:action.delete_rule', 'Delete Rule')}
          variant='ghost'
        >
          <Trash2 size={16} />
        </Button>
      </HStack>
    </HStack>
  )
}

export interface CategorizationRulesMobileListProps {
  data: CategorizationRule[] | undefined
  isLoading: boolean
  isError: boolean
  paginationProps: TablePaginationProps
  options: NestedCategorization[]
  onEditRule?: (rule: CategorizationRule) => void
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
    <CategorizationRuleMobileListItem
      rule={rule}
      options={options}
      onEditPress={onEditRule}
      onDeletePress={onDeleteRule}
    />
  ), [options, onEditRule, onDeleteRule])

  return (
    <div className='Layer__CategorizationRulesMobileList'>
      <PaginatedMobileList
        ariaLabel={t('categorizationRules:label.categorization_rules', 'Categorization rules')}
        data={data}
        isLoading={isLoading}
        isError={isError}
        renderItem={renderItem}
        paginationProps={paginationProps}
        slots={slots}
      />
    </div>
  )
}
