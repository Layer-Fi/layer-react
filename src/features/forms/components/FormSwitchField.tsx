import { type PropsWithChildren, type ReactNode } from 'react'
import classNames from 'classnames'

import { HStack } from '@ui/Stack/Stack'
import { Switch } from '@ui/Switch/Switch'
import { Label } from '@ui/Typography/Text'
import { useFieldContext } from '@features/forms/hooks/useForm'
import type { CommonFormFieldProps } from '@features/forms/types'

import './formSwitchField.scss'

export type FormSwitchFieldProps = CommonFormFieldProps & {
  labelIcon?: ReactNode
}
const FORM_SWITCH_FIELD_CLASSNAME = 'Layer__FormSwitchField'
export function FormSwitchField({
  label,
  labelIcon,
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
      {showLabel && (
        <Label slot='label' size='sm' htmlFor={name}>
          <HStack className={`${FORM_SWITCH_FIELD_CLASSNAME}__LabelContent`} align='center' gap='2xs'>
            {labelIcon && (
              <HStack className={`${FORM_SWITCH_FIELD_CLASSNAME}__LabelIcon`} align='center'>
                {labelIcon}
              </HStack>
            )}
            {label}
          </HStack>
        </Label>
      )}
    </Switch>
  )
}
