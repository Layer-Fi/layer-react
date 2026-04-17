import { useCallback, useContext, useMemo, useState } from 'react'
import { Hourglass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { DateFormat } from '@utils/i18n/date/patterns'
import { formatCurrencyFromCents } from '@utils/i18n/number/formatters'
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
import { type ColorSelector, DEFAULT_TYPE_COLOR_MAPPING, type DetailData, type FallbackFillSelector, type ValueFormatter } from '@components/DetailedCharts/types'
import { DetailedTable, type DetailedTableStringOverrides } from '@components/DetailedTable/DetailedTable'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { DetailReportModal } from '@components/ProfitAndLossDetailedCharts/DetailReportModal'
import { usePnlDetailedTableRows } from '@components/ProfitAndLossDetailedCharts/usePnlDetailedTableRows'
import { isLineItemUncategorized, mapTypesToColors } from '@components/ProfitAndLossDetailedCharts/utils'
import type { ProfitAndLossDetailReportProps } from '@components/ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { type SelectedLineItem } from '@components/ProfitAndLossReport/ProfitAndLossReport'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

export interface DetailedChartStringOverrides {
  expenseChartHeader?: string
  revenueChartHeader?: string
  revenueToggleLabel?: string
  expenseToggleLabel?: string
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
  showDatePicker = false,
  chartColorsList,
  stringOverrides,
}: {
  scope?: SidebarScope
  hideClose?: boolean
  showDatePicker?: boolean
  chartColorsList?: string[]
  stringOverrides?: ProfitAndLossDetailedChartsStringOverrides
}) => {
  const { t } = useTranslation()
  const { formatDate, formatPercent } = useIntlFormatter()
  const intl = useIntl()
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
    (item: PnlChartLineItem) => typeColorMapping(item.name) ?? DEFAULT_TYPE_COLOR_MAPPING,
    [typeColorMapping],
  )
  const valueFormatter: ValueFormatter = useCallback((value: number) => formatCurrencyFromCents(intl, value), [intl])
  const fallbackFillSelector: FallbackFillSelector<PnlChartLineItem> = useCallback(
    (item: PnlChartLineItem) => isLineItemUncategorized(item),
    [],
  )

  const stylingProps = useMemo(() => ({
    valueFormatter,
    colorSelector,
    fallbackFillSelector,
  }), [valueFormatter, colorSelector, fallbackFillSelector])
  const detailedTableRows = usePnlDetailedTableRows({
    data: {
      data: tableData,
      total,
    },
    formatPercent,
  })

  const sortFunction = useCallback((_data: DetailData<PnlChartLineItem>, sortParams: SortParams<string>) => {
    if (sortParams.sortBy) {
      _oldSortByScope(
        activeScope,
        sortParams.sortBy,
        sortParams.sortOrder
          ? (sortParams.sortOrder === SortOrder.ASC ? 'asc' : 'desc')
          : undefined,
      )
    }
  }, [_oldSortByScope, activeScope])

  return (
    <div className='Layer__profit-and-loss-detailed-charts'>
      <header className='Layer__profit-and-loss-detailed-charts__header'>
        <div className='Layer__profit-and-loss-detailed-charts__head'>
          <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
            {humanizeTitle(activeScope, stringOverrides?.detailedChartStringOverrides, t)}
          </Text>
          <Text size={TextSize.sm} className='date'>
            {formatDate(dateRange.startDate, DateFormat.MonthYear)}
          </Text>
          {showDatePicker && <GlobalMonthPicker />}
        </div>
        {!hideClose && (
          <Button
            rightIcon={<XIcon />}
            iconOnly={true}
            onClick={() => setSidebarScope(undefined)}
            variant={ButtonVariant.secondary}
          />
        )}
      </header>

      <header className='Layer__profit-and-loss-detailed-charts__header--tablet'>
        {!hideClose && (
          <BackButton onClick={() => setSidebarScope(undefined)} />
        )}
        <div className='Layer__profit-and-loss-detailed-charts__head'>
          <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
            {humanizeTitle(activeScope, stringOverrides?.detailedChartStringOverrides, t)}
          </Text>
          <Text size={TextSize.sm} className='date'>
            {formatDate(dateRange.startDate, DateFormat.MonthYear)}
          </Text>
        </div>
      </header>

      <div className='Layer__profit-and-loss-detailed-charts__content'>
        {isEmpty
          ? <EmptyState />
          : (
            <>

              <DetailedChart<PnlChartLineItem>
                data={{
                  data: chartData,
                  total: total,
                }}
                slots={{
                  header: showDatePicker ? <DetailedChartsDatePickerHeader /> : undefined,
                }}
                interactionProps={{
                  hoveredItem,
                  setHoveredItem: (item: PnlChartLineItem | undefined) => setHoveredItem(item),
                }}

                stylingProps={stylingProps}
                isLoading={isLoading}
              />
              <DetailedTable<PnlChartLineItem>
                key={activeScope}
                data={{
                  data: tableData,
                  total: total,
                }}
                sortParams={{
                  sortBy: sortByField,
                  sortOrder: sortOrder,
                }}
                sortFunction={sortFunction}
                stylingProps={stylingProps}
                interactionProps={{
                  hoveredItem,
                  setHoveredItem: (item: PnlChartLineItem | undefined) => setHoveredItem(item),
                  onValueClick: (item: PnlChartLineItem) => handleValueClick(item),
                }}
                rows={detailedTableRows}
                stringOverrides={stringOverrides?.detailedTableStringOverrides}
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
