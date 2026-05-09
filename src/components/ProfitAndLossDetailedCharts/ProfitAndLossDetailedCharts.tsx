import { useCallback, useContext, useMemo, useState } from 'react'
import { Hourglass } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SortOrder, type SortParams } from '@internal-types/utility/pagination'
import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import { humanizeTitle } from '@utils/profitAndLossUtils'
import { createPnlLineItemComparator, type Scope, type SidebarScope } from '@hooks/features/profitAndLoss/useProfitAndLoss'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { DetailedChart } from '@components/DetailedCharts/DetailedChart'
import { type ColorSelector, type FallbackFillSelector } from '@components/DetailedCharts/types'
import { DetailedTable, type DetailedTableStringOverrides } from '@components/DetailedTable/DetailedTable'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { DetailReportModal } from '@components/ProfitAndLossDetailedCharts/DetailReportModal'
import { ProfitAndLossDetailedChartsHeader } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedChartsHeader'
import { usePnlDetailedTableRows } from '@components/ProfitAndLossDetailedCharts/usePnlDetailedTableRows'
import { isLineItemUncategorized, mapTypesToColors } from '@components/ProfitAndLossDetailedCharts/utils'
import type { ProfitAndLossDetailReportProps } from '@components/ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { type SelectedLineItem } from '@components/ProfitAndLossReport/ProfitAndLossReport'
export interface DetailedChartStringOverrides {
  expenseChartHeader?: string
  revenueChartHeader?: string
  revenueToggleLabel?: string
  expenseToggleLabel?: string
}

export interface ProfitAndLossDetailedChartsSlotProps {
  detailedTable?: {
    showTypeColumn?: boolean
  }
}

export interface ProfitAndLossDetailedChartsStringOverrides {
  detailedChartStringOverrides?: DetailedChartStringOverrides
  detailedTableStringOverrides?: DetailedTableStringOverrides
  detailReportStringOverrides?: ProfitAndLossDetailReportProps['stringOverrides']
}

const EmptyState = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className='Layer__profit-and-loss-detailed-charts__empty-chart'>
        <VStack align='center' justify='center' gap='md' className='Layer__profit-and-loss-detailed-charts__empty-chart-content'>
          <Hourglass size={36} className='Layer__profit-and-loss-detailed-charts__empty-chart-icon' />
          <Span size='md' weight='bold' variant='subtle'>
            {t('bankTransactions:empty.no_transactions_found', 'No transactions found')}
          </Span>
        </VStack>
      </div>
      <HStack align='center' justify='center' gap='md' pb='md' className='Layer__profit-and-loss-detailed-charts__table-wrapper'>
        <Span size='md' variant='subtle'>{t('bankTransactions:label.upload_transactions_or_wait_for_bank_sync', 'Upload your transactions or wait for transactions to be synced from your bank.')}</Span>
      </HStack>
    </>
  )
}

const DetailedChartsDatePickerHeader = () => {
  return (
    <HStack className='Layer__ProfitAndLossDetailedCharts__DatePickerHeader--tablet'>
      <GlobalMonthPicker />
    </HStack>
  )
}

