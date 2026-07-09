import { type ComponentRef, forwardRef, useMemo } from 'react'
import classNames from 'classnames'
import { Check, Minus } from 'lucide-react'
import {
  Checkbox as ReactAriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components/Checkbox'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'
import { withRenderProp } from '@components/utility/withRenderProp'

import './checkbox.scss'

const CLASS_NAME = 'Layer__Checkbox'

type CheckboxVariant = 'default' | 'success' | 'round' | 'error'
type CheckboxSize = 'sm' | 'md' | 'lg'

const CHECK_SIZE = {
  sm: 12,
  md: 14,
  lg: 16,
}

type CheckboxProps = Omit<AriaCheckboxProps, 'className'> & {
  className?: string
  variant?: CheckboxVariant
  size?: CheckboxSize
}

type CheckboxWithTooltipProps = CheckboxProps & {
  tooltip?: string
}

export const Checkbox = forwardRef<ComponentRef<typeof ReactAriaCheckbox>, CheckboxProps>(function Checkbox({ children, className, variant = 'default', size = 'sm', isIndeterminate, ...props }, ref) {
  const dataProperties = useMemo(() => toDataProperties({
    size,
    variant,
    labeled: typeof children === 'string' && children.length > 0,
  }), [children, size, variant])

  return (
    <ReactAriaCheckbox
      {...dataProperties}
      {...props}
      ref={ref}
      isIndeterminate={isIndeterminate}
      className={classNames(CLASS_NAME, className)}
    >
      {withRenderProp(children, node => (
        <>
          <div slot='checkbox'>
            {isIndeterminate
              ? <Minus size={CHECK_SIZE[size]} />
              : <Check size={CHECK_SIZE[size]} />}
          </div>
          {node}
        </>
      ))}
    </ReactAriaCheckbox>
  )
})

export function CheckboxWithTooltip({ tooltip, ...props }: CheckboxWithTooltipProps) {
  return (
    <Tooltip isDisabled={!tooltip}>
      <TooltipTrigger variant='fit-content' asChild>
        <Checkbox {...props} />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
