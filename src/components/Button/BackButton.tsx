import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import BackArrow from '../../icons/BackArrow'
import classNames from 'classnames'

export interface BackButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  textOnly?: boolean
}

export const BackButton = ({
  className,
  children,
  textOnly = false,
  ...props
}: BackButtonProps) => {
  const baseClassName = classNames('Layer__btn', 'Layer__back-btn', className)

  return (
    <button {...props} className={baseClassName}>
      {textOnly ? 'Back' : <BackArrow size={16} />}
    </button>
  )
}
