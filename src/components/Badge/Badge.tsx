import { type ReactNode } from 'react'
import classNames from 'classnames'

import { type ButtonProps } from '@components/Button/Button'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

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
  STANDARD = 'standard',
}

export interface BadgeProps {
  children?: ReactNode
  icon?: ReactNode
  onClick?: ButtonProps['onClick']
  tooltip?: ReactNode
  size?: BadgeSize
  variant?: BadgeVariant
  hoverable?: boolean
  iconOnly?: boolean
}

export const Badge = ({
  icon,
  onClick,
  children,
  tooltip,
  size = BadgeSize.MEDIUM,
  variant = BadgeVariant.DEFAULT,
  hoverable = false,
  iconOnly = false,
}: BadgeProps) => {
  const baseProps = {
    className: classNames(
      'Layer__badge',
      hoverable && !tooltip ? 'Layer__badge--with-hover' : '',
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
      {icon}
      {children}
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
      <DeprecatedTooltip offset={12}>
        <DeprecatedTooltipTrigger>{content}</DeprecatedTooltipTrigger>
        <DeprecatedTooltipContent className='Layer__tooltip'>{tooltip}</DeprecatedTooltipContent>
      </DeprecatedTooltip>
    )
  }

  return content
}
