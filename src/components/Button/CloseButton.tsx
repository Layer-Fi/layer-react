import React, { ButtonHTMLAttributes } from 'react'
import CloseIcon from '../../icons/CloseIcon'
import classNames from 'classnames'

type CloseButtonProps = {
  textOnly?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export const CloseButton = ({
  className,
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
