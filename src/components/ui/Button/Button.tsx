import React, { forwardRef, useMemo } from 'react'
import { Button as ReactAriaButton, type ButtonProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

type ButtonVariant = 'solid' | 'ghost'
type ButtonSize = 'md' | 'lg'

const BUTTON_CLASS_NAME = 'Layer__UI__Button'
const Button = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'className'> & {
    icon?: true
    size?: ButtonSize
    variant?: ButtonVariant
  }
>((
  {
    icon,
    size = 'md',
    variant = 'solid',
    children,
    ...restProps
  },
  ref
) => {
  const dataProperties = useMemo(() => toDataProperties({
    icon,
    size,
    variant
  }), [icon, size, variant])

  return <ReactAriaButton
    {...restProps}
    {...dataProperties}
    className={BUTTON_CLASS_NAME}
    ref={ref}
  >
    {children}
  </ReactAriaButton>
})
Button.displayName = 'IconButton'

export { Button }
