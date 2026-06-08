import { type ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'
import { X } from 'lucide-react'

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
      {textOnly ? 'Back' : <X size={16} />}
    </button>
  )
}
