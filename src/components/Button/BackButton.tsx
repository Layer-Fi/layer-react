import { ButtonHTMLAttributes } from 'react'
import BackArrow from '@icons/BackArrow'
import classNames from 'classnames'

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
