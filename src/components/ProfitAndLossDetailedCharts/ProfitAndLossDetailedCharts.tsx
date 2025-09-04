import { useCallback, useContext, useState } from 'react'
import { SidebarScope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import XIcon from '../../icons/X'
import { humanizeTitle } from '../../utils/profitAndLossUtils'
import { Button, BackButton, ButtonVariant } from '../Button'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { Text, TextSize, TextWeight } from '../Typography'
import { DetailedChart } from './DetailedChart'
import { DetailedTable, DetailedTableStringOverrides } from './DetailedTable'
import { Filters } from './Filters'
import { DetailReportModal } from './DetailReportModal'
import { format } from 'date-fns'
import type { ProfitAndLossDetailReportProps } from '../ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import type { PnlChartLineItem } from '../../utils/profitAndLossUtils'
import { type SelectedLineItem } from '../ProfitAndLossReport/ProfitAndLossReport'

export interface ProfitAndLossDetailedChartsStringOverrides {
  detailedTableStringOverrides?: DetailedTableStringOverrides
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
    setFilterTypes,
  } = useContext(PNL.Context)

  const theScope = scope ? scope : sidebarScope
  const data =
    theScope === 'revenue' ? filteredDataRevenue : filteredDataExpenses
  const total =
    theScope === 'revenue' ? filteredTotalRevenue : filteredTotalExpenses

  const [hoveredItem, setHoveredItem] = useState<string | undefined>()
  const [selectedItem, setSelectedItem] = useState<SelectedLineItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
            {humanizeTitle(theScope)}
          </Text>
          <Text size={TextSize.sm} className='date'>
            {format(dateRange.startDate, 'LLLL, y')}
          </Text>
          {showDatePicker && <ProfitAndLossDatePicker />}
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
            {humanizeTitle(theScope)}
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

        <div className='Layer__profit-and-loss-detailed-charts__table-wrapper'>
          <Filters
            filteredData={data}
            sidebarScope={theScope}
            filters={filters}
            setFilterTypes={setFilterTypes}
          />

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
