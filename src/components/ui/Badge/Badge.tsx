import { type ReactNode } from 'react'
import classNames from 'classnames'
import { Button as ReactAriaButton, type ButtonProps } from 'react-aria-components/Button'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'

import './badge.scss'

export enum BadgeSize {
  EXTRA_SMALL = 'xs',
  SMALL = 'sm',
  MEDIUM = 'md',
}

export enum BadgeVariant {
  DEFAULT = 'default',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  NEUTRAL = 'neutral',
}

const legacyClassNames = createLegacyClassNames({
  'Layer__UI__Badge': 'Layer__badge',
  'size:xs': 'Layer__badge--xs',
  'size:sm': 'Layer__badge--small',
  'size:md': 'Layer__badge--medium',
  'variant:default': 'Layer__badge--default',
  'variant:info': 'Layer__badge--info',
  'variant:success': 'Layer__badge--success',
  'variant:warning': 'Layer__badge--warning',
  'variant:error': 'Layer__badge--error',
  'variant:neutral': 'Layer__badge--neutral',
  'state:clickable': 'Layer__badge--clickable',
  'state:iconOnly': 'Layer__badge--icon-only',
} satisfies LegacyClassNameMapFor<
  'Layer__UI__Badge',
  `size:${BadgeSize}` | `variant:${BadgeVariant}` | `state:${string}`
>)

export interface BadgeProps {
  children?: ReactNode
  className?: string
  icon?: ReactNode
  onPress?: ButtonProps['onPress']
  tooltip?: ReactNode
  size?: BadgeSize
  variant?: BadgeVariant
  iconOnly?: boolean
  iconPosition?: 'left' | 'right'
  isTrigger?: boolean
}

export const Badge = ({
  className,
  icon,
  onPress,
  children,
  tooltip,
  size = BadgeSize.MEDIUM,
  variant = BadgeVariant.DEFAULT,
  iconOnly = false,
  iconPosition = 'left',
  isTrigger = false,
}: BadgeProps) => {
  // A DropdownMenu trigger carries no handler of its own; MenuTrigger wires press
  // through ButtonContext, which only a React Aria Button consumes.
  const isButton = Boolean(onPress) || isTrigger
  const clickable = isButton || Boolean(tooltip)

  const baseProps = {
    className: classNames(
      legacyClassNames(
        'Layer__UI__Badge',
        `size:${size}`,
        `variant:${variant}`,
        clickable && 'state:clickable',
        iconOnly && 'state:iconOnly',
      ),
      className,
    ),
    ...toDataProperties({ size, variant, clickable, 'icon-only': iconOnly }),
  }

  const inner = (
    <>
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </>
  )

  const content = isButton
    ? (
      <ReactAriaButton {...baseProps} onPress={onPress}>
        {inner}
      </ReactAriaButton>
    )
    : (
      <span {...baseProps}>{inner}</span>
    )

  if (tooltip) {
    return (
      <Tooltip offset={12}>
        <TooltipTrigger>{content}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}
