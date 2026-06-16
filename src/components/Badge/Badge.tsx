import { type MouseEventHandler, type ReactNode } from 'react'
import classNames from 'classnames'

import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'

import './badge.scss'

export enum BadgeSize {
  EXTRA_SMALL = 'xs',
  SMALL = 'small',
  MEDIUM = 'medium',
}

export enum BadgeVariant {
  DEFAULT = 'default',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  NEUTRAL = 'neutral',
}

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
  const baseProps = {
    className: classNames(
      'Layer__badge',
      onClick || tooltip ? 'Layer__badge--clickable' : '',
      iconOnly ? 'Layer__badge--icon-only' : '',
      `Layer__badge--${size}`,
      `Layer__badge--${variant}`,
    ),
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
