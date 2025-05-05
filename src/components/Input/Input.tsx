import type { InputProps as ReactAriaInputProps } from 'react-aria-components'
import { Input as ReactAriaInput } from 'react-aria-components'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import classNames from 'classnames'

export interface InputProps extends ReactAriaInputProps {
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
        <ReactAriaInput {...props} className={baseClassName} />
        {leftText && <span className='Layer__input-left-text'>{leftText}</span>}
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
