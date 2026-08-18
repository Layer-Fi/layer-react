import { type MouseEventHandler, type ReactNode } from 'react'

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
  'data:clickable': 'Layer__badge--clickable',
  'data:iconOnly': 'Layer__badge--icon-only',
} satisfies LegacyClassNameMapFor<
  'Layer__UI__Badge',
  `size:${BadgeSize}` | `variant:${BadgeVariant}` | `data:${string}`
>)

export interface BadgeProps {
  children?: ReactNode
  icon?: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  tooltip?: ReactNode
  size?: BadgeSize
  variant?: BadgeVariant
  iconOnly?: boolean
  iconPosition?: 'left' | 'right'
}

export const Badge = ({
  icon,
  onClick,
  children,
  tooltip,
  size = BadgeSize.MEDIUM,
  variant = BadgeVariant.DEFAULT,
  iconOnly = false,
  iconPosition = 'left',
}: BadgeProps) => {
  const clickable = Boolean(onClick || tooltip)

  const baseProps = {
    className: legacyClassNames(
      'Layer__UI__Badge',
      `size:${size}`,
      `variant:${variant}`,
      clickable && 'data:clickable',
      iconOnly && 'data:iconOnly',
    ),
    ...toDataProperties({ size, variant, clickable, 'icon-only': iconOnly }),
    onClick,
    children,
  }

  let content = (
    <>
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </>
  )

  content = onClick
    ? (
      <button type='button' role='button' {...baseProps}>
        {content}
      </button>
    )
    : (
      <span {...baseProps}>{content}</span>
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
