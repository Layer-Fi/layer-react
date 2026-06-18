import { type FormFillerContext, type TextFillArgs } from '@test-utils/forms/types'

export const setTextBoxValue = async (
  { ui, user }: FormFillerContext,
  { field, value }: TextFillArgs,
) => {
  const input = ui.getByRole('textbox', { name: field })

  await user.clear(input)

  const textValue = String(value)
  if (textValue !== '') {
    await user.type(input, textValue)
  }

  return input
}
