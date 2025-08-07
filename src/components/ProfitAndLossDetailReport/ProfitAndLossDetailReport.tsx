import { useContext, useState, useMemo, useCallback } from 'react'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { useProfitAndLossDetailLines } from '../../hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useLayerContext } from '../../contexts/LayerContext'
import { SourceDetailView } from '../LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { DetailReportBreadcrumb } from '../DetailReportBreadcrumb'
import { DataTable, type ColumnConfig } from '../DataTable/DataTable'
import { centsToDollars } from '../../models/Money'
import { Badge } from '../Badge'
import { DateTime } from '../DateTime'
import { TextSize, TextWeight } from '../Typography'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { format } from 'date-fns'
import type { LedgerEntrySource } from '../../types/ledger_accounts'
import { BreadcrumbItem } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'

const COMPONENT_NAME = 'ProfitAndLossDetailReport'

// Define the line item type that matches the actual API response structure
type PnlDetailLine = {
  readonly id: string
  readonly entry_id: string
  readonly account: {
    readonly id: string
    readonly name: string
    readonly stable_name: string
    readonly normality: string
    readonly account_type: {
      readonly value: string
      readonly display_name: string
    }
    readonly account_subtype: {
      readonly value: string
      readonly display_name: string
    }
  }
  readonly amount: number
  readonly direction: 'CREDIT' | 'DEBIT'
  readonly date: string
  readonly source?: LedgerEntrySource
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
  backToListLabel?: string
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
  const [selectedSource, setSelectedSource] = useState<LedgerEntrySource | null>(null)

  // Use the passed breadcrumb path or create a simple one if not provided
  const dynamicBreadcrumbs = useMemo(() => {
    return breadcrumbPath || [{ name: lineItemName, display_name: lineItemName }]
  }, [breadcrumbPath, lineItemName])

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = format(startDate, 'MMM d')
    const end = format(endDate, 'MMM d')
    return `${start} - ${end}`
  }

  const { data, isLoading, error } = useProfitAndLossDetailLines({
    businessId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    pnlStructureLineItemName: lineItemName,
    tagFilter,
  })

  const handleSourceClick = useCallback((source: LedgerEntrySource) => {
    setSelectedSource(source)
  }, [])

  const handleBackToList = () => {
    setSelectedSource(null)
  }

  // Process data: sort chronologically and calculate running balance
  const processedData = useMemo(() => {
    if (!data?.lines) return { lines: [], total: 0 }

    // Sort lines chronologically (oldest first)
    const sortedLines = [...(data.lines as PnlDetailLine[])]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate running balance
    let runningBalance = 0
    const linesWithBalance = sortedLines.map((line) => {
      const signedAmount = line.direction === 'CREDIT' ? line.amount : -line.amount
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

  type ProcessedPnlDetailLine = PnlDetailLine & { signedAmount: number, runningBalance: number }

  const columnConfig: ColumnConfig<ProcessedPnlDetailLine, PnlDetailColumns> = useMemo(() => ({
    [PnlDetailColumns.Date]: {
      id: PnlDetailColumns.Date,
      header: stringOverrides?.dateColumnHeader || 'Date',
      cell: row => <DateTime value={row.date} onlyDate size={TextSize.md} weight={TextWeight.normal} color='base-600' />,
    },
    [PnlDetailColumns.Type]: {
      id: PnlDetailColumns.Type,
      header: stringOverrides?.typeColumnHeader || 'Type',
      cell: row => row.source
        ? (
          <button
            type='button'
            className='Layer__profit-and-loss-detail-report__type-button'
            onClick={() => handleSourceClick(row.source!)}
          >
            <span>
              {row.source.entity_name}
            </span>
          </button>
        )
        : '-',
    },
    [PnlDetailColumns.Account]: {
      id: PnlDetailColumns.Account,
      header: stringOverrides?.accountColumnHeader || 'Account',
      cell: row => row.account.name || '-',
    },
    [PnlDetailColumns.Description]: {
      id: PnlDetailColumns.Description,
      header: stringOverrides?.descriptionColumnHeader || 'Description',
      cell: row => row.source?.display_description || row.account.account_subtype.display_name || '-',
      isRowHeader: true,
    },
    [PnlDetailColumns.Amount]: {
      id: PnlDetailColumns.Amount,
      header: stringOverrides?.amountColumnHeader || 'Amount',
      cell: (row) => {
        const amount = centsToDollars(Math.abs(row.signedAmount))
        const isNegative = row.signedAmount < 0
        return (
          <span className='Layer__profit-and-loss-detail-report__amount'>
            {isNegative ? '-' : ''}
            $
            {amount}
          </span>
        )
      },
    },
    [PnlDetailColumns.Balance]: {
      id: PnlDetailColumns.Balance,
      header: stringOverrides?.balanceColumnHeader || 'Balance',
      cell: (row) => {
        const amount = centsToDollars(Math.abs(row.runningBalance))
        const isNegative = row.runningBalance < 0
        return (
          <span className='Layer__profit-and-loss-detail-report__amount'>
            {isNegative ? '-' : ''}
            $
            {amount}
          </span>
        )
      },
    },
  }), [stringOverrides, handleSourceClick])

  if (selectedSource) {
    return (
      <div className='Layer__profit-and-loss-detail-report'>
        <DetailReportBreadcrumb
          breadcrumbs={dynamicBreadcrumbs}
          subtitle={formatDateRange(dateRange.startDate, dateRange.endDate)}
          onClose={handleBackToList}
          onBreadcrumbClick={onBreadcrumbClick}
          className='Layer__profit-and-loss-detail-report__header'
        />
        <div className='Layer__profit-and-loss-detail-report__content'>
          <DetailsList
            title={stringOverrides?.sourceDetailsTitle || 'Transaction source'}
          >
            <DetailsListItem label='Source'>
              <Badge>{selectedSource.entity_name}</Badge>
            </DetailsListItem>
            <SourceDetailView source={selectedSource} />
          </DetailsList>
        </div>
      </div>
    )
  }

  return (
    <div className='Layer__profit-and-loss-detail-report'>
      <DetailReportBreadcrumb
        breadcrumbs={dynamicBreadcrumbs}
        subtitle={formatDateRange(dateRange.startDate, dateRange.endDate)}
        onClose={onClose}
        onBreadcrumbClick={onBreadcrumbClick}
        className='Layer__profit-and-loss-detail-report__header'
      />

      <div className='Layer__profit-and-loss-detail-report__content'>
        <DataTable<ProcessedPnlDetailLine, PnlDetailColumns>
          componentName={COMPONENT_NAME}
          ariaLabel={`${lineItemName} detail lines`}
          columnConfig={columnConfig}
          data={processedData.lines}
          isLoading={isLoading}
          isError={!!error}
          slots={{
            EmptyState,
            ErrorState,
          }}
        />
        {processedData.lines.length > 0 && (
          <div className='Layer__profit-and-loss-detail-report__total-row'>
            <div className='Layer__profit-and-loss-detail-report__total-label'>Total</div>
            <div className='Layer__profit-and-loss-detail-report__total-amount'>
              {processedData.total < 0 ? '-' : ''}
              $
              {centsToDollars(Math.abs(processedData.total))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
