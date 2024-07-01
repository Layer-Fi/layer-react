import React, { useContext } from 'react'
import { TableContext } from '../../contexts/TableContext'
import { Button, ButtonVariant } from '../Button'
import { DateDayPicker } from '../DateDayPicker'
import classNames from 'classnames'

export const BalanceSheetHeader = ({
  effectiveDate,
  setEffectiveDate,
  withTitle,
  withExpandAllButton,
}: {
  effectiveDate: Date
  setEffectiveDate: (date: Date) => void
  withTitle: boolean
  withExpandAllButton: boolean
}) => {
  const { tableState, toggleTableState } = useContext(TableContext)
  const headerClassNames = classNames('Layer__balance-sheet__header', {
    'Layer__balance-sheet__header--no-title': !withTitle,
  })
  return (
    <div className={headerClassNames}>
      {withTitle && (
        <h2 className='Layer__balance-sheet__title'>Balance Sheet</h2>
      )}
      <div className='Layer__balance-sheet__actions'>
        <div className='Layer__balance-sheet__actions__date-picker'>
          <DateDayPicker
            dateDay={effectiveDate}
            changeDateDay={date => setEffectiveDate(date)}
          />
          {withExpandAllButton && (
            <Button
              onClick={toggleTableState}
              variant={ButtonVariant.secondary}
            >
              {!tableState ? 'Expand all rows' : 'Collapse all rows'}
            </Button>
          )}
        </div>
        {/* Re-enable when we have balance sheet downloading available */}
        {/* <Button
          variant={ButtonVariant.secondary}
          rightIcon={<DownloadCloud size={12} />}
        >
          Download
        </Button> */}
      </div>
    </div>
  )
}
