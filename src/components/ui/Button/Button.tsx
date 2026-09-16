import { forwardRef, type PropsWithChildren, type ReactNode } from 'react'
import classNames from 'classnames'
import {
  Button as ReactAriaButton,
  type ButtonProps as ReactAriaButtonProps,
} from 'react-aria-components/Button'
import { useTranslation } from 'react-i18next'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { withRenderProp } from '@components/utility/withRenderProp'
import { legacyButtonClassNames } from '@ui/Button/legacyClassNames'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'

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
export type ButtonStatus = 'danger'

export type ButtonStyleProps = {
  ellipsis?: true
  icon?: boolean
  inset?: true
  size?: ButtonSize
  variant?: ButtonVariant
  status?: ButtonStatus
  fullWidth?: boolean
  flex?: boolean
  tooltip?: ReactNode
  underline?: true
}

export type ButtonProps = Omit<ReactAriaButtonProps, 'className'> & ButtonStyleProps & {
  className?: string
}

const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>((
  {
    children,
    className,
    ellipsis,
    icon,
    inset,
    size = 'md',
    variant = 'solid',
    status,
    fullWidth = false,
    flex = false,
    tooltip,
    underline,
    ...restProps
  },
  ref,
) => {
  const { t } = useTranslation()
  const { isPending = false } = restProps
  const dataProperties = toDataProperties({
    ellipsis,
    icon,
    inset,
    size,
    variant,
    status,
    'full-width': fullWidth,
    flex,
    underline,
  })

  const button = (
    <ReactAriaButton
      {...restProps}
      {...dataProperties}
      className={classNames(
        legacyButtonClassNames({
          variant,
          icon,
          fullWidth,
          hasTooltip: tooltip != null,
          isDisabled: restProps.isDisabled,
          isPending,
        }),
        className,
      )}
      ref={ref}
    >
      {withRenderProp(children, (node) => {
        if (isPending) {
          if (variant === 'text') {
            return t('common:state.loading', 'Loading…')
          }

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

  if (tooltip == null) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {button}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
})
Button.displayName = 'Button'

export { Button }
