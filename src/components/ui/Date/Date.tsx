import { forwardRef } from 'react'
import classNames from 'classnames'
import type { ZonedDateTime } from '@internationalized/date'
import {
  DateField as ReactAriaDateField,
  type DateFieldProps as ReactAriaDateFieldProps,
  DateSegment as ReactAriaDateSegment,
  type DateSegmentProps as ReactAriaDateSegmentProps,
  DateInput as ReactAriaDateInput,
  type DateInputProps as ReactAriaDateInputProps,
  DatePicker as ReactAriaDatePicker,
  type DatePickerProps as ReactAriaDatePickerProps,
} from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import './date.scss'

const DATE_FIELD_CLASS_NAME = 'Layer__UI__DateField'
type DateFieldProps = ReactAriaDateFieldProps<ZonedDateTime> & {
  inline?: boolean
}

export const DateField = forwardRef<HTMLDivElement, DateFieldProps>(
  function DateField({ inline, className, isReadOnly, ...restProps }, ref) {
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
)

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

const DATE_PICKER_CLASS_NAME = 'Layer__UI__DatePicker'
type DatePickerProps = Omit<ReactAriaDatePickerProps<ZonedDateTime>, 'className'>

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    return (
      <ReactAriaDatePicker
        {...props}
        className={DATE_PICKER_CLASS_NAME}
        ref={ref}
      />
    )
  },
)
