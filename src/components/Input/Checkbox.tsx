/** @TODO remove or merge with other checkbox component */
import React from 'react'
import classNames from 'classnames'

export enum CheckboxVariant {
  DEFAULT = 'default',
  DARK = 'dark',
}

export enum CheckboxSize {
  LARGE = 'large',
  MEDIUM = 'medium',
}

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
  checkboxClassName?: string
  labelClassName?: string
  variant?: CheckboxVariant
  boxSize?: CheckboxSize
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className,
  checkboxClassName,
  labelClassName,
  variant = CheckboxVariant.DEFAULT,
  boxSize = CheckboxSize.MEDIUM,
  ...props
}) => {
  const checkboxClasses = classNames('Layer__checkbox', checkboxClassName)
  const labelClasses = classNames('Layer__checkbox-label', labelClassName)
  const wrapperClasses = classNames(
    'Layer__checkbox-wrapper',
    `Layer__checkbox--${boxSize}`,
    `Layer__checkbox--${variant}`,
    className,
  )

  return (
    <div className={wrapperClasses}>
      <input type='checkbox' className={checkboxClasses} {...props} />
      {label && <label className={labelClasses}>{label}</label>}
    </div>
  )
}
