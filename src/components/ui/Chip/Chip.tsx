import classNames from 'classnames'
import {
  Radio as ReactAriaRadio,
  RadioGroup as ReactAriaRadioGroup,
  type RadioGroupProps as ReactAriaRadioGroupProps,
  type RadioProps as ReactAriaRadioProps,
} from 'react-aria-components/RadioGroup'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { withRenderProp } from '@components/utility/withRenderProp'

import './chip.scss'

const CHIP_GROUP_CLASS_NAME = 'Layer__UI__ChipGroup'
const CHIP_CLASS_NAME = 'Layer__UI__Chip'

type ChipGroupProps<T extends string> = Omit<
  ReactAriaRadioGroupProps,
  'className' | 'value' | 'defaultValue' | 'onChange'
> & {
  ariaLabel: string
  wrap?: boolean
  value?: T | null
  onChange?: (value: T) => void
}

export function ChipGroup<T extends string>({
  ariaLabel,
  children,
  onChange,
  value,
  wrap,
  ...restProps
}: ChipGroupProps<T>) {
  const dataProperties = toDataProperties({ wrap })

  return (
    <ReactAriaRadioGroup
      {...restProps}
      {...dataProperties}
      aria-label={ariaLabel}
      value={value}
      onChange={onChange as ((value: string) => void) | undefined}
      className={CHIP_GROUP_CLASS_NAME}
    >
      {children}
    </ReactAriaRadioGroup>
  )
}

export type ChipSize = 'sm' | 'md'

type ChipProps<T extends string> = Omit<ReactAriaRadioProps, 'className' | 'value'> & {
  size?: ChipSize
  value: T
}

export function Chip<T extends string>({ children, size = 'md', ...restProps }: ChipProps<T>) {
  const dataProperties = toDataProperties({ size })

  return (
    <ReactAriaRadio
      {...restProps}
      {...dataProperties}
      className={classNames(CHIP_CLASS_NAME)}
    >
      {withRenderProp(children, node => node)}
    </ReactAriaRadio>
  )
}
