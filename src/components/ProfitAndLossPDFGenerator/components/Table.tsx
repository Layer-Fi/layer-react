import React from 'react'
import PNLColumn from './PNLColumn'
import { ProfitAndLoss } from '../../../types'
import classNames from 'classnames'

interface Props {
  selectedMonthData: ProfitAndLoss;
  priorMonthData: ProfitAndLoss;
  showPreviousMonth: boolean;
  hideLabels?: boolean;
  header?: string;
}

const Table = ({
  selectedMonthData,
  priorMonthData,
  hideLabels = false,
  showPreviousMonth,
  header,
}: Props) => {
  return (
    <div className={
      classNames(
        'Layer__pdf-table',
        !hideLabels ? 'Layer__pdf-table--with-labels' : ''
      )
    }>
      {!hideLabels && (
        <>
          <div className='Layer__pdf-table-label-column'>
            {priorMonthData && (
              <PNLColumn
                pnlData={priorMonthData}
                displayType='labels'
                spaceForHeader={!!header}
              />
            )}
          </div>
        </>
      )}
      <div className='Layer__pdf-table-columns-wrapper'>
        {header && (
          <div className='Layer__pdf-column-header'>
            {header}
          </div>
        )}
        <div className='Layer__pdf-table-columns-wrapper-inner'>
          {showPreviousMonth && (
            <div className='Layer__pdf-table-data-column'>
              {priorMonthData && (
                <PNLColumn pnlData={priorMonthData} displayType='values' />
              )}
            </div>
          )}
          <div className='Layer__pdf-table-data-column'>
            {selectedMonthData && (
              <PNLColumn
                pnlData={selectedMonthData}
                displayType='values'
                lastCol={!showPreviousMonth}
              />
            )}
          </div>
          {showPreviousMonth && (
            <div className='Layer__pdf-table-data-column'>
              {selectedMonthData && priorMonthData && (
                <PNLColumn
                  pnlData={selectedMonthData}
                  priorPnlData={priorMonthData}
                  displayType='month-over-month'
                  lastCol
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Table
