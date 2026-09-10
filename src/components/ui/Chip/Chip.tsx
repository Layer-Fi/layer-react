import { type ForwardedRef, forwardRef } from 'react'
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
  'className' | 'value' | 'defaultValue' | 'onChange' | 'isReadOnly' | 'isInvalid'
> & {
  ariaLabel: string
  wrap?: boolean
  value?: T | null
  defaultValue?: T
  onChange?: (value: T) => void
}

function ChipGroupWithRef<T extends string>(
  { ariaLabel, children, onChange, wrap = true, ...restProps }: ChipGroupProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const dataProperties = toDataProperties({ wrap })

  return (
    <ReactAriaRadioGroup
      {...restProps}
      {...dataProperties}
      aria-label={ariaLabel}
      orientation='horizontal'
      onChange={onChange as ((value: string) => void) | undefined}
      className={CHIP_GROUP_CLASS_NAME}
      ref={ref}
    >
      {children}
    </ReactAriaRadioGroup>
  )
}

export const ChipGroup = forwardRef(ChipGroupWithRef) as <T extends string>(
  props: ChipGroupProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => React.ReactElement

export type ChipSize = 'sm' | 'md'

type ChipProps<T extends string> = Omit<ReactAriaRadioProps, 'className' | 'value'> & {
  size?: ChipSize
  value: T
}

function ChipWithRef<T extends string>(
  { children, size = 'md', ...restProps }: ChipProps<T>,
  ref: ForwardedRef<HTMLLabelElement>,
) {
  const dataProperties = toDataProperties({ size })

  return (
    <ReactAriaRadio
      {...restProps}
      {...dataProperties}
      className={CHIP_CLASS_NAME}
      ref={ref}
    >
      {withRenderProp(children, node => node)}
    </ReactAriaRadio>
  )
}

export const Chip = forwardRef(ChipWithRef) as <T extends string>(
  props: ChipProps<T> & { ref?: ForwardedRef<HTMLLabelElement> },
) => React.ReactElement
