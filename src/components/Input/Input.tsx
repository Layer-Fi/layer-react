import { HTMLProps } from 'react'
import { DeprecatedTooltip, DeprecatedTooltipTrigger, DeprecatedTooltipContent } from '../Tooltip/Tooltip'
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
    <DeprecatedTooltip disabled={!isInvalid || !errorMessage}>
      <DeprecatedTooltipTrigger className='Layer__input-tooltip'>
        <input {...props} className={baseClassName} />
        {leftText && <span className='Layer__input-left-text'>{leftText}</span>}
      </DeprecatedTooltipTrigger>
      <DeprecatedTooltipContent className='Layer__tooltip'>{errorMessage}</DeprecatedTooltipContent>
    </DeprecatedTooltip>
  )
}
