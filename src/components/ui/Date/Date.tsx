import { forwardRef } from 'react'
import type { DateValue, ZonedDateTime } from '@internationalized/date'
import classNames from 'classnames'
import {
  DateField as ReactAriaDateField,
  type DateFieldProps as ReactAriaDateFieldProps,
  DateInput as ReactAriaDateInput,
  type DateInputProps as ReactAriaDateInputProps,
  DatePicker as ReactAriaDatePicker,
  type DatePickerProps as ReactAriaDatePickerProps,
  DateSegment as ReactAriaDateSegment,
  type DateSegmentProps as ReactAriaDateSegmentProps,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

import './date.scss'

export const DATE_PICKER_CLASS_NAME = 'Layer__UI__DatePicker'

const DATE_FIELD_CLASS_NAME = 'Layer__UI__DateField'
type DateFieldProps<T extends DateValue> = ReactAriaDateFieldProps<T> & {
  inline?: boolean
}

export const DateField = forwardRef(
  function DateField<T extends DateValue>(
    { inline, className, isReadOnly, ...restProps }: DateFieldProps<T>,
    ref: React.Ref<HTMLDivElement>,
  ) {
    const dataProperties = toDataProperties({ inline, readonly: isReadOnly })

    return (
      <ReactAriaDateField
        {...dataProperties}
        {...restProps}
        isReadOnly={isReadOnly}
        className={classNames(DATE_FIELD_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
) as <T extends DateValue>(
  props: DateFieldProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement

const DATE_INPUT_CLASS_NAME = 'Layer__UI__DateInput'
type DateInputProps = Omit<ReactAriaDateInputProps, 'className'> & {
  inset?: true
  pointerEvents?: 'none'
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput({ inset, pointerEvents, ...restProps }, ref) {
    const dataProperties = toDataProperties({ inset, 'pointer-events': pointerEvents })

    return (
      <ReactAriaDateInput
        {...dataProperties}
        {...restProps}
        className={DATE_INPUT_CLASS_NAME}
        ref={ref}
      />
    )
  },
)

const DATE_SEGMENT_CLASS_NAME = 'Layer__UI__DateSegment'
type DateSegmentProps = Omit<ReactAriaDateSegmentProps, 'className'> & {
  isReadOnly?: boolean
}

export const DateSegment = forwardRef<HTMLDivElement, DateSegmentProps>(
  function DateSegment({ isReadOnly, ...restProps }, ref) {
    // Create a `data-interactive` property here rather than `data-readonly`, because `data-readonly` was
    // being stripped by the base aria component and therefore not applied to the underlying DOM element.
    const dataProperties = toDataProperties({ interactive: !isReadOnly })

    return (
      <ReactAriaDateSegment
        {...restProps}
        {...dataProperties}
        className={DATE_SEGMENT_CLASS_NAME}
        ref={ref}
      />
    )
  },
)

type DatePickerProps = Omit<ReactAriaDatePickerProps<ZonedDateTime>, 'className'> & {
  className?: string
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker({ className, ...restProps }, ref) {
    return (
      <ReactAriaDatePicker
        {...restProps}
        className={classNames(DATE_PICKER_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
)
