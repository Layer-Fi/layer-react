import { HTMLProps } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import classNames from 'classnames'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

export interface InputProps extends HTMLProps<HTMLInputElement> {
  isInvalid?: boolean
  errorMessage?: string
  leftText?: string
  fluid?: boolean
}

export const Input = ({
  className,
  isInvalid,
  errorMessage,
  leftText,
  fluid,
  ...props
}: InputProps) => {
  const dataProperties = toDataProperties({ fluid })

  const baseClassName = classNames(
    'Layer__input',
    isInvalid ? 'Layer__input--error' : '',
    leftText ? 'Layer__input--with-left-text' : '',
    className,
  )

  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <input {...props} {...dataProperties} className={baseClassName} />
        {leftText && <span className='Layer__input-left-text'>{leftText}</span>}
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
