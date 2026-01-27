import { forwardRef, type PropsWithChildren } from 'react'
import { Button as ReactAriaButton, type ButtonProps as ReactAriaButtonProps } from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { withRenderProp } from '@components/utility/withRenderProp'

import './button.scss'

export const BUTTON_CLASS_NAMES = {
  DEFAULT: 'Layer__UI__Button',
  SPINNER_CONTAINER: 'Layer__ButtonSpinnerContainer',
  TRANSPARENT_CONTENT: 'Layer__ButtonTransparentContent',
}

function ButtonSpinner({ size }: { size: ButtonSize }) {
  const dataProperties = toDataProperties({ size })

  return (
    <div {...dataProperties} className={BUTTON_CLASS_NAMES.SPINNER_CONTAINER}>
      <LoadingSpinner size={16} />
    </div>
  )
}

function ButtonTransparentContent({ children }: PropsWithChildren) {
  return (
    <span className={BUTTON_CLASS_NAMES.TRANSPARENT_CONTENT}>
      {children}
    </span>
  )
}

export type ButtonVariant = 'solid' | 'ghost' | 'outlined' | 'text' | 'branded'
export type ButtonSize = 'md'

export type ButtonStyleProps = {
  ellipsis?: true
  icon?: true
  inset?: true
  size?: ButtonSize
  variant?: ButtonVariant
  fullWidth?: boolean
  flex?: boolean
}

export type ButtonProps = Omit<ReactAriaButtonProps, 'className'> & ButtonStyleProps

const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>((
  {
    children,
    ellipsis,
    icon,
    inset,
    size = 'md',
    variant = 'solid',
    fullWidth = false,
    flex = false,
    ...restProps
  },
  ref,
) => {
  const { isPending = false } = restProps
  const dataProperties = toDataProperties({
    ellipsis,
    icon,
    inset,
    size,
    variant,
    'full-width': fullWidth,
    flex,
  })

  return (
    <ReactAriaButton
      {...restProps}
      {...dataProperties}
      className={BUTTON_CLASS_NAMES.DEFAULT}
      ref={ref}
    >
      {withRenderProp(children, (node) => {
        if (isPending) {
          return (
            <>
              <ButtonTransparentContent>
                {node}
              </ButtonTransparentContent>
              <ButtonSpinner size={size} />
            </>
          )
        }

        return node
      })}
    </ReactAriaButton>
  )
})
Button.displayName = 'Button'

export { Button }
