import React, { HTMLProps } from 'react'
import { Input } from './Input'
import classNames from 'classnames'

export interface AmountInputProps extends Omit<HTMLProps<HTMLInputElement>, 'onChange'> {
  isInvalid?: boolean
  errorMessage?: string
  leftText?: string
  onChange?: (value?: string) => void
}

/** @TODO this component is oversimplified.
 * Need to have better number conversion and decorations
 */
export const AmountInput = ({
  onChange,
  className,
  ...props
}: AmountInputProps) => {
  const baseClassName = classNames(
    'Layer__amount-input',
    className,
  )

  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    try {
      onChange && onChange((e.target as HTMLInputElement).value.replace(/[^\d.]/g, ''))
    } catch {
      return
    }
  }

  return (
    <Input type='number' className={baseClassName} onChange={onInputChange} {...props} />
  )
}
