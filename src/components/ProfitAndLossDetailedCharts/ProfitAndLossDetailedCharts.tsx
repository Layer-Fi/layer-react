import React, { useContext, useState } from 'react'
import { SidebarScope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import XIcon from '../../icons/X'
import { humanizeTitle } from '../../utils/profitAndLossUtils'
import { Button, BackButton, ButtonVariant } from '../Button'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { Text, TextSize, TextWeight } from '../Typography'
import { DetailedChart } from './DetailedChart'
import { DetailedTable } from './DetailedTable'
import { Filters } from './Filters'
import { format } from 'date-fns'

export const ProfitAndLossDetailedCharts = ({
  scope,
  hideClose = false,
  showDatePicker = false,
}: {
  scope?: SidebarScope
  hideClose?: boolean
  showDatePicker?: boolean
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
        <BackButton onClick={() => setSidebarScope(undefined)} />
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
          />
        </div>
      </div>
    </div>
  )
}
