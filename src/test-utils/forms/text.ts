import { setTextBoxValue } from '@test-utils/forms/textBox'
import { type FormFillerContext, type TextFillArgs } from '@test-utils/forms/types'

export function createTextFiller(context: FormFillerContext) {
  return (args: TextFillArgs) => {
    return setTextBoxValue(context, args)
  }
}
