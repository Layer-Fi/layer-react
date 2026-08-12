import { type ReactNode, useId } from 'react'

import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { formFieldLayoutProps } from '@blocks/Form/FormFieldShell'
import { legacyClassNames } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

type ComboBoxControlProps = {
  'slot': 'input'
  'inputId': string
  'aria-label'?: string
}

export type ComboBoxFieldProps = Pick<CommonFormFieldProps, 'label' | 'className' | 'inline' | 'showLabel'> & {
  // Only when a caller renders its own label outside the field and owns the association.
  inputId?: string
  children: (controlProps: ComboBoxControlProps) => ReactNode
}

// A combobox is react-select rather than a react-aria field, so it can't associate its own label.
export function ComboBoxField({ label, className, inline, showLabel = true, inputId: providedInputId, children }: ComboBoxFieldProps) {
  const generatedInputId = useId()
  const inputId = providedInputId ?? generatedInputId

  return (
    <VStack {...formFieldLayoutProps({ className, inline, showLabel })}>
      {showLabel && <Label slot='label' className={legacyClassNames('field:label')} htmlFor={inputId} size='sm'>{label}</Label>}
      {children({ 'slot': 'input', inputId, 'aria-label': showLabel ? undefined : label })}
    </VStack>
  )
}
