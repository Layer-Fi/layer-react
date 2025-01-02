import { Check } from 'lucide-react'
import React, { ReactNode } from 'react'
import { Checkbox as ReactAriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components'
import { withRenderProp } from '../../utility/withRenderProp'

const CLASS_NAME = 'Layer__Checkbox'

type CheckboxProps = Omit<AriaCheckboxProps, 'className'>

export function Checkbox({ children, ...props }: CheckboxProps) {
  return (
    <ReactAriaCheckbox {...props} className={CLASS_NAME}>
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
