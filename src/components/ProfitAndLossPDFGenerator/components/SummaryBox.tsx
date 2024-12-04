import React from 'react'
import { centsToDollars, MONTH_NAMES } from '../util'
import { Month } from '../../../types'
import classNames from 'classnames'

const SummaryBox = ({
  title,
  valueCents,
  moneyDelta,
  priorMonth,
  lowerIsGood = false,
  showPreviousMonth,
}: {
  title: string;
  valueCents: number;
  moneyDelta: number;
  priorMonth: Month;
  lowerIsGood?: boolean;
  showPreviousMonth?: boolean;
}) => {
  const priorMonthAbbreviation = `${MONTH_NAMES[priorMonth].slice(0, 3)}${
    MONTH_NAMES[priorMonth].length === 3 ? '' : '.'
  }`

  let deltaClass
  if (isNaN(moneyDelta)) {
    deltaClass = ''
  } else if (moneyDelta > 0) {
    deltaClass = lowerIsGood ? 'Layer__pdf-summary-box-delta--negative' : 'Layer__pdf-summary-box-delta--positive'
  } else {
    deltaClass = lowerIsGood ? 'Layer__pdf-summary-box-delta--positive' : 'Layer__pdf-summary-box-delta--negative'
  }

  return (
    <div
      className='Layer__pdf-summary-box'
    >
      <div className={'font-medium'}>{title}</div>
      <div className='Layer__pdf-summary-box-amount'>
        {centsToDollars(valueCents)}
      </div>
      <div
        className={
          classNames('Layer__pdf-summary-box-delta',
            deltaClass,
            showPreviousMonth ? '' : 'Layer__pdf-summary-box-delta--hidden')
        }
      >
        {isNaN(moneyDelta)
          ? 'N/A'
          : `${
            moneyDelta > 0 ? '+' : ''
          }${moneyDelta}% from ${priorMonthAbbreviation}`}
      </div>
    </div>
  )
}

export default SummaryBox
