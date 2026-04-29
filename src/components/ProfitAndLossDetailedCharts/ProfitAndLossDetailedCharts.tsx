import { useCallback, useContext, useMemo, useState } from 'react'
import { Hourglass } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { DateFormat } from '@utils/i18n/date/patterns'
import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import { humanizeTitle } from '@utils/profitAndLossUtils'
import { type Scope, type SidebarScope } from '@hooks/features/profitAndLoss/useProfitAndLoss'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import XIcon from '@icons/X'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BackButton } from '@components/Button/BackButton'
import { Button, ButtonVariant } from '@components/Button/Button'
import { DetailedChart } from '@components/DetailedCharts/DetailedChart'
import { type ColorSelector, type FallbackFillSelector } from '@components/DetailedCharts/types'
import { DetailedTable, type DetailedTableStringOverrides } from '@components/DetailedTable/DetailedTable'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { DetailReportModal } from '@components/ProfitAndLossDetailedCharts/DetailReportModal'
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
  const { formatDate } = useIntlFormatter()
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

  const sortParams = useMemo(() => ({
    sortBy: sortByField,
    sortOrder: sortOrder,
  }), [sortByField, sortOrder])

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

  const tableDataWithTotal = useMemo(() => ({
    data: tableData,
    total,
  }), [tableData, total])

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

  return (
    <div className='Layer__profit-and-loss-detailed-charts'>
      {!hideHeader && (
        <header className='Layer__profit-and-loss-detailed-charts__header'>
          <VStack className='Layer__profit-and-loss-detailed-charts__head'>
            <Span size='lg' weight='bold' className='title'>
              {humanizeTitle(activeScope, stringOverrides?.detailedChartStringOverrides, t)}
            </Span>
            <Span size='sm' className='date'>
              {formatDate(dateRange.startDate, DateFormat.MonthYear)}
            </Span>
            {showDatePicker && <GlobalMonthPicker />}
          </VStack>
          {!hideClose && (
            <Button
              rightIcon={<XIcon />}
              iconOnly={true}
              onClick={() => setSidebarScope(undefined)}
              variant={ButtonVariant.secondary}
            />
          )}
        </header>
      )}

      {!hideHeader && (
        <header className='Layer__profit-and-loss-detailed-charts__header--tablet'>
          {!hideClose && (
            <BackButton onClick={() => setSidebarScope(undefined)} />
          )}
          <VStack className='Layer__profit-and-loss-detailed-charts__head'>
            <Span size='lg' weight='bold' className='title'>
              {humanizeTitle(activeScope, stringOverrides?.detailedChartStringOverrides, t)}
            </Span>
            <Span size='sm' className='date'>
              {formatDate(dateRange.startDate, DateFormat.MonthYear)}
            </Span>
          </VStack>
        </header>
      )}

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
