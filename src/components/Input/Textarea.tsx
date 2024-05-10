import React, { HTMLProps } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
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
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <textarea {...props} className={baseClassName} />
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