export const ProfitAndLossDetailedCharts = ({
  scope,
  hideClose = false,
  hideHeader = false,
  showDatePicker = false,
  chartColorsList,
  stringOverrides,
  slotProps,
}: {
  scope?: SidebarScope
  hideClose?: boolean
  hideHeader?: boolean
  showDatePicker?: boolean
  chartColorsList?: string[]
  stringOverrides?: ProfitAndLossDetailedChartsStringOverrides
  slotProps?: ProfitAndLossDetailedChartsSlotProps
}) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const {
    chartDataRevenue,
    tableDataRevenue,
    totalRevenue,
    chartDataExpenses,
    tableDataExpenses,
    totalExpenses,
    sortBy: _oldSortByScope,
    isLoading,
    filters,
    dateRange,
    sidebarScope,
    setSidebarScope,
  } = useContext(ProfitAndLossContext)

  const activeScope: Scope = scope ?? sidebarScope ?? 'expenses'
  const sortOrder = filters[activeScope]?.sortOrder === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC
  const sortByField = filters[activeScope]?.sortBy ?? 'value'

  const chartData =
    activeScope === 'revenue' ? chartDataRevenue : chartDataExpenses
  const tableData =
    activeScope === 'revenue' ? tableDataRevenue : tableDataExpenses
  const total =
    (activeScope === 'revenue' ? totalRevenue : totalExpenses) ?? 0

  const showTypeColumn = slotProps?.detailedTable?.showTypeColumn ?? true
  const tableHasType = showTypeColumn
    && tableData.length > 0
    && tableData.every(item => item.type !== undefined)

  const sortParams = useMemo<SortParams<string>>(() => {
    if (!tableHasType && sortByField === 'type') {
      return { sortBy: 'value', sortOrder: SortOrder.DESC }
    }
    return { sortBy: sortByField, sortOrder: sortOrder }
  }, [tableHasType, sortByField, sortOrder])

  const isEmpty = useMemo(() => {
    if (isLoading) return false
    const chartDataValues = chartData.map(x => ({
      ...x,
      value: x.value > 0 ? x.value : 0,
    }))
    return chartDataValues.length === 0 || !chartDataValues.find(x => x.value !== 0)
  }, [chartData, isLoading])

  const [hoveredItem, setHoveredItem] = useState<PnlChartLineItem | undefined>(undefined)
  const [selectedItem, setSelectedItem] = useState<SelectedLineItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleValueClick = useCallback((item: PnlChartLineItem) => {
    setSelectedItem({
      lineItemName: item.name,
      breadcrumbPath: [{ name: item.name, display_name: item.displayName }],
    })
    setIsModalOpen(true)
  }, [])

  const typeColorMapping = useMemo(
    () => mapTypesToColors<PnlChartLineItem>(chartData, chartColorsList),
    [chartData, chartColorsList],
  )
  const colorSelector: ColorSelector<PnlChartLineItem> = useCallback(
    (item: PnlChartLineItem) => typeColorMapping(item.name),
    [typeColorMapping],
  )

  const fallbackFillSelector: FallbackFillSelector<PnlChartLineItem> = useCallback(
    (item: PnlChartLineItem) => isLineItemUncategorized(item),
    [],
  )

  const chartInteractionProps = useMemo(() => ({
    hoveredItem,
    setHoveredItem: (item: PnlChartLineItem | undefined) => setHoveredItem(item),
  }), [hoveredItem])

  const tableInteractionProps = useMemo(() => ({
    ...chartInteractionProps,
    onValueClick: (item: PnlChartLineItem) => handleValueClick(item),
  }), [chartInteractionProps, handleValueClick])

  const stylingProps = useMemo(() => ({
    colorSelector,
    fallbackFillSelector,
  }), [colorSelector, fallbackFillSelector])

  const sortedTableData = useMemo(() => {
    if (sortParams.sortBy === sortByField && sortParams.sortOrder === sortOrder) {
      return tableData
    }
    return [...tableData].sort(createPnlLineItemComparator(sortParams))
  }, [tableData, sortParams, sortByField, sortOrder])

  const tableDataWithTotal = useMemo(() => ({
    data: sortedTableData,
    total,
  }), [sortedTableData, total])

  const chartDataWithTotal = useMemo(() => ({
    data: chartData,
    total,
  }), [chartData, total])

  const detailedTableRows = usePnlDetailedTableRows({
    data: tableDataWithTotal,
  })

  const sortFunction = useCallback((sortParams: SortParams<string>, defaultSortOrder?: SortOrder) => {
    if (sortParams.sortBy) {
      _oldSortByScope(activeScope, sortParams.sortBy, sortParams.sortOrder, defaultSortOrder)
    }
  }, [_oldSortByScope, activeScope])

  const handleClose = useCallback(() => setSidebarScope(undefined), [setSidebarScope])

  return (
    <div className='Layer__profit-and-loss-detailed-charts'>
<<<<<<< HEAD
      <ProfitAndLossDetailedChartsHeader
        visible={!hideHeader}
        mode={isDesktop ? 'desktop' : 'tablet'}
        title={humanizeTitle(activeScope, stringOverrides?.detailedChartStringOverrides, t)}
        date={dateRange.startDate}
        showCloseButton={!hideClose}
        showDatePicker={showDatePicker}
        onClose={handleClose}
      />
=======
      {!hideHeader && (
        <ProfitAndLossDetailedChartsHeader
          mode={isDesktop ? 'desktop' : 'tablet'}
          title={humanizeTitle(activeScope, stringOverrides?.detailedChartStringOverrides, t)}
          date={dateRange.startDate}
          showCloseButton={!hideClose}
          showDatePicker={showDatePicker}
          onClose={handleClose}
        />
      )}
>>>>>>> main

      <div className='Layer__profit-and-loss-detailed-charts__content'>
        {isEmpty
          ? <EmptyState />
          : (
            <>

              <DetailedChart<PnlChartLineItem>
                data={chartDataWithTotal}
                slots={{
                  Header: showDatePicker ? <DetailedChartsDatePickerHeader /> : undefined,
                }}
                interactionProps={chartInteractionProps}
                stylingProps={stylingProps}
                isLoading={isLoading}
              />
              <DetailedTable<PnlChartLineItem>
                key={activeScope}
                sortParams={sortParams}
                sortFunction={sortFunction}
                stylingProps={stylingProps}
                interactionProps={tableInteractionProps}
                rows={detailedTableRows}
                stringOverrides={stringOverrides?.detailedTableStringOverrides}
                {...slotProps?.detailedTable}
              />
            </>
          )}
      </div>

      <DetailReportModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedItem={selectedItem}
        stringOverrides={stringOverrides?.detailReportStringOverrides}
      />
    </div>
  )
}
