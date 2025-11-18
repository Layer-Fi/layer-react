import { useState } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { Dialog } from 'react-aria-components'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { DatePicker as BaseDatePicker } from '@ui/Date/Date'
import { Label } from '@ui/Typography/Text'
import { DateCalendar } from '@components/DateCalendar/DateCalendar'
import { DatePickerInput } from '@components/DatePicker/DatePickerInput'
import { ResponsivePopover } from '@components/ResponsivePopover/ResponsivePopover'

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
  isDisabled?: boolean
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
  isDisabled,
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
      isDisabled={isDisabled}
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
