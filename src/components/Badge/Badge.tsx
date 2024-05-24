import React, { ReactNode } from 'react'
import { ButtonProps } from '../Button/Button'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import classNames from 'classnames'

export enum BadgeSize {
  SMALL = 'small',
  MEDIUM = 'medium',
}

export enum BadgeVariant {
  DEFAULT = 'default',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface BadgeProps {
  children: ReactNode
  icon?: ReactNode
  onClick?: ButtonProps['onClick']
  tooltip?: ReactNode
  size?: BadgeSize
  variant?: BadgeVariant
  hoverable?: boolean
}

export const Badge = ({
  icon,
  onClick,
  children,
  tooltip,
  size = BadgeSize.MEDIUM,
  variant = BadgeVariant.DEFAULT,
  hoverable = false,
}: BadgeProps) => {
  const baseProps = {
    className: classNames(
      'Layer__badge',
      hoverable && !tooltip ? 'Layer__badge--with-hover' : '',
      onClick || tooltip ? 'Layer__badge--clickable' : '',
      `Layer__badge--${size}`,
      `Layer__badge--${variant}`,
    ),
    onClick,
    children,
  }

  let content = (
    <>
      {icon && <span className='Layer__badge__icon'>{icon}</span>}
      {children}
    </>
  )

  content = onClick ? (
    <button role='button' {...baseProps}>
      {content}
    </button>
  ) : (
    <span {...baseProps}>{content}</span>
  )

  if (tooltip) {
    return (
      <Tooltip offset={12}>
        <TooltipTrigger>{content}</TooltipTrigger>
        <TooltipContent className='Layer__tooltip'>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}
