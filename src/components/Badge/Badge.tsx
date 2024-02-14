import React, { ReactNode, MouseEvent } from 'react'
import { Button } from '../Button'
import { ButtonProps } from '../Button/Button'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import classNames from 'classnames'

export interface BadgeProps {
  children: ReactNode
  icon?: ReactNode
  onClick?: ButtonProps['onClick']
  tooltip?: ReactNode
}

export const Badge = ({ icon, onClick, children, tooltip }: BadgeProps) => {
  const baseProps = {
    className: classNames(
      'Layer__badge',
      onClick || tooltip ? 'Layer__badge--clickable' : '',
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
    <Button {...baseProps}>{content}</Button>
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
