import { DateCalendar } from '../DateCalendar/DateCalendar'
import { DatePicker as BaseDatePicker } from '../ui/Date/Date'
import { Label } from '../ui/Typography/Text'
import { Dialog } from 'react-aria-components'
import { ZonedDateTime } from '@internationalized/date'
import { ResponsivePopover } from '../ResponsivePopover/ResponsivePopover'
import { useSizeClass } from '../../hooks/useWindowSize/useWindowSize'
import { DatePickerInput } from './DatePickerInput'
import { useState } from 'react'

type DatePickerProps = {
  label: string
  isReadOnly?: boolean
  showLabel?: boolean
  date: ZonedDateTime | null
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
  isInvalid?: boolean
  errorText?: string | null
  onBlur?: () => void
  onChange: (date: ZonedDateTime | null) => void
}

export const DatePicker = ({
  label,
  showLabel = true,
  date,
  minDate,
  maxDate,
  isInvalid,
  errorText,
  onBlur,
  onChange,
}: DatePickerProps) => {
  const additionalAriaProps = !showLabel && { 'aria-label': label }
  const { value } = useSizeClass()
  const [isPopoverOpen, setPopoverOpen] = useState(false)

  return (
    <BaseDatePicker
      granularity='day'
      value={date}
      onBlur={onBlur}
      onChange={onChange}
      isInvalid={isInvalid}
      {...additionalAriaProps}
      isOpen={isPopoverOpen}
      onOpenChange={setPopoverOpen}
    >
      {showLabel && <Label>{label}</Label>}
      <DatePickerInput errorText={errorText} variant={value} onClick={() => setPopoverOpen(true)} />
      <ResponsivePopover>
        <Dialog>
          <DateCalendar minDate={minDate} maxDate={maxDate} variant={value} />
        </Dialog>
      </ResponsivePopover>
    </BaseDatePicker>
  )
}
