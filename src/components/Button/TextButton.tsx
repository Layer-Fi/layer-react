import React, { ButtonHTMLAttributes, ReactNode, useRef } from 'react'
import classNames from 'classnames'

export type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const TextButton = ({
  className,
  children,
  ...props
}: TextButtonProps) => {
  const baseClassName = classNames('Layer__text-btn', className)

  return (
    <button {...props} className={baseClassName}>
      {children}
    </button>
  )
}
