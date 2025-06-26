import { forwardRef, type PropsWithChildren } from 'react'
import { Button as ReactAriaButton, type ButtonProps } from 'react-aria-components'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { withRenderProp } from '../../utility/withRenderProp'
import { LoadingSpinner } from '../Loading/LoadingSpinner'

const BUTTON_CLASS_NAMES = {
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

type ButtonVariant = 'solid' | 'ghost' | 'outlined' | 'text'
type ButtonSize = 'md'

const BUTTON_CLASS_NAME = 'Layer__UI__Button'
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
      className={BUTTON_CLASS_NAME}
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
