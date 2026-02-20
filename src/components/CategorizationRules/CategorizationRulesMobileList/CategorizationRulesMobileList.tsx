import { useCallback } from 'react'
import { Trash2 } from 'lucide-react'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import type { NestedCategorization } from '@schemas/categorization'
import { Button } from '@ui/Button/Button'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { ResolvedCategoryName } from '@components/CategorizationRules/ResolvedCategoryName'
import { getCategorizationRuleDirectionLabel } from '@components/CategorizationRules/utils'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

import './categorizationRulesMobileList.scss'

type CategorizationRuleMobileListItemProps = {
  rule: CategorizationRule
  options: NestedCategorization[]
  onDeletePress: (rule: CategorizationRule) => void
}

const CategorizationRuleMobileListItem = ({
  rule,
  options,
  onDeletePress,
}: CategorizationRuleMobileListItemProps) => (
  <HStack justify='space-between' align='center' gap='sm' className='Layer__CategorizationRulesMobileListItem'>
    <VStack gap='2xs' className='Layer__CategorizationRulesMobileListItem__Content'>
      <Span weight='bold' ellipsis>{rule.counterpartyFilter?.name}</Span>
      <HStack gap='3xs' align='center'>
        <Span size='sm' variant='subtle'>Direction:</Span>
        <Span size='sm' variant='subtle'>{getCategorizationRuleDirectionLabel(rule.bankDirectionFilter)}</Span>
      </HStack>
      {rule.category && (
        <HStack gap='3xs' align='center'>
          <Span size='sm' variant='subtle'>Category:</Span>
          <ResolvedCategoryName
            accountIdentifier={rule.category}
            options={options}
            slotProps={{ Span: { size: 'sm', variant: 'subtle' } }}
          />
        </HStack>
      )}
    </VStack>
    <Button
      inset
      icon
      onPress={() => onDeletePress(rule)}
      aria-label='Delete rule'
      variant='ghost'
    >
      <Trash2 size={16} />
    </Button>
  </HStack>
)

export interface CategorizationRulesMobileListProps {
  data: CategorizationRule[] | undefined
  isLoading: boolean
  isError: boolean
  paginationProps: TablePaginationProps
  options: NestedCategorization[]
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
  onDeleteRule,
  slots,
}: CategorizationRulesMobileListProps) => {
  const renderItem = useCallback((rule: CategorizationRule) => (
    <CategorizationRuleMobileListItem rule={rule} options={options} onDeletePress={onDeleteRule} />
  ), [options, onDeleteRule])

  return (
    <div className='Layer__CategorizationRulesMobileList'>
      <PaginatedMobileList
        ariaLabel='Categorization rules'
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
