import { useContext, useState, useMemo } from 'react'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { useProfitAndLossDetailLines } from '../../hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useLayerContext } from '../../contexts/LayerContext'
import { SourceDetailView } from '../LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { DetailReportHeader } from '../DetailReportHeader'
import { DataTable, type ColumnConfig } from '../DataTable/DataTable'
import { centsToDollars } from '../../models/Money'
import { Badge, BadgeVariant } from '../Badge'
import { DateTime } from '../DateTime'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { DataState, DataStateStatus } from '../DataState/DataState'
import type { LedgerEntrySource } from '../../types/ledger_accounts'

const COMPONENT_NAME = 'ProfitAndLossDetailReport'

// Define the line item type that includes the source (matching the schema return type)
type PnlDetailLine = {
  readonly id: string
  readonly description?: string
  readonly amount: number
  readonly date: string
  readonly source?: LedgerEntrySource
  readonly account_name?: string
}

enum PnlDetailColumns {
  Description = 'Description',
  Date = 'Date', 
  Source = 'Source',
  Account = 'Account',
  Amount = 'Amount',
}

export interface ProfitAndLossDetailReportStringOverrides {
  title?: string
  backToListLabel?: string
  descriptionColumnHeader?: string
  dateColumnHeader?: string
  sourceColumnHeader?: string
  accountColumnHeader?: string
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
    title="Error loading detail lines"
    description="There was an error loading the profit and loss detail lines"
  />
)

const EmptyState = () => (
  <DataState 
    status={DataStateStatus.info}
    title="No detail lines found"
    description="There are no detail lines for this profit and loss item"
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

  const { data, isLoading, error } = useProfitAndLossDetailLines({
    businessId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    pnlStructureLineItemName: lineItemName,
    tagFilter,
  })

  const handleSourceClick = (source: LedgerEntrySource) => {
    setSelectedSource(source)
  }

  const handleBackToList = () => {
    setSelectedSource(null)
  }

  const columnConfig: ColumnConfig<PnlDetailLine, PnlDetailColumns> = useMemo(() => ({
    [PnlDetailColumns.Description]: {
      id: PnlDetailColumns.Description,
      header: stringOverrides?.descriptionColumnHeader || 'Description',
      cell: row => row.description || '-',
      isRowHeader: true,
    },
    [PnlDetailColumns.Date]: {
      id: PnlDetailColumns.Date,
      header: stringOverrides?.dateColumnHeader || 'Date',
      cell: row => <DateTime value={row.date} />,
    },
    [PnlDetailColumns.Source]: {
      id: PnlDetailColumns.Source,
      header: stringOverrides?.sourceColumnHeader || 'Source',
      cell: row => row.source ? (
        <button
          type='button'
          className='Layer__profit-and-loss-detail-report__source-button'
          onClick={() => handleSourceClick(row.source!)}
        >
          {row.source.entity_name}
        </button>
      ) : '-',
    },
    [PnlDetailColumns.Account]: {
      id: PnlDetailColumns.Account,
      header: stringOverrides?.accountColumnHeader || 'Account',
      cell: row => row.account_name || '-',
    },
    [PnlDetailColumns.Amount]: {
      id: PnlDetailColumns.Amount,
      header: stringOverrides?.amountColumnHeader || 'Amount',
      cell: row => (
        <Badge variant={row.amount >= 0 ? BadgeVariant.SUCCESS : BadgeVariant.WARNING}>
          ${centsToDollars(Math.abs(row.amount))}
        </Badge>
      ),
    },
  }), [stringOverrides, handleSourceClick])

  if (selectedSource) {
    return (
      <div className='Layer__profit-and-loss-detail-report'>
        <DetailReportHeader
          title={stringOverrides?.sourceDetailsTitle || 'Transaction Details'}
          onClose={handleBackToList}
          className='Layer__profit-and-loss-detail-report__header'
        />
        <DetailsList
          title={stringOverrides?.sourceDetailsTitle || 'Transaction source'}
        >
          <DetailsListItem label='Source'>
            <Badge>{selectedSource.entity_name}</Badge>
          </DetailsListItem>
          <SourceDetailView source={selectedSource} />
        </DetailsList>
      </div>
    )
  }

  return (
    <div className='Layer__profit-and-loss-detail-report'>
      <DetailReportHeader
        title={stringOverrides?.title || `${lineItemName} Details`}
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