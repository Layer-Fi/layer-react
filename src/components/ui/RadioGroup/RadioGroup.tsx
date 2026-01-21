import { useMemo } from 'react'
import classNames from 'classnames'
import { Circle } from 'lucide-react'
import {
  Radio as ReactAriaRadio,
  RadioGroup as ReactAriaRadioGroup,
  type RadioGroupProps as ReactAriaRadioGroupProps,
  type RadioProps as ReactAriaRadioProps,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { withRenderProp } from '@components/utility/withRenderProp'

import './radioGroup.scss'

const RADIO_GROUP_CLASS_NAME = 'Layer__RadioGroup'
const RADIO_CLASS_NAME = 'Layer__Radio'

type RadioSize = 'sm' | 'md' | 'lg'

const INDICATOR_SIZE = {
  sm: 8,
  md: 10,
  lg: 12,
}

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
  size?: RadioSize
  value: T
}

export function Radio<T extends string>({
  children,
  className,
  size = 'sm',
  ...restProps
}: RadioProps<T>) {
  const dataProperties = useMemo(() => toDataProperties({
    size,
    labeled: typeof children === 'string' && children.length > 0,
  }), [children, size])

  return (
    <ReactAriaRadio
      {...restProps}
      {...dataProperties}
      className={classNames(RADIO_CLASS_NAME, className)}
    >
      {withRenderProp(children, node => (
        <>
          <div slot='radio'>
            <Circle size={INDICATOR_SIZE[size]} />
          </div>
          {node}
        </>
      ))}
    </ReactAriaRadio>
  )
}
