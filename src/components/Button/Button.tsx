import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import classNames from 'classnames'

export enum ButtonVariant {
  primary = 'primary',
  secondary = 'secondary',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Button = ({
  className,
  children,
  variant = ButtonVariant.primary,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) => {
  const baseClassName = classNames(
    'Layer__btn',
    `Layer__btn--${variant}`,
    className,
  )

  return (
    <button {...props} className={baseClassName}>
      <span className='Layer__btn-content'>
        {leftIcon}
        <span className='Layer__btn-text'>{children}</span>
        {rightIcon}
      </span>
    </button>
  )
}
