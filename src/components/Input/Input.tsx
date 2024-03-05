import React, { HTMLProps } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import classNames from 'classnames'

export interface InputProps extends HTMLProps<HTMLInputElement> {
  isInvalid?: boolean
  errorMessage?: string
}

export const Input = ({
  className,
  isInvalid,
  errorMessage,
  ...props
}: InputProps) => {
  const baseClassName = classNames(
    'Layer__input',
    isInvalid ? 'Layer__input--error' : '',
    className,
  )

  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <input {...props} className={baseClassName} />
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
