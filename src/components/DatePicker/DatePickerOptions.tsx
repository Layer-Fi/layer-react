import React from 'react'
import { TextButton } from '../Button'
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
} from 'date-fns'

export const DatePickerOptions = ({
  options,
  setSelectedDate,
}: {
  options: string[]
  setSelectedDate: (dates: [Date | null, Date | null]) => void
}) => {
  let optionsComponents: React.ReactNode[] = []

  const getOptionComponent = (option: string) => {
    switch (option) {
      case 'this-month':
        return (
          <TextButton
            key={option}
            onClick={() => {
              setSelectedDate([
                startOfMonth(new Date()),
                endOfMonth(new Date()),
              ])
            }}
          >
            This month
          </TextButton>
        )
      case 'last-month':
        return (
          <TextButton
            key={option}
            onClick={() => {
              setSelectedDate([
                startOfMonth(subMonths(new Date(), 1)),
                endOfMonth(subMonths(new Date(), 1)),
              ])
            }}
          >
            Last month
          </TextButton>
        )
      case 'this-quarter':
        return (
          <TextButton
            key={option}
            onClick={() => {
              setSelectedDate([
                startOfQuarter(new Date()),
                endOfQuarter(new Date()),
              ])
            }}
          >
            This quarter
          </TextButton>
        )
      case 'this-year':
        return (
          <TextButton
            key={option}
            onClick={() => {
              setSelectedDate([startOfYear(new Date()), endOfYear(new Date())])
            }}
          >
            This year
          </TextButton>
        )
    }
    return <></>
  }

  if (options.length === 0) {
    const allOptions = ['this-month', 'last-month', 'this-quarter', 'this-year']
    allOptions.forEach(option => {
      optionsComponents.push(getOptionComponent(option))
    })
  } else {
    options.forEach(option => {
      optionsComponents.push(getOptionComponent(option))
    })
  }

  if (optionsComponents.length === 0) {
    return <></>
  }

  return (
    <div className='Layer__datepicker__popper__custom-footer'>
      {optionsComponents}
    </div>
  )
}
