import { type BoundFunctions, type queries } from '@testing-library/react'
import { type UserEvent } from '@testing-library/user-event'

export type FieldName = string | RegExp

export type FormQueries = BoundFunctions<typeof queries>

export type FormFillerContext = {
  ui: FormQueries
  user: UserEvent
}

export type TextFillArgs = {
  field: FieldName
  value: string
}

export type NumberFillArgs = {
  field: FieldName
  value: number | string
}

export type CheckboxFillArgs = {
  field: FieldName
  checked: boolean
}

export type ToggleFillArgs = {
  field: FieldName
  on: boolean
}

export type RadioFillArgs = {
  field?: FieldName
  option: FieldName
}

export type ComboBoxFillArgs = {
  field: FieldName
  option: FieldName
}

export type FillFormSpec =
  | ({ kind: 'text' } & TextFillArgs)
  | ({ kind: 'number' } & NumberFillArgs)
  | ({ kind: 'checkbox' } & CheckboxFillArgs)
  | ({ kind: 'toggle' } & ToggleFillArgs)
  | ({ kind: 'radio' } & RadioFillArgs)
  | ({ kind: 'comboBox' } & ComboBoxFillArgs)
