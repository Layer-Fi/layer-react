import React, { ButtonHTMLAttributes } from 'react'
import BackArrow from '../../icons/BackArrow'
import classNames from 'classnames'

export interface ExpandButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  collapsed?: boolean
}

export const ExpandButton = ({
  className,
  children,
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
