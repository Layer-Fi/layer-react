import { forwardRef, type ComponentProps } from 'react'
import { Input as ReactAriaInput } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const CLASS_NAME = 'Layer__UI__Input'

type InputProps = Omit<ComponentProps<typeof ReactAriaInput>, 'className'> & {
  placement?: 'first-within-group'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ placement, ...restProps }, ref) {
    const dataProperties = toDataProperties({ placement })

    return (
      <ReactAriaInput
        {...restProps}
        {...dataProperties}
        className={CLASS_NAME}
        ref={ref}
      />
    )
  },
)
