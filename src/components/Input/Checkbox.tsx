import React from 'react'
import classNames from 'classnames'

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
  checkboxClassName?: string
  labelClassName?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className,
  checkboxClassName,
  labelClassName,
  ...props
}) => {
  const checkboxClasses = classNames('Layer__checkbox', checkboxClassName)
  const labelClasses = classNames('Layer__checkbox-label', labelClassName)
  const wrapperClasses = classNames('Layer__checkbox-wrapper', className)

  return (
    <div className={wrapperClasses}>
      <input type='checkbox' className={checkboxClasses} {...props} />
      {label && <label className={labelClasses}>{label}</label>}
    </div>
  )
}
