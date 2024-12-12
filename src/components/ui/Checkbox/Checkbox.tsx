import { Check } from 'lucide-react'
import React from 'react'
import { Checkbox as ReactAriaCheckbox, type CheckboxProps } from 'react-aria-components'

const CLASS_NAME = 'Layer__Checkbox'

export function Checkbox({ children, ...props }: Omit<CheckboxProps, 'className'>) {
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
