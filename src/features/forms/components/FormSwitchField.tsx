import { type PropsWithChildren, type ReactNode } from 'react'
import classNames from 'classnames'

import { HStack } from '@ui/Stack/Stack'
import { Switch } from '@ui/Switch/Switch'
import { Label } from '@ui/Typography/Text'
import { useFieldContext } from '@features/forms/hooks/useForm'
import type { CommonFormFieldProps } from '@features/forms/types'

import './formSwitchField.scss'

export type FormSwitchFieldProps = CommonFormFieldProps & {
  slot?: {
    LabelIcon?: ReactNode
  }
}
const FORM_SWITCH_FIELD_CLASSNAME = 'Layer__FormSwitchField'
export function FormSwitchField({
  label,
  slot,
  className,
  inline = false,
  showLabel = true,
  isReadOnly = false,
}: PropsWithChildren<FormSwitchFieldProps>) {
  const field = useFieldContext<boolean>()

  const { name, state, handleChange } = field
  const { value } = state

  const additionalAriaProps = !showLabel && { 'aria-label': label }

  const switchClassNames = classNames(
    FORM_SWITCH_FIELD_CLASSNAME,
    inline && `${FORM_SWITCH_FIELD_CLASSNAME}--inline`,
    className,
  )

  return (
    <Switch
      className={switchClassNames}
      isSelected={value}
      onChange={handleChange}
      name={name}
      isReadOnly={isReadOnly}
      slot='switch'
      {...additionalAriaProps}
    >
      {showLabel
        && (
          <HStack slot='label' gap='xs' align='center'>
            {slot?.LabelIcon}
            <Label size='sm' htmlFor={name}>{label}</Label>
          </HStack>
        )}
    </Switch>
  )
}
