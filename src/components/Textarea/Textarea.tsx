import React, { HTMLProps } from 'react'
import classNames from 'classnames'

export const Textarea = ({
  className,
  ...props
}: HTMLProps<HTMLTextAreaElement>) => {
  const baseClassName = classNames('Layer__textarea', className)
  return <textarea {...props} className={baseClassName} />
}
