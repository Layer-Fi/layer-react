import { forwardRef } from 'react'
import {
  Input as ReactAriaInput,
  type InputProps as ReactAriaInputProps,
} from 'react-aria-components/Input'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './input.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__UI__Input: 'Layer__input',
})

const INPUT_CLASS_NAME = legacyClassNames('Layer__UI__Input')

type InputProps = Omit<ReactAriaInputProps, 'className'> & {
  inset?: true
  placement?: 'first'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ inset, placement, ...restProps }, ref) {
    const dataProperties = toDataProperties({ inset, placement })

    return (
      <ReactAriaInput
        {...restProps}
        {...dataProperties}
        className={INPUT_CLASS_NAME}
        ref={ref}
      />
    )
  },
)
