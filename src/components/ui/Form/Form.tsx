import { forwardRef } from 'react'
import classNames from 'classnames'
import {
  FieldError as ReactAriaFieldError,
  type FieldErrorProps as ReactAriaFieldErrorProps,
  Form as ReactAriaForm,
  type FormProps as ReactAriaFormProps,
  TextField as ReactAriaTextField,
  type TextFieldProps as ReactAriaTextFieldProps,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { withRenderProp } from '@components/utility/withRenderProp'

import './form.scss'

const FORM_CLASS_NAME = 'Layer__UI__Form'
export const Form = forwardRef<HTMLFormElement, ReactAriaFormProps>(
  function Form({ children, className, ...restProps }, ref) {
    return (
      <ReactAriaForm {...restProps} className={classNames(FORM_CLASS_NAME, className)} ref={ref}>
        {children}
      </ReactAriaForm>
    )
  },
)

const TEXT_FIELD_CLASS_NAME = 'Layer__UI__TextField'
export type TextFieldProps = ReactAriaTextFieldProps & {
  inline?: boolean
  textarea?: boolean
}
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField({ children, inline, textarea, className, ...restProps }, ref) {
    const dataProperties = toDataProperties({ inline, textarea })

    return (
      <ReactAriaTextField {...restProps} {...dataProperties} className={classNames(TEXT_FIELD_CLASS_NAME, className)} ref={ref}>
        {withRenderProp(children, node => node)}
      </ReactAriaTextField>
    )
  },
)

const FIELD_ERROR_CLASS_NAME = 'Layer__UI__FieldError'
type FieldErrorProps = Omit<ReactAriaFieldErrorProps, 'className'>
export const FieldError = forwardRef<HTMLElement, FieldErrorProps>(
  function FieldError({ children }, ref) {
    return (
      <ReactAriaFieldError className={FIELD_ERROR_CLASS_NAME} ref={ref}>
        {withRenderProp(children, node => node)}
      </ReactAriaFieldError>
    )
  },
)
