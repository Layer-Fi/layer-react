import { HTMLProps } from 'react'
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
      <TooltipTrigger>
        <textarea {...props} className={baseClassName} />
      </TooltipTrigger>
      <TooltipContent>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
