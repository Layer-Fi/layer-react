import { useState } from 'react'
import { type DateValue } from '@internationalized/date'
import classNames from 'classnames'
import { type DatePickerProps as ReactAriaDatePickerProps } from 'react-aria-components/DatePicker'
import { Dialog } from 'react-aria-components/Dialog'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { DATE_PICKER_CLASS_NAME, DatePicker as BaseDatePicker } from '@ui/Date/Date'
import { Label, type TextStyleProps } from '@ui/Typography/Text'
import { DateCalendar } from '@components/DateCalendar/DateCalendar'
import { DatePickerInput } from '@components/DatePicker/DatePickerInput'
import { ResponsivePopover } from '@components/ResponsivePopover/ResponsivePopover'

import './datePicker.scss'

type DatePickerProps<T extends DateValue> = {
  label: string
  isReadOnly?: boolean
  showLabel?: boolean
  date: T | null
  minDate?: DateValue | null
  maxDate?: DateValue | null
  isInvalid?: boolean
  errorText?: string | null
  onBlur?: () => void
  onChange: (date: T | null) => void
  isDisabled?: boolean
  className?: string
  slotProps?: {
    Label?: TextStyleProps
  }
}

export const DatePicker = <T extends DateValue>({
  label,
  showLabel = false,
  date,
  minDate,
  maxDate,
  isInvalid,
  errorText,
  onBlur,
  onChange,
  isDisabled,
  isReadOnly,
  className,
  slotProps,
}: DatePickerProps<T>) => {
  const additionalAriaProps = !showLabel && { 'aria-label': label }
  const { value } = useSizeClass()
  const [isPopoverOpen, setPopoverOpen] = useState(false)

  return (
    <BaseDatePicker
      granularity='day'
      value={date}
      onBlur={onBlur}
      // MappedDateValue<T> resolves to T for every concrete DateValue, so this cast is safe.
      onChange={onChange as ReactAriaDatePickerProps<T>['onChange']}
      isInvalid={isInvalid}
      {...additionalAriaProps}
      isOpen={isPopoverOpen}
      onOpenChange={setPopoverOpen}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      className={classNames(DATE_PICKER_CLASS_NAME, className)}
    >
      {showLabel && <Label slot='label' size='sm' {...slotProps?.Label}>{label}</Label>}
      <DatePickerInput errorText={errorText} variant={value} onClick={() => setPopoverOpen(true)} isReadOnly={isReadOnly} />
      <ResponsivePopover>
        <Dialog>
          <DateCalendar minDate={minDate} maxDate={maxDate} variant={value} />
        </Dialog>
      </ResponsivePopover>
    </BaseDatePicker>
  )
}
