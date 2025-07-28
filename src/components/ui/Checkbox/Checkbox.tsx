import { Check } from 'lucide-react'
import { useMemo } from 'react'
import { Checkbox as ReactAriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components'
import { withRenderProp } from '../../utility/withRenderProp'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { Tooltip, TooltipTrigger, TooltipContent } from '../../Tooltip'
import classNames from 'classnames'

const CLASS_NAME = 'Layer__Checkbox'

type CheckboxVariant = 'default' | 'success' | 'error'
type CheckboxSize = 'md' | 'lg'

type CheckboxProps = Omit<AriaCheckboxProps, 'className'> & {
  className?: string
  variant?: CheckboxVariant
  size?: CheckboxSize
}

type CheckboxWithTooltipProps = CheckboxProps & {
  tooltip?: string
}

export function Checkbox({ children, className, variant = 'default', size = 'md', ...props }: CheckboxProps) {
  const dataProperties = useMemo(() => toDataProperties({
    size,
    variant,
    labeled: typeof children === 'string' && children.length > 0,
  }), [children, size, variant])

  return (
    <ReactAriaCheckbox
      {...dataProperties}
      {...props}
      className={classNames(CLASS_NAME, className)}
    >
      {withRenderProp(children, node => (
        <>
          <div slot='checkbox'>
            <Check size={size === 'lg' ? 16 : 12} />
          </div>
          {node}
        </>
      ))}
    </ReactAriaCheckbox>
  )
}

export function CheckboxWithTooltip({ tooltip, ...props }: CheckboxWithTooltipProps) {
  return (
    <div className='Layer__checkbox-wrapper'>
      <Tooltip disabled={!tooltip}>
        <TooltipTrigger className='Layer__input-tooltip'>
          <Checkbox {...props} />
        </TooltipTrigger>
        <TooltipContent className='Layer__tooltip'>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  )
}
