import { setTextBoxValue } from '@test-utils/forms/textBox'
import { type FormFillerContext, type NumberFillArgs } from '@test-utils/forms/types'

export function createNumberFiller(context: FormFillerContext) {
  return async (args: NumberFillArgs) => {
    const input = await setTextBoxValue(context, args)

    await context.user.tab()

    return input
  }
}
