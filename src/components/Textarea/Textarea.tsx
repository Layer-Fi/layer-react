import { type HTMLProps } from 'react'
import classNames from 'classnames'

import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

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
