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
import { DetailsList, DetailsListItem } from '../DetailsList'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { format } from 'date-fns'
import type { LedgerEntrySource } from '../../types/ledger_accounts'

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
}

export interface ProfitAndLossDetailReportStringOverrides {
  title?: string
  backToListLabel?: string
  dateColumnHeader?: string
  typeColumnHeader?: string
  accountColumnHeader?: string
  descriptionColumnHeader?: string
  amountColumnHeader?: string
  sourceDetailsTitle?: string
}

export interface ProfitAndLossDetailReportProps {
  lineItemName: string
  onClose: () => void
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
  onClose,
  stringOverrides,
}: ProfitAndLossDetailReportProps) => {
  const { businessId } = useLayerContext()
  const { tagFilter, dateRange } = useContext(ProfitAndLoss.Context)
  const [selectedSource, setSelectedSource] = useState<LedgerEntrySource | null>(null)

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

  const columnConfig: ColumnConfig<PnlDetailLine, PnlDetailColumns> = useMemo(() => ({
    [PnlDetailColumns.Date]: {
      id: PnlDetailColumns.Date,
      header: stringOverrides?.dateColumnHeader || 'Date',
      cell: row => <DateTime value={row.date} onlyDate />,
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
            <span className='Layer__profit-and-loss-detail-report__type-text'>
              {row.source.type.replace('_Ledger_Entry_Source', '').replace(/_/g, ' ')}
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
      cell: row => (
        <span className='Layer__profit-and-loss-detail-report__amount'>
          $
          {centsToDollars(Math.abs(row.amount))}
        </span>
      ),
    },
  }), [stringOverrides, handleSourceClick])

  if (selectedSource) {
    return (
      <div className='Layer__profit-and-loss-detail-report'>
        <DetailReportBreadcrumb
          breadcrumbs={['Reports', 'P&L', 'Transaction Details']}
          subtitle={formatDateRange(dateRange.startDate, dateRange.endDate)}
          onClose={handleBackToList}
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
        breadcrumbs={['Reports', 'P&L', `${lineItemName} Details`]}
        subtitle={formatDateRange(dateRange.startDate, dateRange.endDate)}
        onClose={onClose}
        className='Layer__profit-and-loss-detail-report__header'
      />

      <div className='Layer__profit-and-loss-detail-report__content'>
        <DataTable<PnlDetailLine, PnlDetailColumns>
          componentName={COMPONENT_NAME}
          ariaLabel={`${lineItemName} detail lines`}
          columnConfig={columnConfig}
          data={data?.lines as PnlDetailLine[] | undefined}
          isLoading={isLoading}
          isError={!!error}
          slots={{
            EmptyState,
            ErrorState,
          }}
        />
      </div>
    </div>
  )
}
