import { forwardRef } from 'react'
import { Input as ReactAriaInput, InputProps as ReactAriaInputProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const INPUT_CLASS_NAME = 'Layer__UI__Input'

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
