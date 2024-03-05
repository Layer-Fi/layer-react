import React, { ButtonHTMLAttributes, ReactNode, useRef } from 'react'
import classNames from 'classnames'

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  active?: boolean
}

export const IconButton = ({
  className,
  children,
  icon,
  active,
  ...props
}: IconButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const baseClassName = classNames(
    'Layer__icon-btn',
    `Layer__icon-btn--${active ? 'active' : 'inactive'}`,
    className,
  )

  return (
    <button {...props} className={baseClassName} ref={buttonRef}>
      {icon}
    </button>
  )
}
