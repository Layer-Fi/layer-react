import { useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import type { NestedCategorization } from '@schemas/categorization'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'
import { ResolvedCategoryName } from '@components/CategorizationRules/ResolvedCategoryName'
import { getCategorizationRuleDirectionLabel } from '@components/CategorizationRules/utils'
import { Container } from '@components/Container/Container'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { PaginatedTable, type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

import './categorizationRulesTable.scss'

enum CategorizationRuleColumns {
  Category = 'Category',
  Counterparty = 'Counterparty',
  Direction = 'Direction',
  Delete = 'Delete',
}

const COMPONENT_NAME = 'CategorizationRulesTable'

export interface CategorizationRulesTableProps {
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

export const CategorizationRulesTable = ({
  data,
  isLoading,
  isError,
  paginationProps,
  options,
  onDeleteRule,
  slots,
}: CategorizationRulesTableProps) => {
  const columnConfig: NestedColumnConfig<CategorizationRule> = useMemo(() => [
    {
      id: CategorizationRuleColumns.Counterparty,
      header: 'Counterparty',
      cell: (row: Row<CategorizationRule>) => (
        <Span ellipsis>{row.original.counterpartyFilter?.name}</Span>
      ),
    },
    {
      id: CategorizationRuleColumns.Direction,
      header: 'Direction',
      cell: (row: Row<CategorizationRule>) => (
        <Span ellipsis>{getCategorizationRuleDirectionLabel(row.original.bankDirectionFilter)}</Span>
      ),
    },
    {
      id: CategorizationRuleColumns.Category,
      header: 'Category',
      cell: (row: Row<CategorizationRule>) => {
        const accountIdentifier = row.original.category
        if (!accountIdentifier) return null

        return <ResolvedCategoryName accountIdentifier={accountIdentifier} options={options} />
      },
      isRowHeader: true,
    },
    {
      id: CategorizationRuleColumns.Delete,
      cell: (row: Row<CategorizationRule>) => (
        <Button
          inset
          icon
          onPress={() => onDeleteRule(row.original)}
          aria-label='Delete rule'
          variant='ghost'
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ], [options, onDeleteRule])

  return (
    <Container name='CategorizationRulesTable'>
      <PaginatedTable
        ariaLabel='Categorization rules'
        data={data}
        isLoading={isLoading}
        isError={isError}
        columnConfig={columnConfig}
        paginationProps={paginationProps}
        componentName={COMPONENT_NAME}
        slots={slots}
      />
    </Container>
  )
}
