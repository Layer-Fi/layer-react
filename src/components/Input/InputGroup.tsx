import React, { ReactNode } from 'react'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

export interface InputGroupProps {
  label?: string
  name?: string
  className?: string
  children?: ReactNode
  inline?: boolean
}

export const InputGroup = ({
  label,
  name,
  className,
  inline,
  children,
}: InputGroupProps) => {
  const baseClassName = classNames(
    'Layer__input-group',
    className,
    inline && 'Layer__input-group--inline',
  )
  return (
    <div className={baseClassName}>
      {label && (
        <Text
          as='label'
          size={TextSize.sm}
          className='Layer__input-label'
          htmlFor={name}
        >
          {label}
        </Text>
      )}
      {children}
    </div>
  )
}
