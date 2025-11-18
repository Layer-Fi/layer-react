import { forwardRef } from 'react'
import classNames from 'classnames'
import {
  NumberField as ReactAriaNumberField,
  type NumberFieldProps as ReactAriaNumberFieldProps,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

const NUMBER_FIELD_CLASS_NAME = 'Layer__UI__NumberField'
type NumberFieldProps = ReactAriaNumberFieldProps & {
  inline?: boolean
}

export const NumberField = forwardRef<HTMLDivElement, NumberFieldProps>(
  function NumberField({ inline, className, isReadOnly, ...restProps }, ref) {
    const dataProperties = toDataProperties({ inline, readonly: isReadOnly })

    return (
      <ReactAriaNumberField
        step={1}
        {...dataProperties}
        {...restProps}
        isReadOnly={isReadOnly}
        className={classNames(NUMBER_FIELD_CLASS_NAME, className)}
        ref={ref}
      />
    )
  },
)
