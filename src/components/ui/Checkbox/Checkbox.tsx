import { Check } from 'lucide-react'
import React, { ReactNode } from 'react'
import { Checkbox as ReactAriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components'

const CLASS_NAME = 'Layer__Checkbox'

export type CheckboxProps = Omit<AriaCheckboxProps, 'className' | 'children'> & { children?: ReactNode | ReactNode[] }

export function Checkbox({ children, ...props }: CheckboxProps) {
  return (
    <ReactAriaCheckbox {...props} className={CLASS_NAME}>
      {() => (
        <>
          <div slot='checkbox'>
            <Check />
          </div>
          {children}
        </>
      )}
    </ReactAriaCheckbox>
  )
}
