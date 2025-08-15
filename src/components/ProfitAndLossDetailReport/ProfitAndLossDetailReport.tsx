import { useContext, useState, useMemo, useCallback } from 'react'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { useProfitAndLossDetailLines } from '../../hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useLayerContext } from '../../contexts/LayerContext'
import { SourceDetailView } from '../LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { VirtualizedDataTable } from '../VirtualizedDataTable/VirtualizedDataTable'
import { BaseDetailView } from '../BaseDetailView/BaseDetailView'
import { type ColumnConfig } from '../DataTable/DataTable'
import { Badge } from '../Badge'
import { DateTime } from '../DateTime'
import { TextSize, TextWeight } from '../Typography'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { Button } from '../ui/Button/Button'
import { VStack } from '../ui/Stack/Stack'
import { format } from 'date-fns'
import type { LedgerEntrySource } from '../../types/ledger_accounts'
import { Direction } from '../../types'
import { BreadcrumbItem, DetailReportBreadcrumb } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'
import type { PnlDetailLine, LedgerEntrySourceType } from '../../hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { MoneySpan } from '../ui/Typography/MoneyText'

const COMPONENT_NAME = 'ProfitAndLossDetailReport'

/* Our source detail component expects an old schema.
 * This converts for backwards compatibility until we switch that component to our new schemas with fixed variable types. */
const convertSourceForDetailView = (source: LedgerEntrySourceType): LedgerEntrySource => {
  return {
    display_description: source.displayDescription,
    entity_name: source.entityName,
    type: source.type,
  }
}

enum PnlDetailColumns {
  Date = 'Date',
  Type = 'Type',
  Account = 'Account',
  Description = 'Description',
  Amount = 'Amount',
  Balance = 'Balance',
}

export interface ProfitAndLossDetailReportStringOverrides {
  title?: string
  dateColumnHeader?: string
  typeColumnHeader?: string
  accountColumnHeader?: string
  descriptionColumnHeader?: string
  amountColumnHeader?: string
  balanceColumnHeader?: string
  sourceDetailsTitle?: string
}

export interface ProfitAndLossDetailReportProps {
  lineItemName: string
  breadcrumbPath?: BreadcrumbItem[]
  onClose: () => void
  onBreadcrumbClick?: (lineItemName: string) => void
  stringOverrides?: ProfitAndLossDetailReportStringOverrides
}

const ErrorState = () => (
  <DataState
    status={DataStateStatus.failed}
    title='Error loading detail lines'
    description='There was an error loading the profit and loss detail lines'
  />
)

const EmptyState = () => (
  <DataState
    spacing={true}
    status={DataStateStatus.info}
    title='No detail lines found'
    description='There are no detail lines for this profit and loss item'
  />
)

