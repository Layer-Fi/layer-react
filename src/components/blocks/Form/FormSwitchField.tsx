import { type ReactNode } from 'react'
import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { Switch } from '@ui/Switch/Switch'
import { FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import { useFieldContext } from './formContexts'

/* The inline variant is a data attribute now, so the modifier needs its base name alongside it. */
const legacyClassNames = createLegacyClassNames({
  'switch:root': 'Layer__FormSwitchField',
  'switch:inline': ['Layer__FormSwitchField', 'Layer__FormSwitchField--inline'],
})

export type FormSwitchFieldProps = CommonFormFieldProps & {
  slots?: {
    LabelIcon?: ReactNode
  }
}

export function FormSwitchField({ slots, ...props }: FormSwitchFieldProps) {
  const field = useFieldContext<boolean>()

  const { state, handleChange, handleBlur } = field
  const { value } = state

  const { name, isInvalid, rootProps, shellProps } = useFormField(props)

  return (
    <Switch
      {...rootProps}
      className={classNames(rootProps.className, legacyClassNames(props.inline ? 'switch:inline' : 'switch:root'))}
      isInvalid={isInvalid}
      isSelected={value}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
    >
      <FormFieldShell {...shellProps} slots={slots} />
    </Switch>
  )
}
