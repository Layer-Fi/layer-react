import React, { useState, useEffect } from 'react'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { Button, ButtonVariant } from '../Button'
import classNames from 'classnames'
import { add, format, startOfDay, endOfDay, startOfMonth } from 'date-fns'

interface DateDayPickerProps {
  dateDay: Date
  changeDateDay: (dateDay: Date) => void
  enableFutureDates?: boolean
  currentDateOption?: boolean
  minDate?: Date
}

export const DateDayPicker = ({
  dateDay,
  changeDateDay,
  minDate,
  enableFutureDates = false,
  currentDateOption = true,
}: DateDayPickerProps) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const [localDate, setLocalDate] = useState(startOfDay(new Date()))
  const [nextOpacity, setNextOpacity] = useState(0)
  const [currentOpacity, setCurrentOpacity] = useState(1)
  const [activeCurrentButton, setActiveCurrentButton] = useState(true)

  const [transformStyle, setTransformStyle] = useState({
    transform: 'translateX(33%)',
    transition: 'ease',
  })

  useEffect(() => {
    if (dateDay !== localDate && !isAnimating && activeCurrentButton) {
      setLocalDate(dateDay)
      setTransformStyle({ transform: 'translateX(33%)', transition: 'none' })
    }
  }, [dateDay, localDate, isAnimating])

  const change = (daysToAdd: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setNextOpacity(1)

    const newDate = add(localDate, { days: daysToAdd })
    if (daysToAdd === -1) {
      setCurrentOpacity(0)
    }

    changeDateDay(startOfDay(newDate))

    const translateXValue = daysToAdd > 0 ? '0%' : '66%'
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

  const currentLabel = format(localDate, 'MMM d, yyyy')
  const prevLabel = format(add(localDate, { days: -1 }), 'MMM d, yyyy')
  const nextLabel = format(add(localDate, { days: 1 }), 'MMM d, yyyy')

  const today = startOfDay(new Date())
  const isTodayOrAfter = localDate >= today

  const setCurrentDate = () => {
    setLocalDate(today)
    changeDateDay(startOfDay(today))
  }

  useEffect(() => {
    if (today > localDate) {
      setActiveCurrentButton(false)
    } else {
      setActiveCurrentButton(true)
    }
  }, [localDate])

  const isBeforeMinDate = minDate && localDate < startOfDay(minDate)

  const DateDayPickerWrapperClassName = classNames(
    'Layer__date-month-picker__wrapper',
    currentDateOption &&
      'Layer__date-month-picker__wrapper--current-date-option',
  )

  return (
    <div className={DateDayPickerWrapperClassName}>
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
          aria-label='View Previous Day'
          className={classNames(
            'Layer__date-month-picker__button',
            isBeforeMinDate && 'Layer__date-month-picker__button--disabled',
          )}
          onClick={() => change(-1)}
          disabled={isAnimating || isBeforeMinDate}
        >
          <ChevronLeft
            className='Layer__date-month-picker__button-icon'
            size={16}
          />
        </button>
        <button
          aria-label='View Next Day'
          className={classNames(
            'Layer__date-month-picker__button',
            !enableFutureDates && isTodayOrAfter
              ? 'Layer__date-month-picker__button--disabled'
              : undefined,
          )}
          onClick={() => change(1)}
          disabled={isAnimating || (!enableFutureDates && isTodayOrAfter)}
        >
          <ChevronRight
            className='Layer__date-month-picker__button-icon'
            size={16}
          />
        </button>
        <div className='Layer__date-month-picker__effect-blur'></div>
      </div>
      {currentDateOption && (
        <Button
          className='Layer__date-month-picker__current-button'
          onClick={() => setCurrentDate()}
          variant={ButtonVariant.secondary}
          disabled={activeCurrentButton}
        >
          Today
        </Button>
      )}
    </div>
  )
}
