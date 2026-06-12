import { type ReactNode } from 'react'
import classNames from 'classnames'

import { Label } from '@ui/Typography/Text'

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
        <Label size='sm' pb='2xs' pi='2xs' htmlFor={name}>{label}</Label>
      )}
      {children}
    </div>
  )
}
