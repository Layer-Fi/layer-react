import { forwardRef, type PropsWithChildren } from 'react'
import { Button as ReactAriaButton, type ButtonProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { withRenderProp } from '../../utility/withRenderProp'
import { LoadingSpinner } from '../Loading/LoadingSpinner'
import './button.scss'

const BUTTON_CLASS_NAMES = {
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
type ButtonSize = 'md'

const Button = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'className'> & {
    ellipsis?: true
    icon?: true
    inset?: true
    size?: ButtonSize
    variant?: ButtonVariant
  }
>((
  {
    children,
    ellipsis,
    icon,
    inset,
    size = 'md',
    variant = 'solid',
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
