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
  subQuarters,
  subYears,
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
      case 'last-quarter':
        return (
          <TextButton
            key={option}
            onClick={() => {
              const lastQuarter = subQuarters(new Date(), 1)
              setSelectedDate([
                startOfQuarter(lastQuarter),
                endOfQuarter(lastQuarter),
              ])
            }}
          >
            Last quarter
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
      case 'last-year':
        return (
          <TextButton
            key={option}
            onClick={() => {
              const lastYear = subYears(new Date(), 1)
              setSelectedDate([startOfYear(lastYear), endOfYear(lastYear)])
            }}
          >
            Last year
          </TextButton>
        )
    }
    return <></>
  }

  if (options.length === 0) {
    const allOptions = [
      'this-month',
      'last-month',
      'this-quarter',
      'last-quarter',
      'this-year',
      'last-year',
    ]
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
