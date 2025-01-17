import { HTMLProps } from 'react'
import { Badge, BadgeVariant } from '../Badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import classNames from 'classnames'

export interface InputWithBadgeProps extends HTMLProps<HTMLInputElement> {
  isInvalid?: boolean
  errorMessage?: string
  leftText?: string
  variant?: BadgeVariant
  badge: React.ReactNode
}

export const InputWithBadge = ({
  className,
  isInvalid,
  errorMessage,
  leftText,
  badge,
  variant = BadgeVariant.DEFAULT,
  ...props
}: InputWithBadgeProps) => {
  const baseClassName = classNames(
    'Layer__input',
    isInvalid ? 'Layer__input--error' : '',
    leftText ? 'Layer__input--with-left-text' : '',
    className,
  )

  return (
    <Tooltip disabled={!isInvalid || !errorMessage}>
      <TooltipTrigger className='Layer__input-tooltip'>
        <div className='Layer__input-with-badge'>
          <input {...props} className={baseClassName} />
          {badge && <Badge variant={variant}>{badge}</Badge>}
        </div>
        {leftText && <span className='Layer__input-left-text'>{leftText}</span>}
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip'>{errorMessage}</TooltipContent>
    </Tooltip>
  )
}
