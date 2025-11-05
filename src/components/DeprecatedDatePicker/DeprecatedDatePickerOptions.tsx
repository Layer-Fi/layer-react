import { TextButton } from '../Button/TextButton'
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

export type CustomDateRange = {
  label: string
  startDate: Date
  endDate: Date
}

/**
 * @deprecated This is part of the `DeprecatedDatePicker` component.
 */
export const DeprecatedDatePickerOptions = ({
  customDateRanges = [
    {
      label: 'This month',
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    },
    {
      label: 'Last month',
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
    },
    {
      label: 'This quarter',
      startDate: startOfQuarter(new Date()),
      endDate: endOfQuarter(new Date()),
    },
    {
      label: 'Last quarter',
      startDate: startOfQuarter(subQuarters(new Date(), 1)),
      endDate: endOfQuarter(subQuarters(new Date(), 1)),
    },
    {
      label: 'This year',
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date()),
    },
    {
      label: 'Last year',
      startDate: startOfYear(subYears(new Date(), 1)),
      endDate: endOfYear(subYears(new Date(), 1)),
    },
  ],
  setSelectedDate,
}: {
  customDateRanges?: CustomDateRange[]
  setSelectedDate: (dates: [Date, Date | null]) => void
}) => {
  const optionsComponents: React.ReactNode[] = []

  const customOptionComponents: React.ReactNode[] = customDateRanges.map(
    customOption => (
      <TextButton
        key={customOption.label}
        onClick={() => {
          setSelectedDate([customOption.startDate, customOption.endDate])
        }}
      >
        {customOption.label}
      </TextButton>
    ),
  )

  optionsComponents.push(...customOptionComponents)

  if (optionsComponents.length === 0) {
    return <></>
  }

  return (
    <div className='Layer__datepicker__popper__custom-footer'>
      {optionsComponents}
    </div>
  )
}
