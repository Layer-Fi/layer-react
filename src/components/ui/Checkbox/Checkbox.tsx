import { Check, Minus } from 'lucide-react'
import { useMemo } from 'react'
import { Checkbox as ReactAriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components'
import { withRenderProp } from '../../utility/withRenderProp'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { DeprecatedTooltip, DeprecatedTooltipTrigger, DeprecatedTooltipContent } from '../../Tooltip'
import classNames from 'classnames'
import './checkbox.scss'

const CLASS_NAME = 'Layer__Checkbox'

type CheckboxVariant = 'default' | 'success' | 'error'
type CheckboxSize = 'sm' | 'md' | 'lg'

const CHECK_SIZE = {
  sm: 10,
  md: 12,
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

export function Checkbox({ children, className, variant = 'default', size = 'md', isIndeterminate, ...props }: CheckboxProps) {
  const dataProperties = useMemo(() => toDataProperties({
    size,
    variant,
    labeled: typeof children === 'string' && children.length > 0,
  }), [children, size, variant])

  return (
    <ReactAriaCheckbox
      {...dataProperties}
      {...props}
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
}

export function CheckboxWithTooltip({ tooltip, ...props }: CheckboxWithTooltipProps) {
  return (
    <div className='Layer__checkbox-wrapper'>
      <DeprecatedTooltip disabled={!tooltip}>
        <DeprecatedTooltipTrigger className='Layer__input-tooltip'>
          <Checkbox {...props} />
        </DeprecatedTooltipTrigger>
        <DeprecatedTooltipContent className='Layer__tooltip'>{tooltip}</DeprecatedTooltipContent>
      </DeprecatedTooltip>
    </div>
  )
}
