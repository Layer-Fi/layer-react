import React, { ButtonHTMLAttributes } from 'react'
import BackArrow from '../../icons/BackArrow'
import classNames from 'classnames'

type ExpandButtonProps = {
  collapsed?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export const ExpandButton = ({
  className,
  collapsed,
  ...props
}: ExpandButtonProps) => {
  const baseClassName = classNames(
    'Layer__btn',
    'Layer__expand-btn',
    collapsed ? 'Layer__expand-btn--collapsed' : 'Layer__expand-btn--expanded',
    className,
  )

  return (
    <button {...props} className={baseClassName}>
      <BackArrow size={16} />
    </button>
  )
}
