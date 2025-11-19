import { type ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'

import BackArrow from '@icons/BackArrow'

type BackButtonProps = {
  textOnly?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export const BackButton = ({
  className,
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
