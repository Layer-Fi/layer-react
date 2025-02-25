import { Check } from 'lucide-react'
import { useMemo } from 'react'
import { Checkbox as ReactAriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components'
import { withRenderProp } from '../../utility/withRenderProp'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { Tooltip, TooltipTrigger, TooltipContent } from '../../Tooltip'
import classNames from 'classnames'

const CLASS_NAME = 'Layer__Checkbox'

type CheckboxVariant = 'default' | 'dark'
type CheckboxSize = 'md' | 'lg'

type CheckboxProps = Omit<AriaCheckboxProps, 'className'> & {
  className?: string
  variant?: CheckboxVariant
  size?: CheckboxSize
  tooltip?: string
}

export function Checkbox({ children, className, variant = 'default', size = 'md', tooltip, ...props }: CheckboxProps) {
  const dataProperties = useMemo(() => toDataProperties({
    size,
    variant,
    labeled: typeof children === 'string' && children.length > 0,
  }), [children, size, variant])

  return (
    <div className='Layer__checkbox-wrapper'>
      <Tooltip disabled={!tooltip}>
        <TooltipTrigger className='Layer__input-tooltip'>
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
        </TooltipTrigger>
        <TooltipContent className='Layer__tooltip'>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  )
}
