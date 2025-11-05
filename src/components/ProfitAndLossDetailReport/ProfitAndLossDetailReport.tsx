import { useContext, useState, useMemo, useCallback } from 'react'
import { useProfitAndLossDetailLines } from '../../hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { SourceDetailView } from '../LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { VirtualizedDataTable } from '../VirtualizedDataTable/VirtualizedDataTable'
import { BaseDetailView } from '../BaseDetailView/BaseDetailView'
import { type ColumnConfig } from '../DataTable/DataTable'
import { Badge } from '../Badge/Badge'
import { DateTime } from '../DateTime/DateTime'
import { Text, TextUseTooltip } from '../Typography/Text'
import { TextSize, TextWeight } from '../Typography'
import { DetailsList, DetailsListItem } from '../DetailsList'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { Button } from '../ui/Button/Button'
import { VStack, HStack } from '../ui/Stack/Stack'
import { Label } from '../ui/Typography/Text'
import { format } from 'date-fns'
import { convertLedgerEntrySourceToLinkingMetadata, LedgerEntrySourceType } from '../../schemas/generalLedger/ledgerEntrySource'
import { Direction } from '../../types/general'
import { BreadcrumbItem, DetailReportBreadcrumb } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'
import type { PnlDetailLine } from '../../hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { MoneySpan } from '../ui/Typography/MoneySpan'
import { useInAppLinkContext } from '../../contexts/InAppLinkContext'
import { ProfitAndLossContext } from '../../contexts/ProfitAndLossContext/ProfitAndLossContext'
import './profitAndLossDetailReport.scss'

const COMPONENT_NAME = 'ProfitAndLossDetailReport'

enum PnlDetailColumns {
  Date = 'Date',
  Type = 'Type',
  Account = 'Account',
  Description = 'Description',
  Amount = 'Amount',
  Balance = 'Balance',
}

type ProcessedPnlDetailLine = PnlDetailLine & { signedAmount: number, runningBalance: number }
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
    spacing
    status={DataStateStatus.failed}
    title='Error loading detail lines'
    description='There was an error loading the profit and loss detail lines'
  />
)

const EmptyState = () => (
  <DataState
    spacing
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
  const { tagFilter, dateRange } = useContext(ProfitAndLossContext)
  const [selectedSource, setSelectedSource] = useState<LedgerEntrySourceType | null>(null)

  const { renderInAppLink } = useInAppLinkContext()
  const badgeOrInAppLink = useMemo(() => {
    if (!selectedSource) return undefined
    const defaultBadge = <Badge>{selectedSource.entityName}</Badge>
    if (!renderInAppLink) {
      return defaultBadge
    }
    const linkingMetadata = convertLedgerEntrySourceToLinkingMetadata(selectedSource)
    return renderInAppLink(linkingMetadata) ?? defaultBadge
  }, [renderInAppLink, selectedSource])

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

  const handleBackToList = useCallback(() => {
    setSelectedSource(null)
  }, [])

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
      cell: row => (
        <DateTime
          value={row.date}
          onlyDate
          slotProps={
            { Date: { size: TextSize.md, weight: TextWeight.normal, variant: 'subtle' } }
          }
        />
      ),
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
      cell: row => (
        <Text
          as='span'
          withDeprecatedTooltip={TextUseTooltip.whenTruncated}
          ellipsis
        >
          {row.account.name || '-'}
        </Text>
      ),
    },
    [PnlDetailColumns.Description]: {
      id: PnlDetailColumns.Description,
      header: stringOverrides?.descriptionColumnHeader || 'Description',
      cell: row => (
        <Text
          as='span'
          withDeprecatedTooltip={TextUseTooltip.whenTruncated}
          ellipsis
        >
          {row.source?.displayDescription || row.account.accountSubtype.displayName || '-'}
        </Text>
      ),
      isRowHeader: true,
    },
    [PnlDetailColumns.Amount]: {
      id: PnlDetailColumns.Amount,
      header: stringOverrides?.amountColumnHeader || 'Amount',
      cell: (row) => {
        return (
          <MoneySpan amount={row.direction === Direction.CREDIT ? row.amount : -row.amount} />
        )
      },
    },
    [PnlDetailColumns.Balance]: {
      id: PnlDetailColumns.Balance,
      header: stringOverrides?.balanceColumnHeader || 'Balance',
      cell: (row) => {
        return (
          <MoneySpan amount={row.runningBalance} />
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
              {badgeOrInAppLink}
            </DetailsListItem>
            <SourceDetailView source={selectedSource} />
          </DetailsList>
        </VStack>
      </BaseDetailView>
    )
  }

  return (
    <BaseDetailView slots={{ Header }} name='Profit And Loss Detail Report' onGoBack={onClose} borderless>
      <VStack className='Layer__ProfitAndLossDetailReport'>
        <VirtualizedDataTable<ProcessedPnlDetailLine, PnlDetailColumns>
          componentName={COMPONENT_NAME}
          ariaLabel={`${lineItemName} detail lines`}
          columnConfig={columnConfig}
          data={rowsWithRunningBalance.lines}
          isLoading={isLoading}
          isError={isError}
          shrinkHeightToFitRows
          slots={{
            EmptyState,
            ErrorState,
          }}
        />
        {rowsWithRunningBalance.lines.length > 0 && (
          <HStack pb='sm' align='center' className='Layer__profit-and-loss-detail-report__total-row'>
            <HStack className='Layer__profit-and-loss-detail-report__total-label'>
              <Label weight='bold' size='md'>Total</Label>
            </HStack>
            <HStack className='Layer__profit-and-loss-detail-report__total-amount'>
              <MoneySpan bold size='md' amount={rowsWithRunningBalance.total} />
            </HStack>
          </HStack>
        )}
      </VStack>
    </BaseDetailView>
  )
}
