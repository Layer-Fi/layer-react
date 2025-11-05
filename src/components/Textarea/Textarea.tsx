import { HTMLProps } from 'react'
import { DeprecatedTooltip, DeprecatedTooltipTrigger, DeprecatedTooltipContent } from '../Tooltip/Tooltip'
import classNames from 'classnames'

export interface TextareaProps extends HTMLProps<HTMLTextAreaElement> {
  isInvalid?: boolean
  errorMessage?: string
}

export const Textarea = ({
  className,
  isInvalid,
  errorMessage,
  ...props
}: TextareaProps) => {
  const baseClassName = classNames(
    'Layer__textarea',
    isInvalid ? 'Layer__textarea--error' : '',
    className,
  )

  return (
    <DeprecatedTooltip disabled={!isInvalid || !errorMessage}>
      <DeprecatedTooltipTrigger className='Layer__input-tooltip'>
        <textarea {...props} className={baseClassName} />
      </DeprecatedTooltipTrigger>
      <DeprecatedTooltipContent className='Layer__tooltip'>{errorMessage}</DeprecatedTooltipContent>
    </DeprecatedTooltip>
  )
}
