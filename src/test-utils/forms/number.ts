import { type FormFillerContext, type NumberFillArgs } from '@test-utils/forms/types'

export function createNumberFiller({ ui, user }: FormFillerContext) {
  return async ({ field, value }: NumberFillArgs) => {
    const input = ui.getByRole('spinbutton', { name: field })

    await user.clear(input)

    const textValue = String(value)
    if (textValue !== '') {
      await user.type(input, textValue)
    }

    await user.tab()

    return input
  }
}
