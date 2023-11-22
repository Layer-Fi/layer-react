import React, { useState, useContext } from 'react'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { add, endOfMonth, format, startOfMonth, Duration } from 'date-fns'

export const ProfitAndLossDatePicker = () => {
  const { changeDateRange } = useContext(ProfitAndLoss.Context)
  const [date, setDate] = useState(startOfMonth(Date.now()))
  const label = format(date, 'LLLL y')
  const change = (duration: Duration) => {
    const newDate = add(date, duration)
    setDate(newDate)
    changeDateRange({
      startDate: startOfMonth(newDate),
      endDate: endOfMonth(newDate),
    })
  }
  const previousMonth = () => change({ months: -1 })
  const nextMonth = () => change({ months: 1 })
  return (
    <div className="Layer__profit-and-loss-date-picker">
      <button
        aria-label="View Previous Month"
        className="Layer__profit-and-loss-date-picker__button"
        onClick={previousMonth}
      >
        <ChevronLeft
          className="Layer__profit-and-loss-date-picker__button-icon"
          size={18}
        />
      </button>
      <span className="Layer__profit-and-loss-date-picker__label">{label}</span>
      <button
        aria-label="View Next Month"
        className="Layer__profit-and-loss-date-picker__button"
        onClick={nextMonth}
      >
        <ChevronRight
          className="Layer__profit-and-loss-date-picker__button-icon"
          size={18}
        />
      </button>
    </div>
  )
}
