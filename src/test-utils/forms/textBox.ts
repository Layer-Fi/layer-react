import { type FieldName, type FormFillerContext } from '@test-utils/forms/types'

type TextBoxFillArgs = {
  field: FieldName
  value: number | string
}

export const setTextBoxValue = async (
  { ui, user }: FormFillerContext,
  { field, value }: TextBoxFillArgs,
) => {
  const input = ui.getByRole('textbox', { name: field })

  await user.clear(input)

  const textValue = String(value)
  if (textValue !== '') {
    await user.type(input, textValue)
  }

  return input
}
