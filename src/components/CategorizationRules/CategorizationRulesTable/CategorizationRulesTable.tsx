import { useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import type { NestedCategorization } from '@schemas/categorization'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'
import { ResolvedCategoryName } from '@components/CategorizationRules/ResolvedCategoryName'
import { getCategorizationRuleAmountLabel, getCategorizationRuleCounterpartyLabel, getCategorizationRuleDirectionLabel } from '@components/CategorizationRules/utils'
import type { ColumnConfig } from '@components/DataTable/utils/column'
import { PaginatedTable, type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

import './categorizationRulesTable.scss'

enum CategorizationRuleColumns {
  Category = 'Category',
  Counterparty = 'Counterparty',
  Direction = 'Direction',
  Amount = 'Amount',
  Edit = 'Edit',
  Delete = 'Delete',
}

const COMPONENT_NAME = 'CategorizationRulesTable'

export interface CategorizationRulesTableProps {
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

export const CategorizationRulesTable = ({
  data,
  isLoading,
  isError,
  paginationProps,
  options,
  onEditRule,
  onDeleteRule,
  slots,
}: CategorizationRulesTableProps) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const columnConfig: ColumnConfig<CategorizationRule> = useMemo(() => [
    {
      id: CategorizationRuleColumns.Counterparty,
      header: t('common:label.counterparty', 'Counterparty'),
      cell: (row: Row<CategorizationRule>) => (
        <Span ellipsis>{getCategorizationRuleCounterpartyLabel(row.original)}</Span>
      ),
    },
    {
      id: CategorizationRuleColumns.Direction,
      header: t('common:label.direction', 'Direction'),
      cell: (row: Row<CategorizationRule>) => (
        <Span ellipsis>{getCategorizationRuleDirectionLabel(row.original.bankDirectionFilter, t)}</Span>
      ),
    },
    {
      id: CategorizationRuleColumns.Amount,
      header: t('common:label.amount', 'Amount'),
      cell: (row: Row<CategorizationRule>) => (
        <Span ellipsis>{getCategorizationRuleAmountLabel(row.original, formatCurrencyFromCents, t)}</Span>
      ),
    },
    {
      id: CategorizationRuleColumns.Category,
      header: t('common:label.category', 'Category'),
      cell: (row: Row<CategorizationRule>) => {
        const accountIdentifier = row.original.category
        if (!accountIdentifier) return null

        return <ResolvedCategoryName accountIdentifier={accountIdentifier} options={options} />
      },
      isRowHeader: true,
    },
    ...(onEditRule
      ? [{
        id: CategorizationRuleColumns.Edit,
        cell: (row: Row<CategorizationRule>) => (
          <Button
            inset
            icon
            onPress={() => onEditRule(row.original)}
            aria-label={t('categorizationRules:action.edit_rule', 'Edit Rule')}
            variant='ghost'
          >
            <Pencil size={16} />
          </Button>
        ),
      }]
      : []),
    {
      id: CategorizationRuleColumns.Delete,
      cell: (row: Row<CategorizationRule>) => (
        <Button
          inset
          icon
          onPress={() => onDeleteRule(row.original)}
          aria-label={t('categorizationRules:action.delete_rule', 'Delete Rule')}
          variant='ghost'
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ], [t, formatCurrencyFromCents, options, onEditRule, onDeleteRule])

  return (
    <PaginatedTable
      ariaLabel={t('categorizationRules:label.categorization_rules', 'Categorization rules')}
      data={data}
      isLoading={isLoading}
      isError={isError}
      columnConfig={columnConfig}
      paginationProps={paginationProps}
      componentName={COMPONENT_NAME}
      slots={slots}
    />
  )
}
