import React, { useState, useEffect } from 'react'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { DateRange } from '../../types'
import { add, endOfMonth, format, startOfMonth } from 'date-fns'

interface DateMonthPickerProps {
  dateRange: DateRange
  changeDateRange: (dateRange: Partial<DateRange>) => void
}

export const DateMonthPicker = ({
  dateRange,
  changeDateRange,
}: DateMonthPickerProps) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const [localDate, setLocalDate] = useState(dateRange.startDate)
  const [nextOpacity, setNextOpacity] = useState(0)
  const [currentOpacity, setCurrentOpacity] = useState(1)

  const [transformStyle, setTransformStyle] = useState({
    transform: 'translateX(33%)',
    transition: 'ease',
  })

  useEffect(() => {
    if (dateRange.startDate !== localDate && !isAnimating) {
      setLocalDate(dateRange.startDate)
      setTransformStyle({ transform: 'translateX(33%)', transition: 'none' })
    }
  }, [dateRange.startDate, localDate, isAnimating])

  const change = (monthsToAdd: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setNextOpacity(1)

    const newDate = add(localDate, { months: monthsToAdd })
    if (monthsToAdd === -1) {
      setCurrentOpacity(0)
    }

    changeDateRange({
      startDate: startOfMonth(newDate),
      endDate: endOfMonth(newDate),
    })

    const translateXValue = monthsToAdd > 0 ? '0%' : '66%'
    setTransformStyle({
      transform: `translateX(${translateXValue})`,
      transition: 'transform 0.4s ease',
    })

    setTimeout(() => {
      setCurrentOpacity(1)
    }, 300)

    setTimeout(() => {
      setLocalDate(newDate)
      setTransformStyle({ transform: 'translateX(33%)', transition: 'none' })
      setIsAnimating(false)
      setNextOpacity(0)
      setCurrentOpacity(1)
    }, 300)
  }

  const currentLabel = format(localDate, 'LLLL, y')
  const prevLabel = format(add(localDate, { months: -1 }), 'LLLL, y')
  const nextLabel = format(add(localDate, { months: 1 }), 'LLLL, y')

  return (
    <div className='Layer__date-month-picker'>
      <div
        className='Layer__date-month-picker__labels-container'
        style={transformStyle}
      >
        <span className='Layer__date-month-picker__label'>{prevLabel}</span>
        <span
          className='Layer__date-month-picker__label'
          style={{ opacity: currentOpacity }}
        >
          {currentLabel}
        </span>
        <span
          className='Layer__date-month-picker__label'
          style={{ opacity: nextOpacity }}
        >
          {nextLabel}
        </span>
      </div>
      <button
        aria-label='View Previous Month'
        className='Layer__date-month-picker__button'
        onClick={() => change(-1)}
        disabled={isAnimating}
      >
        <ChevronLeft
          className='Layer__date-month-picker__button-icon'
          size={16}
        />
      </button>
      <button
        aria-label='View Next Month'
        className='Layer__date-month-picker__button'
        onClick={() => change(1)}
        disabled={isAnimating}
      >
        <ChevronRight
          className='Layer__date-month-picker__button-icon'
          size={16}
        />
      </button>
      <div className='Layer__date-month-picker__effect-blur'></div>
    </div>
  )
}