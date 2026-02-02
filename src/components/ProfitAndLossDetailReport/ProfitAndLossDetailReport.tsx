import { useCallback, useContext, useMemo, useState } from 'react'
import type { Row } from '@tanstack/react-table'
import { format } from 'date-fns'

import { Direction } from '@internal-types/general'
import { convertLedgerEntrySourceToLinkingMetadata, type LedgerEntrySourceType } from '@schemas/generalLedger/ledgerEntrySource'
import { MONTH_DAY_FORMAT_SHORT } from '@config/general'
import type { PnlDetailLine } from '@hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useProfitAndLossDetailLines } from '@hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useInAppLinkContext } from '@contexts/InAppLinkContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Label } from '@ui/Typography/Text'
import { Badge } from '@components/Badge/Badge'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { DateTime } from '@components/DateTime/DateTime'
import { type BreadcrumbItem, DetailReportBreadcrumb } from '@components/DetailReportBreadcrumb/DetailReportBreadcrumb'
import { DetailsList } from '@components/DetailsList/DetailsList'
import { DetailsListItem } from '@components/DetailsList/DetailsListItem'
import { SourceDetailView } from '@components/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { Text, TextSize, TextUseTooltip, TextWeight } from '@components/Typography/Text'
import { VirtualizedDataTable } from '@components/VirtualizedDataTable/VirtualizedDataTable'

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
    const start = format(startDate, MONTH_DAY_FORMAT_SHORT)
    const end = format(endDate, MONTH_DAY_FORMAT_SHORT)
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

  type PnlDetailRowType = Row<ProcessedPnlDetailLine>
  const columnConfig: NestedColumnConfig<ProcessedPnlDetailLine> = useMemo(() => [
    {
      id: PnlDetailColumns.Date,
      header: stringOverrides?.dateColumnHeader || 'Date',
      cell: (row: PnlDetailRowType) => (
        <DateTime
          value={row.original.date}
          onlyDate
          slotProps={
            { Date: { size: TextSize.md, weight: TextWeight.normal, variant: 'subtle' } }
          }
        />
      ),
    },
    {
      id: PnlDetailColumns.Type,
      header: stringOverrides?.typeColumnHeader || 'Type',
      cell: (row: PnlDetailRowType) => {
        const { source } = row.original
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
    {
      id: PnlDetailColumns.Account,
      header: stringOverrides?.accountColumnHeader || 'Account',
      cell: (row: PnlDetailRowType) => (
        <Text
          as='span'
          withDeprecatedTooltip={TextUseTooltip.whenTruncated}
          ellipsis
        >
          {row.original.account.name || '-'}
        </Text>
      ),
    },
    {
      id: PnlDetailColumns.Description,
      header: stringOverrides?.descriptionColumnHeader || 'Description',
      cell: (row: PnlDetailRowType) => (
        <Text
          as='span'
          withDeprecatedTooltip={TextUseTooltip.whenTruncated}
          ellipsis
        >
          {row.original.source?.displayDescription || row.original.account.accountSubtype.displayName || '-'}
        </Text>
      ),
      isRowHeader: true,
    },
    {
      id: PnlDetailColumns.Amount,
      header: stringOverrides?.amountColumnHeader || 'Amount',
      cell: (row: PnlDetailRowType) => {
        return (
          <MoneySpan amount={row.original.direction === Direction.CREDIT ? row.original.amount : -row.original.amount} />
        )
      },
    },
    {
      id: PnlDetailColumns.Balance,
      header: stringOverrides?.balanceColumnHeader || 'Balance',
      cell: (row: PnlDetailRowType) => {
        return (
          <MoneySpan amount={row.original.runningBalance} />
        )
      },
    },
  ], [stringOverrides, handleSourceClick])

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
      <BaseDetailView slots={{ Header }} name='Profit And Loss Detail Report' onBack={handleBackToList} borderless>
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
    <BaseDetailView slots={{ Header }} name='Profit And Loss Detail Report' onBack={onClose} borderless>
      <VStack className='Layer__ProfitAndLossDetailReport'>
        <VirtualizedDataTable<ProcessedPnlDetailLine>
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
              <MoneySpan weight='bold' size='md' amount={rowsWithRunningBalance.total} />
            </HStack>
          </HStack>
        )}
      </VStack>
    </BaseDetailView>
  )
}
