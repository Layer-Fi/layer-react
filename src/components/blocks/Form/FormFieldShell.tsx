import { type PropsWithChildren, type ReactNode, useContext, useId, useMemo } from 'react'
import classNames from 'classnames'
import { FieldErrorContext } from 'react-aria-components/FieldError'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { useFieldContext } from '@hooks/features/forms/useForm'
import { FieldError } from '@ui/Form/Form'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import './formField.scss'

const FORM_FIELD_CLASS_NAME = 'Layer__FormField'
const FIELD_ERROR_CLASS_NAME = 'Layer__UI__FieldError'

type FormFieldLayoutProps = Pick<CommonFormFieldProps, 'className' | 'inline' | 'align' | 'showLabel'>

export function formFieldLayoutProps({ className, inline = false, align = 'start', showLabel = true }: FormFieldLayoutProps) {
  return {
    className: classNames(FORM_FIELD_CLASS_NAME, className),
    // A hidden label leaves the inline layout with an empty first column and its column gap, so
    // the field falls back to the stacked single column.
    ...toDataProperties({ inline: inline && showLabel, align: align === 'center' ? align : undefined }),
  }
}

// `FieldError` renders nothing outside a react-aria field that publishes validation state, which
// rules out the standalone Checkbox and Switch.
export function FormFieldError({ children }: PropsWithChildren) {
  const validation = useContext(FieldErrorContext)

  if (validation) return <FieldError>{children}</FieldError>

  return <span slot='errorMessage' className={FIELD_ERROR_CLASS_NAME}>{children}</span>
}

type FormFieldShellProps = {
  name: string
  label: string
  labelId?: string
  showLabel: boolean
  showFieldError: boolean
  errorMessage?: string
  slots?: { LabelIcon?: ReactNode }
}

export function FormFieldShell({
  name,
  label,
  labelId,
  showLabel,
  showFieldError,
  errorMessage,
  slots,
  children,
}: PropsWithChildren<FormFieldShellProps>) {
  const labelNode = <Label slot={slots?.LabelIcon ? undefined : 'label'} size='sm' id={labelId} htmlFor={name}>{label}</Label>

  return (
    <>
      {showLabel && (
        slots?.LabelIcon
          ? (
            <HStack slot='label' gap='xs' align='center'>
              {slots.LabelIcon}
              {labelNode}
            </HStack>
          )
          : labelNode
      )}
      {children}
      {showFieldError && errorMessage && <FormFieldError>{errorMessage}</FormFieldError>}
    </>
  )
}

export function useFormField({
  label,
  className,
  inline = false,
  align = 'start',
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
  isDisabled = false,
  errorText,
}: CommonFormFieldProps) {
  const { name, state } = useFieldContext<unknown>()
  const { errors, isValid } = state.meta

  const labelId = useId()
  const errorMessage = errorText ?? (errors[0] as string | undefined)

  return useMemo(() => ({
    name,
    isInvalid: !isValid || Boolean(errorText),
    errorMessage,
    labelId,
    rootProps: {
      isReadOnly,
      isDisabled,
      ...formFieldLayoutProps({ className, inline, align, showLabel }),
      ...(!showLabel && { 'aria-label': label }),
    },
    shellProps: { name, label, showLabel, showFieldError, errorMessage },
  }), [
    align,
    className,
    errorMessage,
    errorText,
    inline,
    isDisabled,
    isReadOnly,
    isValid,
    label,
    labelId,
    name,
    showFieldError,
    showLabel,
  ])
}
