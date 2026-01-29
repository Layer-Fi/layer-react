import classNames from 'classnames'
import { Circle } from 'lucide-react'
import {
  Radio as ReactAriaRadio,
  RadioGroup as ReactAriaRadioGroup,
  type RadioGroupProps as ReactAriaRadioGroupProps,
  type RadioProps as ReactAriaRadioProps,
} from 'react-aria-components'

import { withRenderProp } from '@components/utility/withRenderProp'

import './radioGroup.scss'

const RADIO_GROUP_CLASS_NAME = 'Layer__RadioGroup'
const RADIO_CLASS_NAME = 'Layer__Radio'

const INDICATOR_SIZE = 10

type RadioGroupProps<T extends string> = Omit<ReactAriaRadioGroupProps, 'className' | 'value' | 'defaultValue' | 'onChange'> & {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}

export function RadioGroup<T extends string>({
  children,
  className,
  onChange,
  ...restProps
}: RadioGroupProps<T>) {
  return (
    <ReactAriaRadioGroup
      {...restProps}
      onChange={onChange as ((value: string) => void) | undefined}
      className={classNames(RADIO_GROUP_CLASS_NAME, className)}
    >
      {children}
    </ReactAriaRadioGroup>
  )
}

type RadioProps<T extends string> = Omit<ReactAriaRadioProps, 'className' | 'value'> & {
  className?: string
  value: T
}

export function Radio<T extends string>({
  children,
  className,
  ...restProps
}: RadioProps<T>) {
  return (
    <ReactAriaRadio
      {...restProps}
      className={classNames(RADIO_CLASS_NAME, className)}
    >
      {withRenderProp(children, node => (
        <>
          <div slot='radio'>
            <Circle size={INDICATOR_SIZE} />
          </div>
          {node}
        </>
      ))}
    </ReactAriaRadio>
  )
}