export const ProfitAndLossDetailReport = ({
  lineItemName,
  breadcrumbPath,
  onClose,
  onBreadcrumbClick,
  stringOverrides,
}: ProfitAndLossDetailReportProps) => {
  const { businessId } = useLayerContext()
  const { tagFilter, dateRange } = useContext(ProfitAndLoss.Context)
  const [selectedSource, setSelectedSource] = useState<LedgerEntrySourceType | null>(null)

  const dynamicBreadcrumbs = useMemo(() => {
    return breadcrumbPath || [{ name: lineItemName, display_name: lineItemName }]
  }, [breadcrumbPath, lineItemName])

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = format(startDate, 'MMM d')
    const end = format(endDate, 'MMM d')
    return `${start} - ${end}`
  }

  const { data, isLoading, isError } = useProfitAndLossDetailLines({
    businessId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    pnlStructureLineItemName: lineItemName,
    tagFilter,
  })

  const handleSourceClick = useCallback((source: LedgerEntrySourceType) => {
    setSelectedSource(source)
  }, [])

  const handleBackToList = () => {
    setSelectedSource(null)
  }

  type ProcessedPnlDetailLine = PnlDetailLine & { signedAmount: number, runningBalance: number }

  const rowsWithRunningBalance = useMemo(() => {
    if (!data?.lines) return { lines: [], total: 0 }

    let runningBalance = 0
    const linesWithBalance: ProcessedPnlDetailLine[] = data.lines.map((line) => {
      const signedAmount = line.direction === Direction.CREDIT ? line.amount : -line.amount
      runningBalance += signedAmount
      return {
        ...line,
        signedAmount,
        runningBalance,
      }
    })

    return {
      lines: linesWithBalance,
      total: runningBalance,
    }
  }, [data?.lines])

  const columnConfig: ColumnConfig<ProcessedPnlDetailLine, PnlDetailColumns> = useMemo(() => ({
    [PnlDetailColumns.Date]: {
      id: PnlDetailColumns.Date,
      header: stringOverrides?.dateColumnHeader || 'Date',
      cell: row => <DateTime value={row.date} onlyDate size={TextSize.md} weight={TextWeight.normal} variant='subtle' />,
    },
    [PnlDetailColumns.Type]: {
      id: PnlDetailColumns.Type,
      header: stringOverrides?.typeColumnHeader || 'Type',
      cell: (row) => {
        const { source } = row
        return source
          ? (
            <Button
              variant='text'
              onPress={() => handleSourceClick(source)}
            >
              {source.entityName}
            </Button>
          )
          : '-'
      },
    },
    [PnlDetailColumns.Account]: {
      id: PnlDetailColumns.Account,
      header: stringOverrides?.accountColumnHeader || 'Account',
      cell: row => row.account.name || '-',
    },
    [PnlDetailColumns.Description]: {
      id: PnlDetailColumns.Description,
      header: stringOverrides?.descriptionColumnHeader || 'Description',
      cell: row => row.source?.displayDescription || row.account.accountSubtype.displayName || '-',
      isRowHeader: true,
    },
    [PnlDetailColumns.Amount]: {
      id: PnlDetailColumns.Amount,
      header: stringOverrides?.amountColumnHeader || 'Amount',
      cell: (row) => {
        return (
          <span className='Layer__profit-and-loss-detail-report__amount'>
            <MoneySpan amount={row.amount} />
          </span>
        )
      },
    },
    [PnlDetailColumns.Balance]: {
      id: PnlDetailColumns.Balance,
      header: stringOverrides?.balanceColumnHeader || 'Balance',
      cell: (row) => {
        return (
          <span className='Layer__profit-and-loss-detail-report__amount'>
            <MoneySpan amount={row.runningBalance} />
          </span>
        )
      },
    },
  }), [stringOverrides, handleSourceClick])

  const Header = useCallback(() => {
    return (
      <DetailReportBreadcrumb
        breadcrumbs={dynamicBreadcrumbs}
        subtitle={formatDateRange(dateRange.startDate, dateRange.endDate)}
        onBreadcrumbClick={onBreadcrumbClick}
      />
    )
  }, [dynamicBreadcrumbs, dateRange, onBreadcrumbClick])

  if (selectedSource) {
    return (
      <BaseDetailView slots={{ Header }} name='Profit And Loss Detail Report' onGoBack={handleBackToList} borderless>
        <VStack pi='md'>
          <DetailsList
            title={stringOverrides?.sourceDetailsTitle || 'Transaction source'}
          >
            <DetailsListItem label='Source'>
              <Badge>{selectedSource.entityName}</Badge>
            </DetailsListItem>
            <SourceDetailView source={convertSourceForDetailView(selectedSource)} />
          </DetailsList>
        </VStack>
      </BaseDetailView>
    )
  }

  return (
    <BaseDetailView slots={{ Header }} name='Profit And Loss Detail Report' onGoBack={onClose} borderless>
      <VirtualizedDataTable<ProcessedPnlDetailLine, PnlDetailColumns>
        componentName={COMPONENT_NAME}
        ariaLabel={`${lineItemName} detail lines`}
        columnConfig={columnConfig}
        data={rowsWithRunningBalance.lines}
        isLoading={isLoading}
        isError={isError}
        slots={{
          EmptyState,
          ErrorState,
        }}
      />
      {rowsWithRunningBalance.lines.length > 0 && (
        <div className='Layer__profit-and-loss-detail-report__total-row'>
          <div className='Layer__profit-and-loss-detail-report__total-label'>Total</div>
          <div className='Layer__profit-and-loss-detail-report__total-amount'>
            <MoneySpan amount={rowsWithRunningBalance.total} />
          </div>
        </div>
      )}
    </BaseDetailView>
  )
}
