import { useCallback, useContext, useMemo, useState } from 'react'
import type { Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { Direction } from '@internal-types/general'
import { convertLedgerEntrySourceToLinkingMetadata, type LedgerEntrySourceType } from '@schemas/generalLedger/ledgerEntrySource'
import { DateFormat } from '@utils/i18n/date/patterns'
import type { PnlDetailLine } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/lines/useProfitAndLossDetailLines'
import { useProfitAndLossDetailLines } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/lines/useProfitAndLossDetailLines'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
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

const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      spacing
      status={DataStateStatus.failed}
      title={t('reports:error.load_detail_lines', 'Error loading detail lines')}
      description={t('reports:error.load_pnl_detail_lines', 'There was an error loading the profit and loss detail lines')}
    />
  )
}

const EmptyState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      spacing
      status={DataStateStatus.info}
      title={t('reports:empty.no_detail_lines_found', 'No detail lines found')}
      description={t('reports:empty.no_detail_lines_pnl_item', 'There are no detail lines for this profit and loss item')}
    />
  )
}

export const ProfitAndLossDetailReport = ({
  lineItemName,
  breadcrumbPath,
  onClose,
  onBreadcrumbClick,
  stringOverrides,
}: ProfitAndLossDetailReportProps) => {
  const { t } = useTranslation()
  const { formatDateRange } = useIntlFormatter()
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
      header: stringOverrides?.dateColumnHeader || t('common:label.date', 'Date'),
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
      header: stringOverrides?.typeColumnHeader || t('common:label.type', 'Type'),
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
      header: stringOverrides?.accountColumnHeader || t('common:label.account', 'Account'),
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
      header: stringOverrides?.descriptionColumnHeader || t('common:label.description', 'Description'),
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
      header: stringOverrides?.amountColumnHeader || t('common:label.amount', 'Amount'),
      cell: (row: PnlDetailRowType) => {
        return (
          <MoneySpan amount={row.original.direction === Direction.CREDIT ? row.original.amount : -row.original.amount} />
        )
      },
    },
    {
      id: PnlDetailColumns.Balance,
      header: stringOverrides?.balanceColumnHeader || t('common:label.balance', 'Balance'),
      cell: (row: PnlDetailRowType) => {
        return (
          <MoneySpan amount={row.original.runningBalance} />
        )
      },
    },
  ], [stringOverrides, handleSourceClick, t])

  const Header = useCallback(() => {
    return (
      <DetailReportBreadcrumb
        breadcrumbs={dynamicBreadcrumbs}
        subtitle={formatDateRange(dateRange.startDate, dateRange.endDate, DateFormat.MonthDayShort)}
        onBreadcrumbClick={onBreadcrumbClick}
      />
    )
  }, [dynamicBreadcrumbs, dateRange, formatDateRange, onBreadcrumbClick])

  if (selectedSource) {
    return (
      <BaseDetailView slots={{ Header }} name='Profit And Loss Detail Report' onGoBack={handleBackToList} borderless>
        <VStack pi='md'>
          <DetailsList
            title={stringOverrides?.sourceDetailsTitle || t('bankTransactions:label.transaction_source', 'Transaction source')}
          >
            <DetailsListItem label={t('common:label.source', 'Source')}>
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
        <VirtualizedDataTable<ProcessedPnlDetailLine>
          componentName={COMPONENT_NAME}
          ariaLabel={t('reports:label.line_item_name_detail_lines', '{{lineItemName}} detail lines', { lineItemName })}
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
              <Label weight='bold' size='md'>{t('common:label.total', 'Total')}</Label>
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
