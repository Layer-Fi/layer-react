import { setTextBoxValue } from '@testUtils/forms/textBox'
import { type FormFillerContext, type NumberFillArgs } from '@testUtils/forms/types'

export function createNumberFiller(context: FormFillerContext) {
  return async (args: NumberFillArgs) => {
    const input = await setTextBoxValue(context, args)

    await context.user.tab()

    return input
  }
}
