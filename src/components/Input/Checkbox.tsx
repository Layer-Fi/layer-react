/** @TODO remove or merge with other checkbox component */
import classNames from 'classnames'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'

export enum CheckboxVariant {
  DEFAULT = 'default',
  DARK = 'dark',
}

export enum CheckboxSize {
  LARGE = 'large',
  MEDIUM = 'medium',
}

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
  checkboxClassName?: string
  labelClassName?: string
  variant?: CheckboxVariant
  boxSize?: CheckboxSize
  tooltip?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className,
  checkboxClassName,
  labelClassName,
  variant = CheckboxVariant.DEFAULT,
  boxSize = CheckboxSize.MEDIUM,
  tooltip,
  ...props
}) => {
  const checkboxClasses = classNames('Layer__checkbox', checkboxClassName)
  const labelClasses = classNames('Layer__checkbox-label', labelClassName)
  const wrapperClasses = classNames(
    'Layer__checkbox-wrapper',
    `Layer__checkbox--${boxSize}`,
    `Layer__checkbox--${variant}`,
    className,
  )

  return (
    <div className={wrapperClasses}>
      <Tooltip disabled={!tooltip}>
        <TooltipTrigger className='Layer__input-tooltip'>
          <input type='checkbox' className={checkboxClasses} {...props} />
          {label && <label className={labelClasses}>{label}</label>}
        </TooltipTrigger>
        <TooltipContent className='Layer__tooltip'>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  )
}
