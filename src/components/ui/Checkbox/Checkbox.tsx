import { Check } from 'lucide-react'
import React, { ReactNode, useMemo } from 'react'
import { Checkbox as ReactAriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components'
import { withRenderProp } from '../../utility/withRenderProp'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const CLASS_NAME = 'Layer__Checkbox'

type CheckboxProps = Omit<AriaCheckboxProps, 'className'>

export function Checkbox({ children, ...props }: CheckboxProps) {
  const dataProperties = useMemo(() => toDataProperties({
    labeled: typeof children === 'string' && children.length > 0,
  }), [children])

  return (
    <ReactAriaCheckbox
      {...dataProperties}
      {...props}
      className={CLASS_NAME}
    >
      {withRenderProp(children, node => (
        <>
          <div slot='checkbox'>
            <Check size={16} />
          </div>
          {node}
        </>
      ))}
    </ReactAriaCheckbox>
  )
}
