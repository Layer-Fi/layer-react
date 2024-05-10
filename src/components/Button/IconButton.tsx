import React, { ButtonHTMLAttributes, ReactNode, useRef } from 'react'
import classNames from 'classnames'

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  active?: boolean
  withBorder?: boolean
}

export const IconButton = ({
  className,
  children,
  icon,
  active,
  withBorder = false,
  ...props
}: IconButtonProps) => {
  const baseClassName = classNames(
    'Layer__icon-btn',
    `Layer__icon-btn--${active ? 'active' : 'inactive'}`,
    withBorder && 'Layer__icon-btn--border',
    className,
  )

  return (
    <button {...props} className={baseClassName}>
      {icon}
    </button>
  )
}
