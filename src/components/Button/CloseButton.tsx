import React, { ButtonHTMLAttributes } from 'react'
import CloseIcon from '../../icons/CloseIcon'
import classNames from 'classnames'

export interface CloseButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  textOnly?: boolean
}

export const CloseButton = ({
  className,
  children,
  textOnly = false,
  ...props
}: CloseButtonProps) => {
  const baseClassName = classNames('Layer__btn', 'Layer__back-btn', className)

  return (
    <button {...props} className={baseClassName}>
      {textOnly ? 'Back' : <CloseIcon size={16} />}
    </button>
  )
}
