import { HTMLProps } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import classNames from 'classnames'

export interface InputProps extends HTMLProps<HTMLInputElement> {
  isInvalid?: boolean
  errorMessage?: string
  leftText?: string
}

export const Input = ({
  className,
  isInvalid,
  errorMessage,
  leftText,
  ...props
}: InputProps) => {
  const baseClassName = classNames(
    'Layer__input',
    isInvalid ? 'Layer__input--error' : '',
    leftText ? 'Layer__input--with-left-text' : '',
    className,
  )

  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <input {...props} className={baseClassName} />
        {leftText && <span className='Layer__input-left-text'>{leftText}</span>}
      </TooltipTrigger>
      <TooltipContent>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
