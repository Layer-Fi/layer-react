import { useCallback, useContext, useState } from 'react'
import { format } from 'date-fns'

import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import { humanizeTitle } from '@utils/profitAndLossUtils'
import { useElementViewSize } from '@hooks/useElementViewSize/useElementViewSize'
import { type SidebarScope } from '@hooks/useProfitAndLoss/useProfitAndLoss'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import XIcon from '@icons/X'
import { BackButton } from '@components/Button/BackButton'
import { Button, ButtonVariant } from '@components/Button/Button'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { DetailedChart } from '@components/ProfitAndLossDetailedCharts/DetailedChart'
import { DetailedTable, type DetailedTableStringOverrides } from '@components/ProfitAndLossDetailedCharts/DetailedTable'
import { DetailedTableMobile, type DetailedTableMobileStringOverrides } from '@components/ProfitAndLossDetailedCharts/DetailedTableMobile'
import { DetailReportModal } from '@components/ProfitAndLossDetailedCharts/DetailReportModal'
import type { ProfitAndLossDetailReportProps } from '@components/ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { type SelectedLineItem } from '@components/ProfitAndLossReport/ProfitAndLossReport'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

export interface DetailedChartStringOverrides {
  expenseChartHeader?: string
  revenueChartHeader?: string
}

export interface ProfitAndLossDetailedChartsStringOverrides {
  detailedChartStringOverrides?: DetailedChartStringOverrides
  detailedTableStringOverrides?: DetailedTableStringOverrides
  detailedTableMobileStringOverrides?: DetailedTableMobileStringOverrides
  detailReportStringOverrides?: ProfitAndLossDetailReportProps['stringOverrides']
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
  const {
    filteredDataRevenue,
    filteredTotalRevenue,
    filteredDataExpenses,
    filteredTotalExpenses,
    sortBy,
    isLoading,
    filters,
    dateRange,
    sidebarScope,
    setSidebarScope,
  } = useContext(ProfitAndLossContext)

  const theScope = scope ? scope : sidebarScope
  const data =
    theScope === 'revenue' ? filteredDataRevenue : filteredDataExpenses
  const total =
    theScope === 'revenue' ? filteredTotalRevenue : filteredTotalExpenses

  const [hoveredItem, setHoveredItem] = useState<PnlChartLineItem | undefined>(undefined)
  const [selectedItem, setSelectedItem] = useState<SelectedLineItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  const handleValueClick = useCallback((item: PnlChartLineItem) => {
    setSelectedItem({
      lineItemName: item.name,
      breadcrumbPath: [{ name: item.name, display_name: item.displayName }],
    })
    setIsModalOpen(true)
  }, [])

  return (
    <div className='Layer__profit-and-loss-detailed-charts'>
      <header className='Layer__profit-and-loss-detailed-charts__header'>
        <div className='Layer__profit-and-loss-detailed-charts__head'>
          <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
            {humanizeTitle(theScope, stringOverrides?.detailedChartStringOverrides)}
          </Text>
          <Text size={TextSize.sm} className='date'>
            {format(dateRange.startDate, 'LLLL, y')}
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
            {humanizeTitle(theScope, stringOverrides?.detailedChartStringOverrides)}
          </Text>
          <Text size={TextSize.sm} className='date'>
            {format(dateRange.startDate, 'LLLL, y')}
          </Text>
        </div>
      </header>

      <div className='Layer__profit-and-loss-detailed-charts__content'>
        <DetailedChart
          filteredData={data}
          filteredTotal={total}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          sidebarScope={theScope}
          date={dateRange.startDate}
          isLoading={isLoading}
          chartColorsList={chartColorsList}
          showDatePicker={showDatePicker}
        />

        <div className='Layer__profit-and-loss-detailed-charts__table-wrapper' ref={containerRef}>
          {view === 'mobile'
            ? (
              <DetailedTableMobile
                filteredData={data}
                sidebarScope={theScope}
                filters={filters}
                sortBy={sortBy}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
                chartColorsList={chartColorsList}
                stringOverrides={stringOverrides?.detailedTableMobileStringOverrides}
                onValueClick={handleValueClick}
              />
            )
            : (
              <DetailedTable
                filteredData={data}
                sidebarScope={theScope}
                filters={filters}
                sortBy={sortBy}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
                chartColorsList={chartColorsList}
                stringOverrides={stringOverrides?.detailedTableStringOverrides}
                onValueClick={handleValueClick}
              />
            )}
        </div>
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
