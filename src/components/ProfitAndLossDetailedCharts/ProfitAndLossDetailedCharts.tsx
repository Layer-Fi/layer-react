import React, { useContext, useState } from 'react'
import XIcon from '../../icons/X'
import { humanizeTitle } from '../../utils/profitAndLossUtils'
import { Button, ButtonVariant } from '../Button'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { Text, TextSize, TextWeight } from '../Typography'
import { DetailedChart } from './DetailedChart'
import { DetailedTable } from './DetailedTable'
import { Filters } from './Filters'
import classNames from 'classnames'
import { format } from 'date-fns'

export const ProfitAndLossDetailedCharts = () => {
  const {
    filteredData,
    filteredTotal,
    sortBy,
    filters,
    isLoading,
    dateRange,
    sidebarScope,
    setSidebarScope,
    setFilterTypes,
  } = useContext(PNL.Context)

  const [hoveredItem, setHoveredItem] = useState<string | undefined>()

  return (
    <div
      className={classNames(
        'Layer__profit-and-loss__side-panel',
        sidebarScope && 'open',
      )}
    >
      <div className='Layer__profit-and-loss-detailed-charts'>
        <header className='Layer__profit-and-loss-detailed-charts__header'>
          <div className='Layer__profit-and-loss-detailed-charts__head'>
            <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
              {humanizeTitle(sidebarScope)}
            </Text>
            <Text size={TextSize.sm} className='date'>
              {format(dateRange.startDate, 'LLLL, y')}
            </Text>
            <ProfitAndLossDatePicker />
          </div>
          <Button
            rightIcon={<XIcon />}
            iconOnly={true}
            onClick={() => setSidebarScope(undefined)}
            variant={ButtonVariant.secondary}
          />
        </header>

        <header className='Layer__profit-and-loss-detailed-charts__header--tablet'>
          <Button
            onClick={() => setSidebarScope(undefined)}
            variant={ButtonVariant.secondary}
          >
            Back
          </Button>
        </header>

        <div className='Layer__profit-and-loss-detailed-charts__content'>
          <DetailedChart
            filteredData={filteredData}
            filteredTotal={filteredTotal}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            sidebarScope={sidebarScope}
            date={dateRange.startDate}
          />

          <div className='Layer__profit-and-loss-detailed-charts__table-wrapper'>
            <Filters
              filteredData={filteredData}
              sidebarScope={sidebarScope}
              filters={filters}
              setFilterTypes={setFilterTypes}
            />

            <DetailedTable
              filteredData={filteredData}
              sidebarScope={sidebarScope}
              filters={filters}
              sortBy={sortBy}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
