import classNames from 'classnames'
import {
  CheckboxGroup as ReactAriaCheckboxGroup,
  type CheckboxGroupProps as ReactAriaCheckboxGroupProps,
} from 'react-aria-components/CheckboxGroup'

import './checkboxGroup.scss'

const CLASS_NAME = 'Layer__CheckboxGroup'

type CheckboxGroupProps<T extends string> = Omit<ReactAriaCheckboxGroupProps, 'className' | 'value' | 'defaultValue' | 'onChange'> & {
  className?: string
  value?: T[]
  defaultValue?: T[]
  onChange?: (value: T[]) => void
}

export function CheckboxGroup<T extends string>({
  children,
  className,
  onChange,
  ...restProps
}: CheckboxGroupProps<T>) {
  return (
    <ReactAriaCheckboxGroup
      {...restProps}
      // react-aria reports plain strings; every value it reports is one of the `T` checkboxes rendered inside.
      onChange={onChange as ((value: string[]) => void) | undefined}
      className={classNames(CLASS_NAME, className)}
    >
      {children}
    </ReactAriaCheckboxGroup>
  )
}
