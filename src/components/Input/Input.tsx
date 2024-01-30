import React, { HTMLProps } from 'react'
import classNames from 'classnames'

export const Input = ({ className, ...props }: HTMLProps<HTMLInputElement>) => {
  const baseClassName = classNames('Layer__input', className)
  return <input {...props} className={baseClassName} />
}
